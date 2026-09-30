from unittest.mock import AsyncMock

from fastapi.testclient import TestClient

from app import main


def test_without_key_returns_known_project_fallback(monkeypatch):
    monkeypatch.delenv("OPENROUTER_API_KEY", raising=False)
    client = TestClient(main.create_app())

    response = client.post("/api/bitty/message", json={"message": "¿Qué es Seeds?"})

    assert response.status_code == 200
    body = response.json()
    assert body["source"] == "fallback"
    assert body["project"]["slug"] == "seeds"
    assert body["action"] == {"type": "show_project", "projectSlug": "seeds"}
    assert "Seeds" in body["text"]


def test_openrouter_error_uses_fallback(monkeypatch):
    monkeypatch.setattr(main, "call_openrouter", AsyncMock(side_effect=main.httpx.TimeoutException("timeout")))
    client = TestClient(main.create_app())

    response = client.post("/api/bitty/message", json={"message": "Háblame de HostiQR"})

    assert response.status_code == 200
    body = response.json()
    assert body["source"] == "fallback"
    assert body["project"]["slug"] == "hostiqr"
    assert "confirmar" in body["text"]


def test_successful_openrouter_response_keeps_action_server_controlled(monkeypatch):
    monkeypatch.setattr(main, "call_openrouter", AsyncMock(return_value="Seeds ayuda a conservar ideas; aún faltan detalles por verificar."))
    client = TestClient(main.create_app())

    response = client.post("/api/bitty/message", json={"message": "Muéstrame Seeds"})

    body = response.json()
    assert body["source"] == "ai"
    assert body["action"]["type"] == "show_project"
    assert body["action"]["projectSlug"] == "seeds"


def test_rejects_oversized_input():
    client = TestClient(main.create_app())
    response = client.post("/api/bitty/message", json={"message": "x" * 601})
    assert response.status_code == 422
