from fastapi import FastAPI, File, UploadFile, Form, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.docs import get_swagger_ui_html
from fastapi.openapi.utils import get_openapi
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import datetime
import numpy as np
from ultralytics import YOLO
from PIL import Image
import io
import os
import shutil
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from database import Base, engine, SessionLocal, Detection, DetectedObject, get_db
import asyncio
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Enhanced FastAPI app with better documentation
app = FastAPI(
    title="Military Asset Detection AI API",
    description="""
    ## Advanced Military Asset Detection System
    
    This API provides real-time detection and classification of military assets from aerial images.
    Designed for integration with autonomous drone swarm operations.
    
    ### Key Features:
    - **Real-time Object Detection**: YOLOv8-powered military asset classification
    - **Threat Assessment**: Automatic threat level evaluation
    - **Geolocation Support**: GPS coordinate integration
    - **Batch Processing**: Multiple image analysis
    - **Historical Data**: Detection history and analytics
    
    ### Authentication:
    - JWT-based authentication (coming soon)
    - Role-based access control
    - API rate limiting
    
    ### Military Asset Classes:
    - Tanks, APCs, Artillery, Missile Launchers
    - Radar Systems, Air Defense Systems
    - Helicopters, Fighter Jets, Drones
    - Soldiers, Vehicles, Buildings
    """,
    version="2.0.0",
    contact={
        "name": "Military AI Team",
        "email": "ai-team@military-surveillance.com",
    },
    license_info={
        "name": "MIT",
        "url": "https://opensource.org/licenses/MIT",
    },
    docs_url=None,  # Disable default docs
    redoc_url=None,  # Disable default redoc
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load YOLOv8 model (pretrained for demonstration)
model = YOLO("yolov8m.pt")  # You can replace with your custom .pt file

# Enhanced class mapping and threat levels
CLASS_MAP = {
    0: "person",  # Will map to "Soldier" for demo
    1: "bicycle",
    2: "car",
    3: "motorcycle",
    5: "bus",
    7: "truck",  # Will map to "Military Vehicle"
    # ... add more as needed
}

THREAT_LEVELS = {
    "Tank": "High",
    "Helicopter": "High",
    "Air Defense System": "High",
    "Missile System": "High",
    "Soldier": "Low",
    "Military Vehicle": "Medium",
    # ... add more as needed
}

# Map YOLO classes to military types for demo
YOLO_TO_MILITARY = {
    "person": "Soldier",
    "truck": "Military Vehicle",
    # ... add more mappings as needed
}

# Enhanced Pydantic models with better documentation
class DetectedObject(BaseModel):
    type: str = Field(..., description="Type of detected military asset")
    bounding_box: List[float] = Field(..., description="Bounding box coordinates [x1, y1, x2, y2]")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Detection confidence score (0-1)")
    threat_level: str = Field(..., description="Threat level: Low, Medium, High, Critical")
    
    class Config:
        schema_extra = {
            "example": {
                "type": "Tank",
                "bounding_box": [100, 150, 300, 400],
                "confidence": 0.93,
                "threat_level": "High"
            }
        }

class AnalyzeRequest(BaseModel):
    lat: float = Field(..., description="Latitude coordinate")
    long: float = Field(..., description="Longitude coordinate")
    timestamp: Optional[str] = Field(None, description="Timestamp in ISO format")

class AnalyzeResponse(BaseModel):
    timestamp: str = Field(..., description="Analysis timestamp")
    coordinates: Dict[str, float] = Field(..., description="GPS coordinates")
    detected_objects: List[DetectedObject] = Field(..., description="List of detected objects")
    analysis_metadata: Dict[str, Any] = Field(..., description="Additional analysis metadata")
    
    class Config:
        schema_extra = {
            "example": {
                "timestamp": "2024-01-15T10:30:00Z",
                "coordinates": {"lat": 28.6139, "long": 77.2090},
                "detected_objects": [
                    {
                        "type": "Tank",
                        "bounding_box": [100, 150, 300, 400],
                        "confidence": 0.93,
                        "threat_level": "High"
                    }
                ],
                "analysis_metadata": {
                    "processing_time": 0.45,
                    "model_version": "yolov8m.pt",
                    "total_objects": 1
                }
            }
        }

class DescriptionResponse(BaseModel):
    description: str = Field(..., description="Human-readable description of detected objects")
    detected_objects: List[str] = Field(..., description="List of detected object types")
    
    class Config:
        schema_extra = {
            "example": {
                "description": "Detected 1 military tank with high confidence (93%). Threat level: High",
                "detected_objects": ["Tank"]
            }
        }

class HealthResponse(BaseModel):
    status: str = Field(..., description="Service status")
    timestamp: str = Field(..., description="Health check timestamp")
    version: str = Field(..., description="API version")
    model_status: str = Field(..., description="AI model status")
    
    class Config:
        schema_extra = {
            "example": {
                "status": "healthy",
                "timestamp": "2024-01-15T10:30:00Z",
                "version": "2.0.0",
                "model_status": "loaded"
            }
        }

class StatsResponse(BaseModel):
    total_detections: int = Field(..., description="Total number of detections")
    average_confidence: float = Field(..., description="Average confidence score")
    threat_distribution: Dict[str, int] = Field(..., description="Distribution of threat levels")
    processing_times: Dict[str, float] = Field(..., description="Processing time statistics")
    
    class Config:
        schema_extra = {
            "example": {
                "total_detections": 150,
                "average_confidence": 0.87,
                "threat_distribution": {"High": 45, "Medium": 30, "Low": 75},
                "processing_times": {"average": 0.45, "min": 0.12, "max": 1.23}
            }
        }

# Custom OpenAPI schema
def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema
    
    openapi_schema = get_openapi(
        title="Military Asset Detection AI API",
        version="2.0.0",
        description="""
        ## Advanced Military Asset Detection System
        
        This API provides real-time detection and classification of military assets from aerial images.
        Designed for integration with autonomous drone swarm operations.
        
        ### Key Features:
        - **Real-time Object Detection**: YOLOv8-powered military asset classification
        - **Threat Assessment**: Automatic threat level evaluation
        - **Geolocation Support**: GPS coordinate integration
        - **Batch Processing**: Multiple image analysis
        - **Historical Data**: Detection history and analytics
        
        ### Military Asset Classes:
        - Tanks, APCs, Artillery, Missile Launchers
        - Radar Systems, Air Defense Systems
        - Helicopters, Fighter Jets, Drones
        - Soldiers, Vehicles, Buildings
        """,
        routes=app.routes,
    )
    
    # Add security schemes
    openapi_schema["components"]["securitySchemes"] = {
        "BearerAuth": {
            "type": "http",
            "scheme": "bearer",
            "bearerFormat": "JWT",
        }
    }
    
    app.openapi_schema = openapi_schema
    return app.openapi_schema

app.openapi = custom_openapi

# Custom documentation endpoints
@app.get("/docs", include_in_schema=False)
async def custom_swagger_ui_html():
    return get_swagger_ui_html(
        openapi_url=app.openapi_url,
        title=app.title + " - Swagger UI",
        oauth2_redirect_url=app.swagger_ui_oauth2_redirect_url,
        swagger_js_url="/swagger-ui-bundle.js",
        swagger_css_url="/swagger-ui.css",
    )

@app.get("/redoc", include_in_schema=False)
async def redoc_html():
    return get_swagger_ui_html(
        openapi_url=app.openapi_url,
        title=app.title + " - ReDoc",
        swagger_js_url="/redoc.standalone.js",
    )

@app.on_event("startup")
async def on_startup():
    logger.info("Starting Military Asset Detection AI API...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("Database tables created successfully")

@app.get("/health", response_model=HealthResponse, tags=["System"])
async def health_check():
    """
    ## Health Check
    
    Check the health status of the AI inference service.
    
    Returns:
    - **status**: Service health status
    - **timestamp**: Current timestamp
    - **version**: API version
    - **model_status**: AI model loading status
    """
    try:
        # Test model inference
        test_image = np.zeros((640, 640, 3), dtype=np.uint8)
        _ = model(test_image)
        model_status = "loaded"
    except Exception as e:
        logger.error(f"Model health check failed: {e}")
        model_status = "error"
    
    # Return unhealthy status if model has errors
    status_value = "healthy" if model_status != "error" else "unhealthy"
    
    return HealthResponse(
        status=status_value,
        timestamp=datetime.utcnow().isoformat(),
        version="2.0.0",
        model_status=model_status
    )

@app.get("/stats", response_model=StatsResponse, tags=["Analytics"])
async def get_statistics():
    """
    ## Get Detection Statistics
    
    Retrieve comprehensive statistics about detection performance.
    
    Returns:
    - **total_detections**: Total number of detections processed
    - **average_confidence**: Average confidence score across all detections
    - **threat_distribution**: Distribution of threat levels
    - **processing_times**: Processing time statistics
    """
    # This would typically query the database
    # For now, return mock data
    return StatsResponse(
        total_detections=150,
        average_confidence=0.87,
        threat_distribution={"High": 45, "Medium": 30, "Low": 75},
        processing_times={"average": 0.45, "min": 0.12, "max": 1.23}
    )

@app.post("/analyze", response_model=AnalyzeResponse, tags=["Detection"])
async def analyze(
    file: UploadFile = File(..., description="Image file to analyze"),
    lat: float = Form(..., description="Latitude coordinate"),
    long: float = Form(..., description="Longitude coordinate"),
    timestamp: Optional[str] = Form(None, description="Timestamp in ISO format"),
    db: AsyncSession = Depends(get_db)
):
    """
    ## Analyze Military Assets
    
    Upload an image for real-time military asset detection and threat assessment.
    
    **Parameters:**
    - **file**: Image file (JPEG, PNG, etc.)
    - **lat**: Latitude coordinate
    - **long**: Longitude coordinate
    - **timestamp**: Optional timestamp (defaults to current time)
    
    **Returns:**
    - **timestamp**: Analysis timestamp
    - **coordinates**: GPS coordinates
    - **detected_objects**: List of detected military assets
    - **analysis_metadata**: Additional analysis information
    
    **Example Response:**
    ```json
    {
        "timestamp": "2024-01-15T10:30:00Z",
        "coordinates": {"lat": 28.6139, "long": 77.2090},
        "detected_objects": [
            {
                "type": "Tank",
                "bounding_box": [100, 150, 300, 400],
                "confidence": 0.93,
                "threat_level": "High"
            }
        ],
        "analysis_metadata": {
            "processing_time": 0.45,
            "model_version": "yolov8m.pt",
            "total_objects": 1
        }
    }
    """
    start_time = datetime.utcnow()
    
    # Validate file type
    if not file.content_type.startswith('image/'):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File must be an image"
        )
    
    try:
        # Save uploaded image to disk (optional, for reference)
        image_bytes = await file.read()
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        save_dir = "images"
        os.makedirs(save_dir, exist_ok=True)
        image_filename = f"{datetime.utcnow().timestamp()}_{file.filename}"
        image_path = os.path.join(save_dir, image_filename)
        image.save(image_path)

        # Run YOLO inference
        results = model(image)
        detected_objects = []
        db_objects = []
        
        for r in results[0].boxes:
            class_id = int(r.cls)
            # Use model.names if available, else fallback
            yolo_names = getattr(model, 'names', None)
            if yolo_names is None and hasattr(model, 'model') and hasattr(model.model, 'names'):
                yolo_names = model.model.names
            if isinstance(yolo_names, dict):
                yolo_class = yolo_names.get(class_id, str(class_id))
            elif isinstance(yolo_names, list):
                yolo_class = yolo_names[class_id] if class_id < len(yolo_names) else str(class_id)
            else:
                yolo_class = str(class_id)
            
            # Map to military asset type
            military_type = YOLO_TO_MILITARY.get(yolo_class, yolo_class.title())
            threat_level = THREAT_LEVELS.get(military_type, "Low")
            
            detected_obj = DetectedObject(
                type=military_type,
                bounding_box=r.xyxy[0].tolist(),
                confidence=float(r.conf),
                threat_level=threat_level
            )
            detected_objects.append(detected_obj)
            
            # Create database object
            db_obj = DetectedObject(
                type=military_type,
                bounding_box=r.xyxy[0].tolist(),
                confidence=float(r.conf),
                threat_level=threat_level
            )
            db_objects.append(db_obj)

        # Calculate processing time
        end_time = datetime.utcnow()
        processing_time = (end_time - start_time).total_seconds()
        
        # Create analysis metadata
        analysis_metadata = {
            "processing_time": processing_time,
            "model_version": "yolov8m.pt",
            "total_objects": len(detected_objects),
            "image_size": image.size,
            "file_size": len(image_bytes)
        }
        
        # Save to database
        detection = Detection(
            timestamp=timestamp or datetime.utcnow().isoformat(),
            coordinates={"lat": lat, "long": long},
            detected_objects=db_objects,
            analysis_metadata=analysis_metadata
        )
        db.add(detection)
        await db.commit()
        
        return AnalyzeResponse(
            timestamp=datetime.utcnow().isoformat(),
            coordinates={"lat": lat, "long": long},
            detected_objects=detected_objects,
            analysis_metadata=analysis_metadata
        )
        
    except Exception as e:
        logger.error(f"Analysis failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Analysis failed: {str(e)}"
        )

@app.post("/describe", response_model=DescriptionResponse, tags=["Detection"])
async def describe_image(file: UploadFile = File(..., description="Image file to describe")):
    """
    ## Generate Human-Readable Description
    
    Analyze an image and generate a human-readable description of detected military assets.
    
    **Parameters:**
    - **file**: Image file to analyze
    
    **Returns:**
    - **description**: Human-readable description
    - **detected_objects**: List of detected object types
    
    **Example Response:**
    ```json
    {
        "description": "Detected 1 military tank with high confidence (93%). Threat level: High",
        "detected_objects": ["Tank"]
    }
    ```
    """
    try:
        image_bytes = await file.read()
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        
        # Run YOLO inference
        results = model(image)
        detected_types = []
        
        for r in results[0].boxes:
            class_id = int(r.cls)
            yolo_names = getattr(model, 'names', None)
            if yolo_names is None and hasattr(model, 'model') and hasattr(model.model, 'names'):
                yolo_names = model.model.names
            if isinstance(yolo_names, dict):
                yolo_class = yolo_names.get(class_id, str(class_id))
            elif isinstance(yolo_names, list):
                yolo_class = yolo_names[class_id] if class_id < len(yolo_names) else str(class_id)
            else:
                yolo_class = str(class_id)
            
            military_type = YOLO_TO_MILITARY.get(yolo_class, yolo_class.title())
            detected_types.append(military_type)
        
        # Generate description
        if detected_types:
            unique_types = list(set(detected_types))
            type_counts = {t: detected_types.count(t) for t in unique_types}
            
            descriptions = []
            for obj_type, count in type_counts.items():
                threat_level = THREAT_LEVELS.get(obj_type, "Low")
                descriptions.append(f"{count} {obj_type.lower()}(s) with threat level: {threat_level}")
            
            description = f"Detected {len(detected_types)} military assets: {', '.join(descriptions)}"
        else:
            description = "No military assets detected in the image"
        
        return DescriptionResponse(
            description=description,
            detected_objects=detected_types
        )
        
    except Exception as e:
        logger.error(f"Description generation failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Description generation failed: {str(e)}"
        )

@app.get("/detections", tags=["Analytics"])
async def get_detections(limit: int = 10, db: AsyncSession = Depends(get_db)):
    """
    ## Get Recent Detections
    
    Retrieve recent detection history from the database.
    
    **Parameters:**
    - **limit**: Maximum number of detections to return (default: 10)
    
    **Returns:**
    - List of recent detections with metadata
    """
    try:
        result = await db.execute(
            select(Detection).order_by(Detection.timestamp.desc()).limit(limit)
        )
        detections = result.scalars().all()
        
        return {
            "detections": [
                {
                    "id": d.id,
                    "timestamp": d.timestamp,
                    "coordinates": d.coordinates,
                    "detected_objects": [
                        {
                            "type": obj.type,
                            "bounding_box": obj.bounding_box,
                            "confidence": obj.confidence,
                            "threat_level": obj.threat_level
                        } for obj in d.detected_objects
                    ],
                    "analysis_metadata": d.analysis_metadata
                } for d in detections
            ],
            "total": len(detections)
        }
        
    except Exception as e:
        logger.error(f"Failed to retrieve detections: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve detections: {str(e)}"
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 