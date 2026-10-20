from fastapi import FastAPI, File, UploadFile, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
from ultralytics import YOLO
from PIL import Image, ImageDraw, ImageFont
import cv2
import numpy as np
import base64
import io
import os
import logging
import asyncio
import threading
import time
import json
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from dotenv import load_dotenv
import uvicorn

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# FastAPI app initialization
app = FastAPI(
    title="Advanced Drone Surveillance AI Inference Service",
    description="Military-grade AI inference service with YOLOv8 object detection and threat assessment",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuration
# Not PORT: load_dotenv() reads backend/.env, whose PORT belongs to the Node backend
PORT = int(os.getenv('AI_INFERENCE_PORT', 5800))
MODEL_PATH = os.getenv('MODEL_PATH', os.path.join(os.path.dirname(os.path.abspath(__file__)), 'yolov8n.pt'))
BACKEND_URL = os.getenv('BACKEND_URL', 'http://localhost:5000')
# Set to an empty string to disable the backend WebSocket link
WEBSOCKET_URL = os.getenv('WEBSOCKET_URL', 'ws://localhost:8080')

# Pydantic models for request/response
class DetectionRequest(BaseModel):
    image: str  # base64 encoded image
    drone_id: Optional[str] = None
    timestamp: Optional[float] = None

class DetectionResponse(BaseModel):
    success: bool
    detections: List[Dict[str, Any]]
    count: int
    timestamp: float

class BatchAnalysisRequest(BaseModel):
    images: List[str]  # List of base64 encoded images

class ThreatAlert(BaseModel):
    drone_id: str
    threats: List[Dict[str, Any]]
    severity: str
    timestamp: str

# Global variables
model = None
active_connections: List[WebSocket] = []

# COCO class names for YOLOv8
COCO_CLASSES = [
    "person", "bicycle", "car", "motorcycle", "airplane", "bus", "train", "truck", "boat",
    "traffic light", "fire hydrant", "stop sign", "parking meter", "bench", "bird", "cat",
    "dog", "horse", "sheep", "cow", "elephant", "bear", "zebra", "giraffe", "backpack",
    "umbrella", "handbag", "tie", "suitcase", "frisbee", "skis", "snowboard", "sports ball",
    "kite", "baseball bat", "baseball glove", "skateboard", "surfboard", "tennis racket",
    "bottle", "wine glass", "cup", "fork", "knife", "spoon", "bowl", "banana", "apple",
    "sandwich", "orange", "broccoli", "carrot", "hot dog", "pizza", "donut", "cake", "chair",
    "couch", "potted plant", "bed", "dining table", "toilet", "tv", "laptop", "mouse",
    "remote", "keyboard", "cell phone", "microwave", "oven", "toaster", "sink", "refrigerator",
    "book", "clock", "vase", "scissors", "teddy bear", "hair drier", "toothbrush"
]

class AIInferenceService:
    def __init__(self):
        self.model = None
        self.load_model()
        self.backend_ws = None
        self.backend_ws_connected = False
        if WEBSOCKET_URL:
            self.setup_backend_websocket()
    
    def load_model(self):
        """Load YOLOv8 model"""
        try:
            logger.info(f"Loading YOLOv8 model from {MODEL_PATH}")
            self.model = YOLO(MODEL_PATH)
            logger.info("YOLOv8 model loaded successfully")
            global model
            model = self.model
        except Exception as e:
            logger.error(f"Error loading model: {str(e)}")
            raise
    
    def setup_backend_websocket(self):
        """Setup WebSocket connection to backend"""
        def run_websocket():
            try:
                import websocket
                
                def on_message(ws, message):
                    try:
                        data = json.loads(message)
                        if data.get('type') == 'detection_request':
                            # Runs on the websocket-client thread; there is no asyncio loop here
                            self.process_detection_request(data)
                    except Exception as e:
                        logger.error(f"WebSocket message error: {str(e)}")
                
                def on_error(ws, error):
                    logger.error(f"WebSocket error: {error}")
                
                def on_close(ws, close_status_code, close_msg):
                    self.backend_ws_connected = False
                    logger.info("Backend WebSocket connection closed")
                
                def on_open(ws):
                    self.backend_ws_connected = True
                    logger.info("Backend WebSocket connection opened")
                    # Register as AI service
                    ws.send(json.dumps({
                        'type': 'service_registration',
                        'service': 'ai_inference',
                        'port': PORT
                    }))
                
                self.backend_ws = websocket.WebSocketApp(
                    WEBSOCKET_URL,
                    on_open=on_open,
                    on_message=on_message,
                    on_error=on_error,
                    on_close=on_close
                )
                
                # Retry until the backend is reachable (it may start after this service)
                self.backend_ws.run_forever(reconnect=5)
                
            except Exception as e:
                logger.error(f"WebSocket setup error: {str(e)}")
        
        # Start WebSocket in a separate thread
        ws_thread = threading.Thread(target=run_websocket)
        ws_thread.daemon = True
        ws_thread.start()
    
    def process_detection_request(self, data):
        """Process detection request from WebSocket"""
        try:
            image_data = data.get('image')
            drone_id = data.get('drone_id')
            
            if image_data:
                # Decode base64 image
                image_bytes = base64.b64decode(image_data)
                image = Image.open(io.BytesIO(image_bytes))
                
                # Perform detection
                results = self.detect_objects(image)
                
                # Send results back via WebSocket
                if self.backend_ws and self.backend_ws_connected:
                    response = {
                        'type': 'detection_results',
                        'drone_id': drone_id,
                        'results': results,
                        'timestamp': time.time()
                    }
                    self.backend_ws.send(json.dumps(response))
                
        except Exception as e:
            logger.error(f"Detection request processing error: {str(e)}")
    
    def detect_objects(self, image):
        """Perform object detection on image"""
        try:
            # Pass the PIL image directly: ultralytics treats numpy arrays as BGR,
            # and RGBA/greyscale inputs need converting to RGB first
            results = self.model(image.convert("RGB"), verbose=False)
            
            detections = []
            for result in results:
                boxes = result.boxes
                if boxes is not None:
                    for box in boxes:
                        # Extract detection information
                        x1, y1, x2, y2 = box.xyxy[0].tolist()
                        confidence = float(box.conf[0])
                        class_id = int(box.cls[0])
                        class_name = self.model.names.get(class_id, str(class_id))
                        
                        # Military asset classification
                        threat_level = self.classify_threat_level(class_name, confidence)
                        
                        detection = {
                            'bbox': [x1, y1, x2, y2],
                            'confidence': confidence,
                            'class_id': class_id,
                            'class_name': class_name,
                            'threat_level': threat_level,
                            'description': self.generate_description(class_name, confidence)
                        }
                        detections.append(detection)
            
            return detections
            
        except Exception as e:
            logger.error(f"Object detection error: {str(e)}")
            return []
    
    def classify_threat_level(self, class_name, confidence):
        """Classify threat level based on detected object"""
        military_assets = {
            'person': 'medium',
            'car': 'low',
            'truck': 'medium',
            'airplane': 'high',
            'helicopter': 'high',
            'boat': 'medium',
            'motorcycle': 'low'
        }
        
        base_threat = military_assets.get(class_name.lower(), 'low')
        
        # Adjust threat level based on confidence
        if confidence > 0.8:
            if base_threat == 'low':
                return 'medium'
            elif base_threat == 'medium':
                return 'high'
        
        return base_threat
    
    def generate_description(self, class_name, confidence):
        """Generate human-readable description"""
        confidence_text = "high" if confidence > 0.8 else "medium" if confidence > 0.5 else "low"
        return f"Detected {class_name} with {confidence_text} confidence ({confidence:.2f})"

# Initialize AI service
ai_service = AIInferenceService()

# WebSocket connection manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            await connection.send_text(message)

manager = ConnectionManager()

# API Endpoints

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        'status': 'healthy',
        'service': 'ai_inference_fastapi',
        'model_loaded': ai_service.model is not None,
        'timestamp': time.time()
    }

@app.post("/detect", response_model=DetectionResponse)
def detect_objects_endpoint(request: DetectionRequest):
    """Object detection endpoint"""
    try:
        if not request.image:
            raise HTTPException(status_code=400, detail="No image data provided")
        
        # Decode base64 image
        image_bytes = base64.b64decode(request.image)
        image = Image.open(io.BytesIO(image_bytes))
        
        # Perform detection
        results = ai_service.detect_objects(image)
        
        return DetectionResponse(
            success=True,
            detections=results,
            count=len(results),
            timestamp=time.time()
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Detection endpoint error: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Invalid image data: {str(e)}")

@app.post("/analyze")
async def analyze_with_image(file: UploadFile = File(...), return_image: bool = False):
    """Analyze uploaded image file with optional annotated image return"""
    try:
        image_bytes = await file.read()
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        
        # Perform detection
        results = ai_service.detect_objects(image)
        
        if return_image:
            # Draw bounding boxes on image
            draw = ImageDraw.Draw(image)
            font = None
            try:
                font = ImageFont.truetype("arial.ttf", 18)
            except:
                font = None

            for detection in results:
                bbox = detection['bbox']
                class_name = detection['class_name']
                confidence = detection['confidence']
                
                # Draw bounding box
                draw.rectangle(bbox, outline="red", width=2)
                label = f"{class_name} {confidence:.2f}"
                
                if font:
                    draw.text((bbox[0], bbox[1] - 20), label, fill="red", font=font)
                else:
                    draw.text((bbox[0], bbox[1] - 20), label, fill="red")

            # Return annotated image
            buf = io.BytesIO()
            image.save(buf, format="JPEG")
            buf.seek(0)
            return StreamingResponse(buf, media_type="image/jpeg")

        return {"detections": results, "count": len(results)}
        
    except Exception as e:
        logger.error(f"Analyze endpoint error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/model/info")
async def model_info():
    """Get model information"""
    try:
        if ai_service.model:
            return {
                'model_path': MODEL_PATH,
                'model_type': 'YOLOv8',
                'classes': list(ai_service.model.names.values()),
                'num_classes': len(ai_service.model.names)
            }
        else:
            raise HTTPException(status_code=500, detail="Model not loaded")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/analyze/batch")
async def batch_analysis(request: BatchAnalysisRequest):
    """Batch analysis endpoint for multiple images"""
    try:
        if not request.images:
            raise HTTPException(status_code=400, detail="No images provided")
        
        results = []
        for i, image_data in enumerate(request.images):
            try:
                # Decode and process each image
                image_bytes = base64.b64decode(image_data)
                image = Image.open(io.BytesIO(image_bytes))
                
                detections = ai_service.detect_objects(image)
                results.append({
                    'image_index': i,
                    'detections': detections,
                    'count': len(detections)
                })
            except Exception as e:
                results.append({
                    'image_index': i,
                    'error': str(e),
                    'detections': [],
                    'count': 0
                })
        
        return {
            'success': True,
            'results': results,
            'total_images': len(request.images),
            'timestamp': time.time()
        }
        
    except Exception as e:
        logger.error(f"Batch analysis error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/stats")
async def get_stats():
    """Get AI service statistics"""
    return {
        'service': 'ai_inference_fastapi',
        'status': 'running',
        'model_loaded': ai_service.model is not None,
        'backend_ws_connected': ai_service.backend_ws_connected,
        'port': PORT,
        'timestamp': time.time()
    }

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket endpoint for real-time communication"""
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            
            if message.get('type') == 'detection_request':
                # Process detection request
                image_data = message.get('image')
                if image_data:
                    image_bytes = base64.b64decode(image_data)
                    image = Image.open(io.BytesIO(image_bytes))
                    results = ai_service.detect_objects(image)
                    
                    response = {
                        'type': 'detection_results',
                        'results': results,
                        'timestamp': time.time()
                    }
                    await websocket.send_text(json.dumps(response))
            
    except WebSocketDisconnect:
        manager.disconnect(websocket)

# Startup event
@app.on_event("startup")
async def startup_event():
    logger.info(f"FastAPI AI Inference Service starting on port {PORT}")
    logger.info(f"Model path: {MODEL_PATH}")
    logger.info(f"Backend URL: {BACKEND_URL}")

# Main execution
if __name__ == "__main__":
    logger.info(f"Starting FastAPI AI Inference Service on port {PORT}")
    uvicorn.run(app, host="0.0.0.0", port=PORT)