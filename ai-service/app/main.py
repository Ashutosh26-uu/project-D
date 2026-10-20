import asyncio
import hmac
import logging
from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI, File, Header, HTTPException, Query, UploadFile
from fastapi.concurrency import run_in_threadpool

from .config import settings
from .detector import Detector, InvalidImageError

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")
logger = logging.getLogger("ai-service")


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Loading model from %s", settings.model_path)
    app.state.detector = Detector(settings.model_path)
    app.state.slots = asyncio.Semaphore(settings.max_concurrency)
    if not settings.service_token:
        logger.warning("AI_SERVICE_TOKEN is not set; /detect accepts unauthenticated requests")
    yield


app = FastAPI(title="Drone AI Service", version="2.0.0", lifespan=lifespan)


def require_service_token(x_service_token: str = Header(default="")):
    if settings.service_token and not hmac.compare_digest(x_service_token, settings.service_token):
        raise HTTPException(status_code=401, detail="Invalid service token")


@app.get("/health")
async def health():
    detector: Detector = app.state.detector
    return {"status": "ok", "model": detector.model_path.replace("\\", "/").rsplit("/", 1)[-1],
            "classes": len(detector.class_names)}


@app.get("/classes", dependencies=[Depends(require_service_token)])
async def classes():
    return {"classes": list(app.state.detector.class_names.values())}


@app.post("/detect", dependencies=[Depends(require_service_token)])
async def detect(
    file: UploadFile = File(...),
    confidence: float = Query(default=None, ge=0.05, le=0.95),
):
    data = await file.read(settings.max_image_bytes + 1)
    if not data:
        raise HTTPException(status_code=400, detail="Empty file")
    if len(data) > settings.max_image_bytes:
        raise HTTPException(status_code=413, detail="Image too large")

    detector: Detector = app.state.detector
    async with app.state.slots:
        try:
            # Inference is CPU-bound; keep it off the event loop
            result = await run_in_threadpool(detector.detect, data, confidence or settings.confidence)
        except InvalidImageError as exc:
            raise HTTPException(status_code=400, detail=str(exc))

    return {
        "detections": result.detections,
        "image": {"width": result.width, "height": result.height},
        "inference_ms": result.inference_ms,
    }
