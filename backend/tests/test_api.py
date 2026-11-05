import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session
from sqlalchemy.pool import StaticPool

from app.database import Base, get_db
from app.main import app
from app.schemas import AnalysisContent, Condition


@pytest.fixture
def client():
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(engine)

    def override_db():
        with Session(engine) as session:
            yield session

    app.dependency_overrides[get_db] = override_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()
    engine.dispose()


def sample_analysis():
    return AnalysisContent(
        summary="Fever and cough have been present for three days.",
        conditions=[
            Condition(name="Condition A", reason="The reported fever and cough can occur with this condition."),
            Condition(name="Condition B", reason="The reported symptoms are also consistent with this condition."),
            Condition(name="Condition C", reason="This condition may explain the stated symptom pattern."),
        ],
        clinical_note="These possibilities require clinical assessment and are not a diagnosis.",
    )


def test_invalid_symptoms_show_validation_error(client):
    short = client.post("/api/analyze", json={"symptoms": "cough"})
    numeric = client.post("/api/analyze", json={"symptoms": "1234567890"})
    assert short.status_code == 422
    assert numeric.status_code == 422
    assert "Symptoms must contain words" in str(numeric.json())


def test_analysis_returns_three_conditions_and_reuses_cache(client, monkeypatch):
    calls = []

    def fake_generate(symptoms):
        calls.append(symptoms)
        return sample_analysis()

    monkeypatch.setattr("app.service.generate_analysis", fake_generate)
    first = client.post("/api/analyze", json={"symptoms": "Fever and cough for three days"})
    second = client.post("/api/analyze", json={"symptoms": "  fever  and cough for three days  "})
    assert first.status_code == 200
    assert second.status_code == 200
    assert len(first.json()["analysis"]["conditions"]) >= 3
    assert first.json()["cached"] is False
    assert second.json()["cached"] is True
    assert len(calls) == 1


def test_saved_analysis_appears_in_history(client, monkeypatch):
    monkeypatch.setattr("app.service.generate_analysis", lambda _symptoms: sample_analysis())
    saved = client.post("/api/analyses", json={"symptoms": "Fever and cough for three days"})
    history = client.get("/api/analyses")
    assert saved.status_code == 201
    assert history.status_code == 200
    assert history.json()["analyses"][0]["id"] == saved.json()["id"]
    assert len(history.json()["analyses"][0]["analysis"]["conditions"]) == 3


def test_missing_api_key_returns_clear_error(client, monkeypatch):
    monkeypatch.delenv("GEMINI_API_KEY", raising=False)
    response = client.post("/api/analyze", json={"symptoms": "Unusual headache and fatigue for a week"})
    assert response.status_code == 503
    assert "GEMINI_API_KEY" in response.json()["detail"]
