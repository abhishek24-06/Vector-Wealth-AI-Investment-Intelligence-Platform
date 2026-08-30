"""
Historical Data Ingestion Pipeline - Local Embeddings Version.

Ingests IndianFinancialNews.csv into ChromaDB using local Sentence Transformers.
- Article-level embeddings (no chunking)
- Idempotent: skips already-ingested articles via deterministic IDs
- Resumable: tracks progress, can resume from interruption
- No API quota limits
"""
from __future__ import annotations

import json
import math
import os
import time
from pathlib import Path
from typing import Iterable

import chromadb
import pandas as pd
from dotenv import load_dotenv

from embedding_service import (
    CHROMA_COLLECTION_NAME,
    DB_PATH,
    build_document_id,
    build_document_text,
    embed_texts,
    get_chroma_collection,
    get_collection_stats,
)
from stock_data import STOCK_ALIASES

ROOT_DIR = Path(__file__).resolve().parent.parent
ENV_PATH = ROOT_DIR / ".env"
CSV_PATH = ROOT_DIR / "data" / "IndianFinancialNews.csv"
STATE_PATH = DB_PATH / "historical_ingest_state.json"

BATCH_SIZE = 100
MIN_DESCRIPTION_CHARS = 40
EMBED_BATCH_SIZE = 64

# Progress reporting
PROGRESS_REPORT_EVERY = 10


def iter_batches(df: pd.DataFrame, batch_size: int) -> Iterable[pd.DataFrame]:
    total = len(df)
    for start in range(0, total, batch_size):
        yield df.iloc[start : start + batch_size]


def normalize_dataframe(raw_df: pd.DataFrame) -> pd.DataFrame:
    df = raw_df.copy()
    df.columns = [str(col).strip() for col in df.columns]

    unnamed_columns = [col for col in df.columns if col.startswith("Unnamed") or col == ""]
    if unnamed_columns:
        df = df.drop(columns=unnamed_columns, errors="ignore")

    required_cols = {"Date", "Title", "Description"}
    missing = required_cols - set(df.columns)
    if missing:
        raise ValueError(f"CSV is missing columns: {missing}")

    for col in ["Date", "Title", "Description"]:
        df[col] = df[col].fillna("").astype(str).str.replace(r"\s+", " ", regex=True).str.strip()

    df = df[df["Description"].str.len() >= MIN_DESCRIPTION_CHARS]
    df = df[df["Title"].str.len() > 0]
    df = df[df["Date"].str.len() > 0]

    df = df.drop_duplicates(subset=["Date", "Title", "Description"], keep="first")
    return df.reset_index(drop=True)


def _normalize_text(value: str) -> str:
    import re
    return re.sub(r"[^a-z0-9 ]+", " ", (value or "").lower()).strip()


def _contains_alias(haystack: str, alias: str) -> bool:
    import re
    normalized_alias = _normalize_text(alias)
    if not normalized_alias:
        return False
    if " " in normalized_alias:
        return normalized_alias in haystack
    return re.search(rf"\b{re.escape(normalized_alias)}\b", haystack) is not None


def _detect_ticker_tags(title: str, description: str) -> list[str]:
    """Detect ticker tags from title and description using STOCK_ALIASES."""
    haystack = _normalize_text(f"{title} {description}")
    if not haystack:
        return []

    detected: list[str] = []
    for symbol, aliases in STOCK_ALIASES.items():
        if _contains_alias(haystack, symbol.lower()):
            detected.append(symbol)
            continue

        for alias in aliases:
            if _contains_alias(haystack, alias):
                detected.append(symbol)
                break

    return sorted(set(detected))


def load_state() -> dict:
    """Load ingestion progress state."""
    if not STATE_PATH.exists():
        return {
            "last_processed_index": -1,
            "total_ingested": 0,
            "total_skipped": 0,
            "total_errors": 0,
            "completed": False,
        }
    try:
        return json.loads(STATE_PATH.read_text(encoding="utf-8"))
    except Exception:
        return {
            "last_processed_index": -1,
            "total_ingested": 0,
            "total_skipped": 0,
            "total_errors": 0,
            "completed": False,
        }


def save_state(state: dict) -> None:
    """Save ingestion progress state."""
    STATE_PATH.parent.mkdir(parents=True, exist_ok=True)
    STATE_PATH.write_text(json.dumps(state, indent=2), encoding="utf-8")


def ingest(dry_run: bool = False, reset: bool = False) -> None:
    """
    Main ingestion function.
    
    Args:
        dry_run: If True, show what would be done without modifying database
        reset: If True, start from beginning (ignore saved state)
    """
    load_dotenv(ENV_PATH)

    if not CSV_PATH.exists():
        raise FileNotFoundError(f"CSV not found: {CSV_PATH}")

    # Print collection stats before ingestion
    stats = get_collection_stats()
    print(f"[Ingest] Collection: {stats['collection_name']}")
    print(f"[Ingest] Current documents: {stats['document_count']}")
    print(f"[Ingest] Embedding model: {stats['embedding_model']} ({stats['embedding_dimension']} dim)")
    print(f"[Ingest] DB path: {stats['db_path']}")

    raw_df = pd.read_csv(CSV_PATH)
    raw_rows = len(raw_df)
    df = normalize_dataframe(raw_df)

    if df.empty:
        raise RuntimeError("No valid rows left after CSV cleaning. Check dataset quality rules.")

    print(f"[Ingest] Loaded {raw_rows} rows; retained {len(df)} rows after cleaning and deduplication.")

    if dry_run:
        print("[Ingest] DRY RUN - would process the following:")
        print(f"  - Total articles to embed: {len(df)}")
        print(f"  - Batch size: {BATCH_SIZE}")
        print(f"  - Embedding batch size: {EMBED_BATCH_SIZE}")
        return

    collection = get_chroma_collection()
    state = load_state() if not reset else {"last_processed_index": -1, "total_ingested": 0, "total_skipped": 0, "total_errors": 0, "completed": False}

    start_index = state.get("last_processed_index", -1) + 1
    if start_index >= len(df):
        print("[Ingest] Already completed (state shows all rows processed). Use --reset to re-ingest.")
        return

    if start_index > 0:
        print(f"[Ingest] Resuming from row {start_index} (previously processed {start_index} rows)")

    total_rows = len(df)
    total_ingested = state.get("total_ingested", 0)
    total_skipped = state.get("total_skipped", 0)
    total_errors = state.get("total_errors", 0)

    start_time = time.time()

    for batch_idx, batch_df in enumerate(iter_batches(df.iloc[start_index:], BATCH_SIZE), start=1):
        global_batch_idx = start_index // BATCH_SIZE + batch_idx
        
        documents: list[str] = []
        metadatas: list[dict] = []
        ids: list[str] = []
        row_indices: list[int] = []

        # Prepare batch
        for row_idx, row in batch_df.iterrows():
            date_value = str(row.get("Date", ""))
            title_value = str(row.get("Title", ""))
            description_value = str(row.get("Description", ""))

            # Build deterministic ID for idempotency
            doc_id = build_document_id("csv", title_value, date_value, str(row_idx))

            # Check if already exists in ChromaDB
            existing = collection.get(ids=[doc_id], include=[])
            if existing.get("ids"):
                total_skipped += 1
                continue

            ticker_tags = _detect_ticker_tags(title_value, description_value)

            document_text = build_document_text(title_value, description_value, ticker_tags)

            documents.append(document_text)
            ids.append(doc_id)
            metadatas.append({
                "Date": date_value,
                "Title": title_value,
                "Description": description_value,
                "source": "historical_csv",
                "source_row": int(row_idx),
                "ticker_tags": ",".join(ticker_tags),
            })
            row_indices.append(int(row_idx))

        if not documents:
            # All items in this batch were already ingested
            last_processed = start_index + batch_idx * BATCH_SIZE - 1
            state["last_processed_index"] = min(last_processed, total_rows - 1)
            state["total_ingested"] = total_ingested
            state["total_skipped"] = total_skipped
            state["total_errors"] = total_errors
            save_state(state)
            continue

        # Embed documents
        try:
            embeddings = embed_texts(documents)
        except Exception as e:
            print(f"[Ingest] ERROR embedding batch {global_batch_idx}: {e}")
            total_errors += len(documents)
            # Save progress and continue
            last_processed = start_index + batch_idx * BATCH_SIZE - 1
            state["last_processed_index"] = min(last_processed, total_rows - 1)
            state["total_ingested"] = total_ingested
            state["total_skipped"] = total_skipped
            state["total_errors"] = total_errors
            save_state(state)
            continue

        # Add to ChromaDB
        try:
            collection.add(
                ids=ids,
                documents=documents,
                embeddings=embeddings,
                metadatas=metadatas,
            )
            total_ingested += len(documents)
        except Exception as e:
            print(f"[Ingest] ERROR adding to ChromaDB batch {global_batch_idx}: {e}")
            total_errors += len(documents)

        # Update progress
        last_processed = start_index + batch_idx * BATCH_SIZE - 1
        state["last_processed_index"] = min(last_processed, total_rows - 1)
        state["total_ingested"] = total_ingested
        state["total_skipped"] = total_skipped
        state["total_errors"] = total_errors
        save_state(state)

        # Progress reporting
        processed_so_far = min(start_index + batch_idx * BATCH_SIZE, total_rows)
        elapsed = time.time() - start_time
        rate = processed_so_far / elapsed if elapsed > 0 else 0
        eta = (total_rows - processed_so_far) / rate if rate > 0 else 0

        if batch_idx % PROGRESS_REPORT_EVERY == 0 or processed_so_far >= total_rows:
            print(
                f"[Ingest] Progress: {processed_so_far}/{total_rows} "
                f"({processed_so_far/total_rows*100:.1f}%) | "
                f"Ingested: {total_ingested} | Skipped: {total_skipped} | Errors: {total_errors} | "
                f"Rate: {rate:.1f} rows/s | ETA: {eta:.0f}s"
            )

    # Final stats
    state["completed"] = True
    save_state(state)

    final_stats = get_collection_stats()
    total_time = time.time() - start_time
    print(f"\n[Ingest] COMPLETED in {total_time:.1f}s")
    print(f"[Ingest] Total processed: {total_rows}")
    print(f"[Ingest] Newly ingested: {total_ingested}")
    print(f"[Ingest] Skipped (already exist): {total_skipped}")
    print(f"[Ingest] Errors: {total_errors}")
    print(f"[Ingest] Collection now has: {final_stats['document_count']} documents")


def main():
    import argparse
    parser = argparse.ArgumentParser(description="Ingest historical news data into ChromaDB")
    parser.add_argument("--dry-run", action="store_true", help="Show what would be done without modifying database")
    parser.add_argument("--reset", action="store_true", help="Reset progress and re-ingest from beginning")
    args = parser.parse_args()
    
    ingest(dry_run=args.dry_run, reset=args.reset)


if __name__ == "__main__":
    main()