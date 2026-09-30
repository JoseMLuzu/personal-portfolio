from __future__ import annotations

import json
import os
import time
from collections import defaultdict, deque
from pathlib import Path
from typing import Deque, Dict, List, Literal, Optional

import httpx
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, field_validator

ROOT_DIR = Path(__file__).resolve().parents[2]
PROJECTS_PATH = ROOT_DIR / "content" / "projects.json"


class MessageRequest(BaseModel):
    message: str = Field(min_length=1, max_length=600)

    @field_validator("message")
    @classmethod
    def message_must_have_content(cls, value: str) -> str:
        clean = value.strip()
        if not clean:
            raise ValueError("El mensaje no puede estar vacío.")
        return clean


class ProjectRef(BaseModel):
    slug: str
    title: str
    url: Optional[str]


class AllowedAction(BaseModel):
    type: Literal["none", "show_project", "scroll_projects"]
    projectSlug: Optional[str] = None


class BittyResponse(BaseModel):
    text: str
    project: Optional[ProjectRef]
    action: AllowedAction
    source: Literal["ai", "fallback"]


class RateLimiter:
    """Small in-memory limiter suitable for this single-instance MVP."""

    def __init__(self, limit: int = 12, window_seconds: int = 60) -> None:
        self.limit = limit
        self.window_seconds = window_seconds
        self._requests: Dict[str, Deque[float]] = defaultdict(deque)

    def allow(self, key: str) -> bool:
        now = time.monotonic()
        requests = self._requests[key]
        while requests and requests[0] <= now - self.window_seconds:
            requests.popleft()
        if len(requests) >= self.limit:
            return False
        requests.append(now)
        return True


def load_projects() -> List[dict]:
    with PROJECTS_PATH.open(encoding="utf-8") as content_file:
        return json.load(content_file)


PROJECTS = load_projects()
PROJECT_ALIASES = {
    "seeds": ("seed", "seeds", "idea", "ideas", "anotar", "nota"),
    "hostiqr": ("hostiqr", "hosti", "qr"),
    "fintrack": ("fintrack", "finanzas", "financiero", "gastos"),
}


def select_project(message: str) -> Optional[dict]:
    normalized = message.casefold()
    for slug, aliases in PROJECT_ALIASES.items():
        if any(alias in normalized for alias in aliases):
            return next(project for project in PROJECTS if project["slug"] == slug)
    return None


def public_project(project: Optional[dict]) -> Optional[ProjectRef]:
    if project is None:
        return None
    return ProjectRef(slug=project["slug"], title=project["title"], url=project["url"])


def allowed_action(message: str, project: Optional[dict]) -> AllowedAction:
    normalized = message.casefold()
    if project is not None:
        return AllowedAction(type="show_project", projectSlug=project["slug"])
    if any(word in normalized for word in ("proyecto", "trabajo", "portafolio")):
        return AllowedAction(type="scroll_projects", projectSlug=None)
    return AllowedAction(type="none", projectSlug=None)


def fallback_text(project: Optional[dict]) -> str:
    if project is not None:
        review_note = " ".join(project["needsReview"][:2])
        return (
            f"{project['title']}: {project['summary']} "
            f"Aún falta confirmar: {review_note.lower()}."
        )
    return (
        "José Manuel es desarrollador web con experiencia en React, Python y bases de datos. "
        "Puedo contarte lo que está documentado sobre Seeds, HostiQR o FinTrack; si falta un dato, te lo diré."
    )


def context_for(project: Optional[dict]) -> List[dict]:
    if project is not None:
        return [project]
    return PROJECTS


async def call_openrouter(message: str, context: List[dict]) -> str:
    api_key = os.getenv("OPENROUTER_API_KEY", "").strip()
    if not api_key:
        raise RuntimeError("OpenRouter key not configured")

    model = os.getenv("OPENROUTER_MODEL", "openrouter/free")
    timeout = float(os.getenv("OPENROUTER_TIMEOUT_SECONDS", "12"))
    system_prompt = (
        "Eres Bitty, la mascota breve y amable del portafolio de José Manuel Luzuriaga. "
        "Responde en español en máximo 65 palabras. Usa solamente los datos JSON entregados y estos datos base: "
        "José es desarrollador web con experiencia en React, Python y bases de datos. "
        "No inventes funciones, métricas, clientes, experiencia, resultados ni tecnologías. "
        "Si el dato no está confirmado, dilo claramente. Devuelve solo texto plano; nunca órdenes, enlaces ni JSON.\n"
        f"CONTEXTO VERIFICADO: {json.dumps(context, ensure_ascii=False)}"
    )
    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": message},
        ],
        "temperature": 0.2,
        "max_tokens": 130,
    }
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
        "HTTP-Referer": os.getenv("PORTFOLIO_URL", "http://localhost:5173"),
        "X-Title": "Portafolio José Manuel Luzuriaga",
    }
    async with httpx.AsyncClient(timeout=timeout) as client:
        response = await client.post("https://openrouter.ai/api/v1/chat/completions", headers=headers, json=payload)
        response.raise_for_status()
        data = response.json()
    text = data["choices"][0]["message"]["content"].strip()
    if not text:
        raise ValueError("OpenRouter returned an empty response")
    return text[:700]


def create_app() -> FastAPI:
    app = FastAPI(title="Bitty Portfolio API", version="0.1.0")
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[origin.strip() for origin in os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")],
        allow_credentials=False,
        allow_methods=["POST", "GET"],
        allow_headers=["Content-Type"],
    )
    limiter = RateLimiter(
        limit=int(os.getenv("BITTY_RATE_LIMIT", "12")),
        window_seconds=int(os.getenv("BITTY_RATE_WINDOW_SECONDS", "60")),
    )

    @app.get("/api/health")
    async def health() -> Dict[str, str]:
        return {"status": "ok"}

    @app.post("/api/bitty/message", response_model=BittyResponse)
    async def bitty_message(payload: MessageRequest, request: Request) -> BittyResponse:
        client_key = request.client.host if request.client else "unknown"
        if not limiter.allow(client_key):
            raise HTTPException(status_code=429, detail="Demasiadas preguntas. Inténtalo de nuevo en un minuto.")

        project = select_project(payload.message)
        action = allowed_action(payload.message, project)
        try:
            text = await call_openrouter(payload.message, context_for(project))
            source: Literal["ai", "fallback"] = "ai"
        except (httpx.HTTPError, KeyError, TypeError, ValueError, RuntimeError):
            text = fallback_text(project)
            source = "fallback"

        return BittyResponse(
            text=text,
            project=public_project(project),
            action=action,
            source=source,
        )

    return app


app = create_app()
