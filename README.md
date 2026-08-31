Vector Wealth

AI-Powered Investment Research for the Indian Stock Market

Vector Wealth is a full-stack investment research platform focused on Indian equities. It combines rule-based sentiment analysis, local vector search, historical and live financial news, market-price data, LLM-assisted research, opportunity discovery, and goal-based portfolio management through a Next.js web frontend and FastAPI backend.

Disclaimer: Vector Wealth is a research and decision-support project. Its outputs are not financial advice or a substitute for professional financial guidance.

Why Vector Wealth?

Retail investors often have access to market prices, headlines, and research tools separately, but turning that information into a structured view of a stock can require multiple workflows. Vector Wealth brings the main research steps into one application:

Analyze an NSE/BSE stock from a ticker

Combine recent and historical financial news

Produce explainable sentiment and BUY/HOLD/SELL signals

Search news semantically using local embeddings

Generate AI-assisted summaries and explanations

Discover potential opportunities automatically

Track goal-based portfolios and holdings

Ask questions through a conversational research assistant

The system follows a hybrid architecture: deterministic code handles latency-sensitive, explainable operations while LLMs are used selectively where language reasoning adds value.

Core Features

Stock Analysis

For a selected ticker, the application can return:

Current price

Price change and percentage change

Overall sentiment

Recent sentiment

Historical/pattern sentiment

Confidence

BUY / HOLD / SELL recommendation

Positive and negative drivers

Relevant news

Peer comparison

Sentiment history

Optional AI summary

Multi-Source News Intelligence

Vector Wealth combines:

Source

Role

Historical CSV

Long-term market-news context

NewsAPI

Live/on-demand news

Finnhub

Live news source/fallback

RSS

Free live-news ingestion

Historical news is ingested into ChromaDB, while live ingestion periodically fetches new material, detects ticker tags, generates embeddings, and stores it for retrieval.

Explainable Sentiment

The sentiment engine is rule-based and deterministic. It supports:

Weighted positive/negative terms

Intensifiers

Negation handling

Contrast handling

Numeric magnitude effects

Recency decay

Source-quality weighting

Positive/negative driver extraction

This keeps the core sentiment score fast and inspectable rather than making every decision dependent on an LLM.

Local Semantic Search

News documents use:

sentence-transformers/all-MiniLM-L6-v2

with 384-dimensional normalized embeddings stored in ChromaDB. This removes the need for a hosted embedding service for the core retrieval path.

AI Research Assistant

The chat interface supports stock, comparison, portfolio, opportunity, and general research questions. It uses intent routing to decide whether to fetch additional market data before generating an answer.

Primary provider:

Groq → Llama 3.3 70B

Fallback:

Google Gemini 2.5 Flash

Opportunity Scanner

The Discover workflow uses a two-stage pipeline:

Recent news
   ↓
Ticker grouping + sentiment
   ↓
Filter high-sentiment candidates
   ↓
Top candidate set
   ↓
Gemini selection/reasoning
   ↓
Price enrichment
   ↓
Top opportunities

The scanner can operate in pre-market, market-hours, and post-market windows and can also be triggered manually.

Goal-Based Portfolio

Goals contain holdings and target information such as:

Goal
├── id
├── name
├── targetAmount
├── targetDate
├── riskTolerance
└── holdings[]
      ├── ticker
      ├── quantity
      ├── buyPrice
      └── buyDate

Computed portfolio metrics include invested amount, current value, P&L, P&L percentage, progress, and time remaining. AI suggestions incorporate portfolio context, risk tolerance, and holding-level sentiment.

Architecture

┌────────────────────────────────────────────────────────────────────┐
│                     Next.js 14 / React 18                         │
│                                                                    │
│ Analyze │ Discover │ Portfolio │ Chat │ Settings                  │
│                                                                    │
│ React Context + Zustand + Typed API Client                       │
└──────────────────────────────┬─────────────────────────────────────┘
                               │
                               ▼
┌────────────────────────────────────────────────────────────────────┐
│                         FastAPI Backend                            │
│                                                                    │
│ Routing • Validation • Rate Limiting • Orchestration              │
└──────────────┬──────────────────┬──────────────────┬───────────────┘
               │                  │                  │
               ▼                  ▼                  ▼
        ┌──────────────┐   ┌───────────────┐  ┌──────────────┐
        │ Analysis     │   │ News Pipeline │  │ Market Data  │
        │ Sentiment    │   │ CSV / RSS     │  │ yfinance     │
        │ Retrieval    │   │ NewsAPI       │  │ 5-min cache  │
        │ Enrichment   │   │ Finnhub       │  └──────────────┘
        └──────┬───────┘   └──────┬────────┘
               │                  │
               ▼                  ▼
        ┌──────────────┐   ┌───────────────┐
        │   ChromaDB   │   │ Historical CSV│
        │  MiniLM-L6-v2│   │ Financial news│
        │   384-dim    │   └───────────────┘
        └──────┬───────┘
               │
               ▼
       ┌──────────────────────┐
       │ AI / LLM Layer       │
       │ Gemini • Groq        │
       │ LangGraph (optional) │
       └──────────────────────┘

End-to-End Stock Analysis

For example:

POST /analyze
Content-Type: application/json

{"ticker":"MARUTI"}

The fast analysis path follows:

POST /analyze
    ↓
main.py
    ↓
agents.run_analysis()
    ↓
ChromaDB retrieval + local CSV search
    ↓
deduplication
    ↓
recent vs historical split
    ↓
on-demand NewsAPI fallback if needed
    ↓
sentiment + confidence + drivers + explanation
    ↓
price + peer + AI-summary enrichment
    ↓
AnalysisResult
    ↓
Next.js rendering

News Pipeline

Historical ingestion

IndianFinancialNews.csv
       ↓
ingest_data.py
       ↓
Ticker alias detection
       ↓
Deterministic IDs
       ↓
Batch embeddings
       ↓
ChromaDB

The historical ingestion flow is designed to be idempotent and resumable.

Live ingestion

LiveNewsIngestor
      │
      ├── RSS
      ├── NewsAPI
      └── Finnhub
      │
      ▼
Deduplication
      ↓
Ticker tagging
      ↓
Embeddings
      ↓
ChromaDB

The live system also rotates across sector queries so different areas of the Indian market are covered over time.

Retrieval order

Ticker query
   ↓
ChromaDB retrieval
   ↓
Local CSV matching
   ↓
Deduplication
   ↓
Recent/historical split
   ↓
NewsAPI on-demand fallback
   ↓
Sentiment aggregation

Sentiment Methodology

The core sentiment engine processes article text through weighted lexical rules.

Processing

Split around contrast terms such as but, however, despite, and although.

Tokenize and match positive/negative terms.

Apply term weights.

Apply intensifiers.

Apply negation flips.

Apply numeric magnitude effects.

Weight segments and recency.

Clamp the result to [-1, 1].

Aggregation

Recent sentiment is the average sentiment of recent articles. Pattern sentiment uses time decay plus source-quality weighting.

sentiment = 0.7 × now_sentiment
          + 0.3 × pattern_sentiment

When there is insufficient recent news, the historical pattern component receives greater influence.

Recommendation thresholds

BUY   >=  0.20
SELL  <= -0.20
HOLD  otherwise

Confidence combines recent-news coverage and historical context.

AI / LLM Layer

Feature

Provider

Model

Fallback

GenAI analysis

Google

Gemini 2.5 Flash

Deterministic fast path

AI summary

Google

Gemini 2.5 Flash

None

Chat

Groq

Llama 3.3 70B

Gemini

Opportunity scanner

Google

Gemini 2.5 Flash

Rule-based

Portfolio suggestions

Google

Gemini 2.5 Flash

Rule-based

Optional LangGraph path

scout_agent
    ↓
analyst_advisor_agent
    ↓
Structured JSON
    ↓
Market-data enrichment

Controlled by:

USE_GENAI_ANALYSIS=false

Chat Routing

Internal intent tags allow the assistant to connect natural-language requests to application capabilities:

Intent

Action

[ANALYZE:TICKER]

Fetch stock analysis and generate a contextual response

[COMPARE:T1,T2]

Analyze both tickers and compare them

[PORTFOLIO]

Inject portfolio analysis/context

[OPPORTUNITIES]

Fetch scanner results

[WATCHLIST]

Work with watchlist context

The tag is removed before the final response is returned to the user.

Frontend

Stack

Technology

Purpose

Next.js 14.2

Web framework / App Router

React 18.3

UI

TypeScript 5.4

Type safety

Tailwind CSS 3.4

Styling

Recharts 2.12

Sentiment charts

Zustand 4.5

Lightweight client state

React Context

Domain state/providers

Inter

Typography

Inline SVG

Icons

Routes

Route

Purpose

/

Redirect to analysis

/analyze

Ticker analysis

/discover

Opportunity scanner

/portfolio

Goal-based portfolio

/chat

AI research assistant

/settings

Backend configuration and theme

Frontend state

State

Technology

Theme

React Context + localStorage

Analysis

React Context

Discover

React Context

Portfolio

React Context

Chat

React Context

Watchlist

Zustand + localStorage

Trends

Zustand + localStorage

Backend Modules

Module

Responsibility

main.py

FastAPI app, routing, CORS, rate limiting, endpoints

agents.py

Analysis orchestration and enrichment

sentiment.py

Rule-based sentiment and drivers

price_service.py

yfinance prices and peers

opportunity_scanner.py

Proactive opportunity discovery

portfolio_service.py

Portfolio analysis and suggestions

chat_service.py

Chat routing and provider fallback

live_news_ingest.py

Live news ingestion

ingest_data.py

Historical CSV ingestion

embedding_service.py

Sentence Transformer embeddings

storage_service.py

JSON persistence

stock_data.py

Aliases, peer groups, sector queries

ai_summary.py

Gemini summaries

ChromaDB

Property

Value

Collection

market_news_v2

Embeddings

all-MiniLM-L6-v2

Dimension

384

Similarity

Cosine / normalized vectors

Device

CPU by default

Batch size

64

Storage

vector_wealth_db/

Example metadata includes:

Date
Title
Description
source
published_at
ingested_at
provider
ticker_tags
primary_ticker

Documents use deterministic IDs based on source/title/date/URL, supporting deduplication and idempotent ingestion.

API

Method

Endpoint

Purpose

GET

/

Health/info

POST

/analyze

Ticker analysis

GET

/opportunities

Current opportunities

POST

/opportunities/scan

Manual scan

GET

/opportunities/status

Scanner status

POST

/chat

Send chat message

GET

/chat/history/{sid}

Load chat history

POST

/portfolio/analyze

Portfolio analysis

POST

/portfolio/suggest

Goal suggestions

POST

/storage/portfolio/save

Save portfolio

GET

/storage/portfolio/load

Load portfolio

POST

/storage/chat/save

Save chat

GET

/storage/chat/load

Load chat

GET

/admin/live-news/status

Live-news status

POST

/admin/live-news/refresh

Trigger live ingestion

POST

/admin/live-news/retag-existing

Re-tag existing news

Live-news admin endpoints use an admin key when admin authentication is enabled.

Environment Variables

Create a local .env file. Do not commit secrets.

AI

GOOGLE_API_KEY=your_google_key
GROQ_API_KEY=your_groq_key
GROQ_MODEL=llama-3.3-70b-versatile
GROQ_BASE_URL=https://api.groq.com/openai/v1

News

NEWSAPI_KEY=your_newsapi_key
FINNHUB_API_KEY=your_finnhub_key
LIVE_NEWS_ENABLED=false
LIVE_NEWS_PROVIDER=newsapi,rss
LIVE_NEWS_INTERVAL_MINUTES=30
RSS_ENABLED=true

Application

ALLOWED_ORIGINS=*
ADMIN_API_KEY=your_admin_key
RATE_LIMIT_MAX=10
RATE_LIMIT_WINDOW=60
USE_GENAI_ANALYSIS=false
ENABLE_AI_SUMMARY=true
USE_SECTOR_ROTATION=true
USE_INDIA_DOMAINS=true

Vector search

EMBEDDING_MODEL=all-MiniLM-L6-v2
EMBEDDING_DEVICE=cpu
CHROMA_COLLECTION_NAME=market_news_v2
VECTOR_WEALTH_DB_PATH=./vector_wealth_db
FAST_NEWS_MAX_AGE_DAYS=30
FAST_NEWS_MAX_CANDIDATES=120

At least one of GOOGLE_API_KEY or GROQ_API_KEY is required for the supported AI functionality.

Local Development

Prerequisites

Python 3.13

Node.js / npm

Git

Backend

Windows PowerShell

python -m venv .venv
.\.venv\Scripts\Activate.ps1
cd backend
pip install -r requirements.txt
uvicorn main:app --reload

Backend:

http://127.0.0.1:8000

FastAPI docs:

http://127.0.0.1:8000/docs

Frontend

Open a second terminal:

cd frontend-next
npm install
npm run dev

Frontend:

http://localhost:3000

Production build verification:

npm run build

Testing

Backend tests cover areas including:

API endpoints

Sentiment calculation

Ticker extraction and aliases

Historical ingestion

ChromaDB operations

Opportunity scanner logic

Representative test locations include:

backend/tests/test_api.py
tests/test_sentiment.py
tests/test_ticker.py
test_ingest.py
test_chromadb*.py
test_scanner.py

Current gaps:

No dedicated frontend test suite

No full browser E2E suite

No complete frontend → backend → provider integration suite

Performance and Reliability

Current optimizations include:

5-minute market-price cache

Short-lived failure cache for price lookup

Parallel price fetching

Batched local embedding generation

Persistent ChromaDB

Deterministic ingestion IDs

Idempotent/resumable news ingestion

Candidate reduction before LLM scanning

API retry and timeout handling

Groq → Gemini fallback for chat

Backend rate limiting currently uses an in-memory sliding window of 10 requests per 60 seconds per IP by default.

Security

Current security measures include:

Secrets loaded through environment variables

.env excluded from Git

Optional admin API key for live-news operations

Configurable CORS

Backend rate limiting

No secrets stored in Next.js public configuration

Production hardening would still require proper user authentication, distributed rate limiting, managed persistence, stricter CORS, and stronger observability.

Deployment

Backend

The backend has Docker and Render configuration.

Render
  ↓
Docker
  ↓
Gunicorn
  ↓
Uvicorn worker
  ↓
FastAPI

The production container uses Python 3.13, binds to port 10000, and uses Gunicorn with a Uvicorn worker.

Frontend

The Next.js frontend builds successfully, but the current repository does not include dedicated frontend deployment configuration for Render, Vercel, Netlify, or another host.

Data Storage

Storage

Purpose

ChromaDB

News embeddings and metadata

portfolios.json

Goals and holdings

chat_history.json

Chat sessions

opportunities.json

Scanner results

historical_ingest_state.json

Historical ingestion progress

live_ingest_state.json

Live-ingestion state

Browser localStorage

Theme, watchlist, trends, recent state

The current persistence model is suitable for local/single-instance use. A production deployment would benefit from managed database and vector infrastructure.

Project Structure

Vector-Wealth-AI-Investment-Intelligence-Platform/
│
├── backend/
│   ├── main.py
│   ├── agents.py
│   ├── sentiment.py
│   ├── price_service.py
│   ├── opportunity_scanner.py
│   ├── portfolio_service.py
│   ├── chat_service.py
│   ├── live_news_ingest.py
│   ├── ingest_data.py
│   ├── embedding_service.py
│   ├── storage_service.py
│   ├── stock_data.py
│   ├── ai_summary.py
│   └── requirements.txt
│
├── frontend-next/
│   ├── app/
│   ├── components/
│   ├── lib/
│   ├── providers/
│   ├── package.json
│   └── next.config.js
│
├── data/
│   └── IndianFinancialNews.csv
│
├── Dockerfile
├── render.yaml
├── .env.example
├── .gitignore
└── README.md

Key Engineering Decisions

Hybrid analysis instead of fully LLM-driven analysis

A deterministic fast path reduces latency, cost, and external-service dependence while preserving explainability. Optional GenAI analysis can be enabled where additional reasoning is useful.

Local embeddings instead of hosted embeddings

The local MiniLM model avoids embedding API quota/cost and supports repeatable indexing on CPU.

Historical + live news

Historical news provides context and pattern information; live sources provide current market coverage. The retrieval layer can combine both and explicitly distinguish recent coverage from historical context.

Provider fallback

External AI providers can fail or rate-limit. Chat therefore uses Groq as the primary provider with Gemini fallback, while scanner/portfolio workflows also have deterministic fallbacks.

Current Status

Component

Status

FastAPI backend

Working

Fast analysis

Working

Optional GenAI analysis

Working

AI summary

Working

Live news

Requires configured external providers/keys

Opportunity scanner

Working

Portfolio

Working

Chat

Working with provider fallback

Next.js frontend

Build passing

Legacy Flutter frontend

Removed

Frontend deployment config

Not yet configured

Frontend/E2E tests

Not yet implemented

Known Limitations

yfinance is an unofficial market-data source and can occasionally fail.

Live-news quality depends on external providers and credentials.

ChromaDB is currently a local persistent vector store rather than highly available distributed infrastructure.

Rate limiting is in-memory and resets with process restarts.

The current API does not provide full user authentication.

Local JSON persistence is not a multi-node production database layer.

Frontend deployment configuration is still pending.

Frontend and full E2E coverage are limited.

Key Engineering Achievements

Hybrid deterministic + GenAI stock-analysis architecture.

Local 384-dimensional embeddings with Sentence Transformers.

Multi-source financial-news ingestion from historical CSV, RSS, NewsAPI, and Finnhub.

Sector-rotation news ingestion for broader market coverage.

Idempotent and resumable ingestion with deterministic IDs.

Explainable sentiment scoring with weighting, negation, intensifiers, contrast handling, and recency decay.

Two-stage opportunity scanner that reduces candidates before LLM reasoning.

Groq → Gemini provider fallback for conversational research.

Goal-based portfolio analytics with risk-aware AI suggestions.

Type-safe frontend/backend contracts using TypeScript and FastAPI/Pydantic models.

Future Improvements

Deploy the Next.js frontend

Add user authentication and account-level persistence

Move portfolio/chat persistence to a managed database

Use managed/distributed vector infrastructure

Add distributed rate limiting

Add frontend unit/integration/E2E testing

Improve observability and structured monitoring

Add provider health monitoring

Add richer market-data sources and retrieval/reranking

Expand portfolio analytics and personalization

Author

Abhishek Tajane

GitHub: https://github.com/abhishek24-06

Repository

https://github.com/abhishek24-06/Vector-Wealth-AI-Investment-Intelligence-Platform