# HealthTrack

HealthTrack is a clinical decision support **prototype** for fictional patient cases. A healthcare professional can describe symptoms, review an AI-generated summary and at least three potential conditions, save an analysis, and revisit saved work. The output is not a diagnosis and must be reviewed by a qualified professional.

## Stack

- Frontend: React, Vite, TypeScript, Tailwind CSS
- Backend: Python, FastAPI, Pydantic
- AI: Google Gemini API via the `google-genai` Python SDK
- Storage: SQLite and SQLAlchemy for saved analyses and response cache
- Tests: Pytest for the API and Vitest with Testing Library for the form

## Setup

Requirements: Node.js 20.19+ or 22.12+, Python 3.11+, npm, and [uv](https://docs.astral.sh/uv/). A Gemini API key is required for live analyses. Use only fictional or de-identified data in this prototype.

Start the backend in one terminal:

```bash
cd backend
uv sync --python 3.11 --extra dev
cp .env.example .env
# Edit backend/.env and set GEMINI_API_KEY
uv run uvicorn app.main:app --reload
```

Start the frontend in a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`. The Vite development server proxies `/api` calls to FastAPI at `http://127.0.0.1:8000`. FastAPI's interactive API documentation is available at `http://127.0.0.1:8000/docs`.

Run the checks:

```bash
cd backend && uv run pytest -q
cd frontend && npm test && npm run build
```

## Use the app

1. Enter at least 10 characters of symptoms and select **Analyze symptoms**. The page displays the submitted symptoms, a summary, and 3–5 possible conditions.
2. Select **Save analysis** to store the result, then open **Saved history** to retrieve it.
3. Submit the same symptoms again to see the **Cached result** label. Case and repeated whitespace do not change the cache key.

Invalid input shows a validation error. If the API key is missing or Gemini fails, the app shows a service error instead of inventing conditions.

## Architecture

```text
React form → FastAPI /api/analyze → Pydantic validation
                               → SQLite cache lookup
                               → Gemini on cache miss
                               → Pydantic response validation
                               → summary and conditions in React

React Save → FastAPI /api/analyses → SQLite saved analyses
React History → FastAPI GET /api/analyses → SQLite saved analyses
```

The main API logic is in `backend/app/main.py`; the Gemini call and cache logic are in `backend/app/service.py`. Request and response contracts are in `backend/app/schemas.py`. The frontend view is in `frontend/src/App.tsx`.

### API

- `POST /api/analyze` — validate symptoms and return an analysis with a `cached` flag.
- `POST /api/analyses` — analyze (usually from cache) and save a result.
- `GET /api/analyses` — return the 100 most recent saved analyses.
- `GET /api/health` — simple health check.

FastAPI returns `422` for invalid input and `503` if analysis cannot be produced. The API key stays on the backend and is excluded from Git by `.gitignore`.

## Design decisions and trade-offs

**Cache:** A SQLite table stores validated Gemini responses for one hour by default. The SHA-256 cache key contains normalized symptoms plus the model and prompt version. This makes repeated requests fast and avoids storing raw symptoms in the key. The response itself remains in the database, so hashing the key is **not** a privacy control. Expired or invalid entries are replaced on the next request. SQLite is simple for a single-machine demo; a multi-instance deployment would need shared storage and a deliberate data-retention policy. The cache is separate from saved history so analysis does not automatically create a permanent history record.

**Clinical safety:** The model is asked for possibilities and reasons, not a definitive diagnosis or treatment. Pydantic validates the returned structure and requires at least three conditions. Structured output does not establish clinical correctness; a professional must review every result. This prototype has no clinical validation and must not be used for patient care.

**Access:** Role-based access control is optional in the brief and is not included in this prototype. As built, saved analyses are shared with anyone who can reach the API. Run locally with fictional data only. Authentication, user-specific records, encryption, audit logging, and a privacy review would be required before using real patient information or exposing the app publicly.

**Database setup:** Tables are created at startup for easy local setup. A production deployment should use migrations and a persistent managed database rather than a local SQLite file.

## Tests

Backend tests cover invalid input, three-condition output, cache reuse, history retrieval, and missing API key behaviour. The frontend test covers a failed submission followed by a valid form submission and visible results. Gemini is mocked in tests so they are deterministic; a live API call still needs a configured key and manual verification.

## AI usage

Codex was used to plan the architecture and draft the React UI, FastAPI routes, Gemini integration, tests, and README. The generated work was checked with backend tests, a frontend test, and a production frontend build; issues found during those checks were corrected. Google Gemini is the application's runtime analysis provider. No real patient data was used, and live Gemini output has been verified with a local API key. Update this section if additional AI tools are used while preparing the final submission or demo.

## Submission checklist

- Publish the source to a public GitHub repository or provide a zip archive.
- Configure a Gemini key locally and verify one live analysis with fictional symptoms.
- Record a screen-share walkthrough under 8 minutes and 200 MB, with your webcam on. Show validation, analysis, at least three conditions, saved history, a cache hit, and a 1–2 minute code walkthrough.
