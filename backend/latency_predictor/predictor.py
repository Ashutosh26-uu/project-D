# latency_predictor/predictor.py
# Microservice for latency handling and predictive buffer logic

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import threading
import time

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class LatencyReport(BaseModel):
    drone_id: str
    latency_ms: float
    timestamp: Optional[float] = None

class BufferStateRequest(BaseModel):
    drone_id: str

# Thread-safe in-memory buffer state
buffer_states = {}
buffer_lock = threading.Lock()

@app.get("/health")
def health():
    return {"status": "ok", "service": "latency_predictor"}

@app.post("/report-latency")
def report_latency(report: LatencyReport):
    # Thread-safe store or process latency
    with buffer_lock:
        buffer_states[report.drone_id] = {
            "latency_ms": report.latency_ms, 
            "timestamp": report.timestamp or time.time()
        }
    return {"status": "received", "drone_id": report.drone_id}

@app.post("/buffer-state")
def buffer_state(req: BufferStateRequest):
    # Thread-safe return buffer state
    with buffer_lock:
        state = buffer_states.get(req.drone_id, {"latency_ms": None, "timestamp": None})
    return {"drone_id": req.drone_id, "buffer_state": state}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5500) 