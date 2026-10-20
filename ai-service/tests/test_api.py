import io
from pathlib import Path

import pytest
import ultralytics
from fastapi.testclient import TestClient
from PIL import Image

from app.main import app

# Sample photo shipped with the ultralytics package (a bus and several people)
BUS_JPG = Path(ultralytics.__file__).parent / "assets" / "bus.jpg"


@pytest.fixture(scope="module")
def client():
    with TestClient(app) as c:
        yield c


def test_health(client):
    res = client.get("/health")
    assert res.status_code == 200
    assert res.json()["status"] == "ok"
    assert res.json()["classes"] == 80


def test_detect_finds_people_and_bus(client):
    with open(BUS_JPG, "rb") as f:
        res = client.post("/detect", files={"file": ("bus.jpg", f, "image/jpeg")})
    assert res.status_code == 200
    body = res.json()
    names = [d["class_name"] for d in body["detections"]]
    assert "bus" in names
    assert names.count("person") >= 3
    assert body["image"] == {"width": 810, "height": 1080}
    for d in body["detections"]:
        x1, y1, x2, y2 = d["bbox"]
        assert 0 <= x1 < x2 and 0 <= y1 < y2
        assert 0 < d["confidence"] <= 1


def test_confidence_filter(client):
    with open(BUS_JPG, "rb") as f:
        res = client.post("/detect?confidence=0.8", files={"file": ("bus.jpg", f, "image/jpeg")})
    assert all(d["confidence"] >= 0.8 for d in res.json()["detections"])


def test_rgba_png_is_accepted(client):
    buf = io.BytesIO()
    Image.new("RGBA", (64, 64), (0, 0, 0, 0)).save(buf, format="PNG")
    res = client.post("/detect", files={"file": ("x.png", buf.getvalue(), "image/png")})
    assert res.status_code == 200
    assert res.json()["detections"] == []


def test_rejects_non_image(client):
    res = client.post("/detect", files={"file": ("x.txt", b"not an image", "text/plain")})
    assert res.status_code == 400


def test_rejects_empty_file(client):
    res = client.post("/detect", files={"file": ("x.jpg", b"", "image/jpeg")})
    assert res.status_code == 400
