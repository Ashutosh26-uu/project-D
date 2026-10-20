import io
import time
from dataclasses import dataclass

from PIL import Image, UnidentifiedImageError
from ultralytics import YOLO


class InvalidImageError(ValueError):
    pass


@dataclass
class DetectionResult:
    detections: list[dict]
    width: int
    height: int
    inference_ms: float


class Detector:
    """Thin wrapper around a YOLOv8 model. Loaded once per process."""

    def __init__(self, model_path: str):
        self.model_path = model_path
        self.model = YOLO(model_path)
        self.class_names: dict[int, str] = dict(self.model.names)
        # The first predict() call initialises the backend and takes seconds;
        # do it at startup so the first real request isn't slow
        self.model.predict(Image.new("RGB", (64, 64)), verbose=False)

    def detect(self, image_bytes: bytes, confidence: float) -> DetectionResult:
        try:
            image = Image.open(io.BytesIO(image_bytes))
            image.load()
        except (UnidentifiedImageError, OSError) as exc:
            raise InvalidImageError("File is not a readable image") from exc

        # ultralytics treats numpy arrays as BGR; a PIL RGB image is interpreted correctly
        image = image.convert("RGB")

        started = time.perf_counter()
        result = self.model.predict(image, conf=confidence, verbose=False)[0]
        inference_ms = (time.perf_counter() - started) * 1000

        detections = []
        for box in result.boxes:
            class_id = int(box.cls[0])
            x1, y1, x2, y2 = (round(v, 1) for v in box.xyxy[0].tolist())
            detections.append({
                "class_id": class_id,
                "class_name": self.class_names.get(class_id, str(class_id)),
                "confidence": round(float(box.conf[0]), 4),
                "bbox": [x1, y1, x2, y2],
            })

        return DetectionResult(detections, image.width, image.height, round(inference_ms, 1))
