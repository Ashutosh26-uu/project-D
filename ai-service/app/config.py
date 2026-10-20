import os
from dataclasses import dataclass
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent


@dataclass(frozen=True)
class Settings:
    model_path: str = os.getenv("MODEL_PATH", str(BASE_DIR / "models" / "yolov8n.pt"))
    # Default confidence threshold when the caller doesn't pass one
    confidence: float = float(os.getenv("DETECT_CONFIDENCE", "0.25"))
    # Upper bound on simultaneous inferences; extra requests wait their turn
    max_concurrency: int = int(os.getenv("MAX_CONCURRENCY", "2"))
    max_image_bytes: int = int(os.getenv("MAX_IMAGE_BYTES", str(10 * 1024 * 1024)))
    # Shared secret with the backend. Empty disables the check (local dev only).
    service_token: str = os.getenv("AI_SERVICE_TOKEN", "")


settings = Settings()
