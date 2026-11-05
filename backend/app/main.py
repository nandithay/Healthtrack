from contextlib import asynccontextmanager

from dotenv import load_dotenv

load_dotenv()

import os

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select
from sqlalchemy.orm import Session

from .database import Base, engine, get_db
from .models import AnalysisRecord
from .schemas import AnalysisContent, AnalysisResponse, HistoryResponse, SavedAnalysis, SymptomRequest
from .service import ModelUnavailable, analyze_symptoms


@asynccontextmanager
async def lifespan(_app: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(title="HealthTrack API", version="0.1.0", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("FRONTEND_ORIGIN", "http://localhost:5173")],
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


def run_analysis(db: Session, symptoms: str) -> AnalysisResponse:
    try:
        return analyze_symptoms(db, symptoms)
    except ModelUnavailable as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc


@app.post("/api/analyze", response_model=AnalysisResponse)
def analyze(request: SymptomRequest, db: Session = Depends(get_db)) -> AnalysisResponse:
    return run_analysis(db, request.symptoms)


@app.post("/api/analyses", response_model=SavedAnalysis, status_code=201)
def save_analysis(request: SymptomRequest, db: Session = Depends(get_db)) -> SavedAnalysis:
    result = run_analysis(db, request.symptoms)
    record = AnalysisRecord(
        symptoms=result.symptoms,
        result_json=result.analysis.model_dump_json(),
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return SavedAnalysis(
        id=record.id,
        symptoms=record.symptoms,
        analysis=result.analysis,
        created_at=record.created_at,
    )


@app.get("/api/analyses", response_model=HistoryResponse)
def list_analyses(db: Session = Depends(get_db)) -> HistoryResponse:
    records = db.scalars(
        select(AnalysisRecord).order_by(AnalysisRecord.created_at.desc(), AnalysisRecord.id.desc()).limit(100)
    ).all()
    return HistoryResponse(
        analyses=[
            SavedAnalysis(
                id=record.id,
                symptoms=record.symptoms,
                analysis=AnalysisContent.model_validate_json(record.result_json),
                created_at=record.created_at,
            )
            for record in records
        ]
    )
