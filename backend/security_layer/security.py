# security_layer/security.py
# Microservice for security: JWT, AES-256, digital signatures, key rotation
# Added: Jamming-resistant communication, encrypted blackbox logging

from fastapi import FastAPI, HTTPException, File, UploadFile, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import time
import json
import os
import uuid
import random
import base64
import hashlib
from datetime import datetime, timedelta, timezone

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AuthRequest(BaseModel):
    username: str
    password: str

class EncryptRequest(BaseModel):
    plaintext: str
    key: str

class DecryptRequest(BaseModel):
    ciphertext: str
    key: str

class SignatureRequest(BaseModel):
    message: str
    signature: str
    public_key: str

class BlackboxLogEntry(BaseModel):
    drone_id: str
    timestamp: str
    log_type: str  # 'telemetry', 'camera', 'mission', 'system', 'error'
    data: Dict[str, Any]
    hash: Optional[str] = None

class FrequencyHopRequest(BaseModel):
    drone_id: str
    current_frequency: float  # MHz
    jamming_detected: bool = False
    signal_strength: Optional[float] = None  # dBm

class OpticalSignalRequest(BaseModel):
    drone_id: str
    message: str
    priority: int = 1  # 1-5, higher is more important

class JammingReport(BaseModel):
    drone_id: str
    timestamp: str
    frequencies: List[float]  # MHz
    signal_strengths: List[float]  # dBm
    location: Optional[List[float]] = None  # [lat, lon, alt]

# In-memory state for security features
blackbox_logs = {}  # drone_id -> list of encrypted log entries
frequency_hop_sequence = {}  # drone_id -> list of frequencies
current_frequencies = {}  # drone_id -> current frequency
jamming_reports = []  # List of jamming reports
key_rotation_schedule = {}  # key_id -> next rotation time

# Helper functions for security features
def generate_frequency_hop_sequence(drone_id: str, num_frequencies: int = 50):
    """Generate a pseudo-random frequency hopping sequence"""
    # Seed the random generator with drone_id for reproducibility
    random.seed(drone_id + str(int(time.time() / 3600)))  # Change every hour
    
    # Generate frequencies in the range 902-928 MHz (ISM band)
    base_frequencies = [902.0 + i * 0.5 for i in range(52)]  # 0.5 MHz steps
    
    # Randomly select frequencies from the base set
    sequence = random.sample(base_frequencies, min(num_frequencies, len(base_frequencies)))
    
    # Store the sequence
    frequency_hop_sequence[drone_id] = sequence
    current_frequencies[drone_id] = sequence[0]
    
    return sequence

def encrypt_log_entry(entry: BlackboxLogEntry, key: str):
    """Encrypt a log entry (stub implementation)"""
    # In a real implementation, this would use AES-256 encryption
    # For this stub, we'll use a simple hash-based approach
    
    # Convert entry to JSON string
    entry_json = json.dumps(entry.dict())
    
    # Calculate hash
    entry_hash = hashlib.sha256((entry_json + key).encode()).hexdigest()
    
    # Set the hash
    entry.hash = entry_hash
    
    # Simulate encryption by encoding to base64
    encrypted = base64.b64encode(entry_json.encode()).decode()
    
    return {
        "encrypted_data": encrypted,
        "hash": entry_hash,
        "timestamp": entry.timestamp
    }

def verify_log_integrity(drone_id: str):
    """Verify the integrity of the blackbox log chain"""
    if drone_id not in blackbox_logs or not blackbox_logs[drone_id]:
        return True  # No logs to verify
    
    # In a real implementation, this would verify the hash chain
    # For this stub, we'll assume all logs are valid
    return True

@app.get("/health")
def health():
    return {
        "status": "ok", 
        "service": "security_layer",
        "active_drones": len(current_frequencies),
        "jamming_reports": len(jamming_reports)
    }

@app.post("/auth/jwt")
def jwt_auth(req: AuthRequest):
    # Stub: always return a fake JWT
    fake_jwt = f"jwt-token-for-{req.username}-{int(time.time())}"
    return {"token": fake_jwt, "expires": (datetime.now(timezone.utc) + timedelta(hours=24)).isoformat()}

@app.post("/encrypt/aes256")
def encrypt_aes256(req: EncryptRequest):
    # Stub: return reversed string as 'ciphertext'
    # In a real implementation, this would use AES-256 encryption
    return {"ciphertext": base64.b64encode(req.plaintext[::-1].encode()).decode()}

@app.post("/decrypt/aes256")
def decrypt_aes256(req: DecryptRequest):
    # Stub: reverse again to get plaintext
    # In a real implementation, this would use AES-256 decryption
    try:
        decoded = base64.b64decode(req.ciphertext).decode()
        return {"plaintext": decoded[::-1]}
    except:
        return {"plaintext": req.ciphertext[::-1]}

@app.post("/verify/signature")
def verify_signature(req: SignatureRequest):
    # Stub: always return True
    # In a real implementation, this would verify the digital signature
    return {"valid": True}

# New endpoints for jamming-resistant communication
@app.post("/frequency-hop")
def get_next_frequency(req: FrequencyHopRequest):
    """Get the next frequency in the hopping sequence"""
    drone_id = req.drone_id
    
    # Generate a new sequence if one doesn't exist
    if drone_id not in frequency_hop_sequence:
        generate_frequency_hop_sequence(drone_id)
    
    sequence = frequency_hop_sequence[drone_id]
    
    # If jamming is detected, skip ahead in the sequence
    if req.jamming_detected:
        # Record the jamming report
        jamming_reports.append({
            "drone_id": drone_id,
            "timestamp": datetime.now().isoformat(),
            "frequency": req.current_frequency,
            "signal_strength": req.signal_strength
        })
        
        # Skip ahead by a random amount
        skip_amount = random.randint(3, 10)
        current_index = sequence.index(current_frequencies[drone_id])
        next_index = (current_index + skip_amount) % len(sequence)
    else:
        # Move to the next frequency in sequence
        current_index = sequence.index(current_frequencies[drone_id])
        next_index = (current_index + 1) % len(sequence)
    
    # Update current frequency
    current_frequencies[drone_id] = sequence[next_index]
    
    return {
        "drone_id": drone_id,
        "next_frequency": sequence[next_index],
        "index": next_index,
        "sequence_length": len(sequence),
        "timestamp": datetime.now().isoformat()
    }

@app.post("/optical-signal")
def send_optical_signal(req: OpticalSignalRequest):
    """Simulate sending a message via optical signaling (IR/visible light)"""
    # In a real implementation, this would encode the message for optical transmission
    # For this stub, we'll just acknowledge receipt
    
    # Encode message to simulate optical encoding
    encoded_message = base64.b64encode(req.message.encode()).decode()
    
    return {
        "status": "transmitted",
        "drone_id": req.drone_id,
        "encoded_message": encoded_message,
        "priority": req.priority,
        "timestamp": datetime.now().isoformat()
    }

@app.post("/jamming-report")
def report_jamming(report: JammingReport):
    """Report detected jamming signals"""
    # Add the report to our list
    jamming_reports.append(report.dict())
    
    # In a real implementation, this would trigger countermeasures
    # For this stub, we'll just acknowledge receipt
    
    return {
        "received": True,
        "report_id": len(jamming_reports) - 1,
        "timestamp": datetime.now().isoformat()
    }

# New endpoints for encrypted blackbox logging
@app.post("/blackbox/log")
def add_blackbox_log(entry: BlackboxLogEntry):
    """Add an encrypted entry to the drone's blackbox log"""
    drone_id = entry.drone_id
    
    # Initialize log for this drone if it doesn't exist
    if drone_id not in blackbox_logs:
        blackbox_logs[drone_id] = []
    
    # Generate a key for encryption (in a real implementation, this would be securely stored)
    key = f"key-{drone_id}-{len(blackbox_logs[drone_id])}"
    
    # Encrypt the log entry
    encrypted_entry = encrypt_log_entry(entry, key)
    
    # Add to the log
    blackbox_logs[drone_id].append(encrypted_entry)
    
    return {
        "logged": True,
        "drone_id": drone_id,
        "log_id": len(blackbox_logs[drone_id]) - 1,
        "hash": encrypted_entry["hash"]
    }

@app.get("/blackbox/logs/{drone_id}")
def get_blackbox_logs(drone_id: str, start_index: int = 0, count: int = 100):
    """Get encrypted blackbox logs for a drone"""
    if drone_id not in blackbox_logs:
        return {"logs": [], "count": 0}
    
    logs = blackbox_logs[drone_id][start_index:start_index + count]
    
    return {
        "logs": logs,
        "count": len(logs),
        "total": len(blackbox_logs[drone_id]),
        "integrity_verified": verify_log_integrity(drone_id)
    }

@app.post("/blackbox/verify/{drone_id}")
def verify_blackbox(drone_id: str):
    """Verify the integrity of a drone's blackbox logs"""
    if drone_id not in blackbox_logs:
        return {"verified": False, "error": "No logs found for this drone"}
    
    # In a real implementation, this would verify the hash chain
    # For this stub, we'll assume all logs are valid
    
    return {
        "verified": True,
        "drone_id": drone_id,
        "log_count": len(blackbox_logs[drone_id]),
        "timestamp": datetime.now().isoformat()
    }

@app.post("/key-rotation/schedule")
def schedule_key_rotation(request: Dict[str, Any]):
    """Schedule a key rotation"""
    key_id = request.get("key_id", str(uuid.uuid4()))
    rotation_time = request.get("rotation_time", (datetime.now() + timedelta(days=7)).isoformat())
    
    key_rotation_schedule[key_id] = rotation_time
    
    return {
        "scheduled": True,
        "key_id": key_id,
        "rotation_time": rotation_time
    }

if __name__ == "__main__":
    import uvicorn
    import os
    port = int(os.getenv("PORT", 5450))
    uvicorn.run(app, host="0.0.0.0", port=port)