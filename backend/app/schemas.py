from datetime import datetime

from pydantic import BaseModel, Field, field_validator


class SymptomRequest(BaseModel):
    symptoms: str = Field(min_length=10, max_length=2000)

    @field_validator("symptoms")
    @classmethod
    def validate_symptoms(cls, value: str) -> str:
        cleaned = " ".join(value.split())
        if len(cleaned) < 10:
            raise ValueError("Describe the symptoms in at least 10 characters.")
        if not any(character.isalpha() for character in cleaned):
            raise ValueError("Symptoms must contain words, not only numbers or symbols.")
        return cleaned


class Condition(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    reason: str = Field(min_length=10, max_length=500)


class AnalysisContent(BaseModel):
    summary: str = Field(min_length=10, max_length=500)
    conditions: list[Condition] = Field(min_length=3, max_length=5)
    clinical_note: str = Field(min_length=10, max_length=500)


class AnalysisResponse(BaseModel):
    symptoms: str
    analysis: AnalysisContent
    cached: bool


class SavedAnalysis(BaseModel):
    id: int
    symptoms: str
    analysis: AnalysisContent
    created_at: datetime


class HistoryResponse(BaseModel):
    analyses: list[SavedAnalysis]

