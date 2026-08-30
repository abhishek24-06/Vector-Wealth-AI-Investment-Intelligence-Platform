"""
Local Embedding Service using Sentence Transformers.

Replaces Gemini embedding API for ingestion and vector search.
No quota limits, runs locally on CPU/GPU.
"""
from __future__ import annotations

import hashlib
import os
import threading
from functools import lru_cache
from pathlib import Path
from typing import Any

from dotenv import load_dotenv

ROOT_DIR = Path(__file__).resolve().parent.parent
ENV_PATH = ROOT_DIR / ".env"
load_dotenv(ENV_PATH)

# Configuration
EMBEDDING_MODEL_NAME = os.getenv("EMBEDDING_MODEL", "sentence-transformers/all-MiniLM-L6-v2")
EMBEDDING_DEVICE = os.getenv("EMBEDDING_DEVICE", "cpu")  # cpu or cuda
EMBEDDING_BATCH_SIZE = int(os.getenv("EMBEDDING_BATCH_SIZE", "64"))
EMBEDDING_NORMALIZE = os.getenv("EMBEDDING_NORMALIZE", "true").lower() in {"1", "true", "yes"}

# ChromaDB collection name (versioned for embedding model changes)
CHROMA_COLLECTION_NAME = os.getenv("CHROMA_COLLECTION_NAME", "market_news_v2")
DB_PATH = Path(os.getenv("VECTOR_WEALTH_DB_PATH", str(Path(__file__).resolve().parent / "vector_wealth_db")))

_model_lock = threading.Lock()
_model_instance = None


def get_embedding_model():
    """Get or create the SentenceTransformer model (thread-safe singleton)."""
    global _model_instance
    if _model_instance is None:
        with _model_lock:
            if _model_instance is None:
                from sentence_transformers import SentenceTransformer
                print(f"[EmbeddingService] Loading model: {EMBEDDING_MODEL_NAME} on {EMBEDDING_DEVICE}")
                _model_instance = SentenceTransformer(EMBEDDING_MODEL_NAME, device=EMBEDDING_DEVICE)
                print(f"[EmbeddingService] Model loaded. Dimension: {_model_instance.get_embedding_dimension()}")
    return _model_instance


def get_embedding_dimension() -> int:
    """Get the embedding dimension for the current model."""
    return get_embedding_model().get_embedding_dimension()


def embed_texts(texts: list[str]) -> list[list[float]]:
    """
    Embed a list of texts using the local model.
    Returns list of embedding vectors (list of floats).
    """
    if not texts:
        return []
    
    model = get_embedding_model()
    embeddings = model.encode(
        texts,
        batch_size=EMBEDDING_BATCH_SIZE,
        show_progress_bar=len(texts) > 10,
        normalize_embeddings=EMBEDDING_NORMALIZE,
        convert_to_numpy=True,
    )
    return embeddings.tolist()


def embed_query(query: str) -> list[float]:
    """Embed a single query string for vector search."""
    return embed_texts([query])[0]


def build_document_id(source: str, title: str, date: str, url: str = "") -> str:
    """
    Build a deterministic document ID for idempotent ingestion.
    
    For historical CSV: source="csv", uses row index + title + date
    For live news: source="live", uses URL + title + published_at
    """
    if source == "csv":
        unique_string = f"csv|{title}|{date}"
    else:
        unique_string = f"live|{url}|{title}|{date}"
    
    digest = hashlib.sha256(unique_string.encode("utf-8", errors="ignore")).hexdigest()
    return f"news_{digest[:32]}"


def build_document_text(title: str, description: str, ticker_tags: list[str] = None) -> str:
    """Build the document text for embedding."""
    parts = [f"Title: {title}", f"Description: {description}"]
    if ticker_tags:
        parts.append(f"TickerTags: {', '.join(ticker_tags)}")
    return "\n".join(parts)


@lru_cache(maxsize=1)
def get_chroma_collection():
    """Get or create the ChromaDB collection for the current embedding model."""
    import chromadb
    client = chromadb.PersistentClient(path=str(DB_PATH))
    collection = client.get_or_create_collection(name=CHROMA_COLLECTION_NAME)
    return collection


def get_collection_stats() -> dict[str, Any]:
    """Get statistics about the current collection."""
    collection = get_chroma_collection()
    count = collection.count()
    return {
        "collection_name": CHROMA_COLLECTION_NAME,
        "document_count": count,
        "embedding_model": EMBEDDING_MODEL_NAME,
        "embedding_dimension": get_embedding_dimension(),
        "db_path": str(DB_PATH),
    }