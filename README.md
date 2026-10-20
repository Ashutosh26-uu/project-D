# Drone Ops

A fleet dashboard for camera drones: live telemetry on a map, YOLOv8 object detection on images and video, and alerts when objects of interest are seen.

```
 browser ──► frontend (nginx :8080) ──/api, /ws──► backend (Node :5000) ──► MongoDB
                                                        │
 drones ──── WebSocket /ws (device token) ──────────────┤
                                                        └──► ai-service (FastAPI + YOLOv8 :8000, internal)
```

| Part | Stack | What it does |
|---|---|---|
| `frontend/` | React 19, Vite, Leaflet | Login, fleet overview + map, drone management, image/video detection, alerts, user admin |
| `backend/` | Node 22, Express 5, Mongoose, ws | Auth (JWT, roles), REST API, realtime gateway on `/ws`, alert rules |
| `ai-service/` | FastAPI, Ultralytics YOLOv8n (CPU) | `POST /detect`: returns boxes, classes and confidences for one image |

## Run it with Docker

```bash
cp .env.example .env    # then set JWT_SECRET, AI_SERVICE_TOKEN and ADMIN_PASSWORD
docker compose up --build
```

Open http://localhost:8080 and sign in with `ADMIN_USERNAME` / `ADMIN_PASSWORD`. The admin is created only when the database has no users.

## Develop locally

Needs Node 22+, Python 3.11+ and a MongoDB on `localhost:27017`.

```bash
# AI service
cd ai-service
python -m venv .venv && .venv/Scripts/activate   # or: source .venv/bin/activate
pip install -r requirements-dev.txt
uvicorn app.main:app --port 8000

# Backend (copy .env.example to .env and fill it in first)
cd backend && npm install && npm run dev

# Frontend: proxies /api and /ws to localhost:5000
cd frontend && npm install && npm run dev       # http://localhost:3000
```

Tests: `npm test` in `backend/`, `pytest` in `ai-service/`, and `npm run lint && npm run build` in `frontend/`. CI runs all three and builds the Docker images.

## Roles

| Role | Can |
|---|---|
| viewer | See the fleet, detections and alerts |
| operator | Also add and edit drones, run detections, acknowledge alerts |
| admin | Also remove drones, issue drone tokens, manage users |

## Connecting a drone

1. On the **Drones** page, add the drone, then click **Token** (admin only). Copy the token, which is shown once. Issuing a new token revokes the old one.
2. From the drone, open a WebSocket to `ws(s)://<host>/ws` and authenticate within 5 seconds:

```json
{"type": "auth", "token": "<device token>"}
```

3. Stream telemetry. All fields are optional, and send as often as you like: the backend stores and broadcasts the latest values once per second.

```json
{"type": "telemetry", "data": {"battery": 87, "altitude": 120, "speed": 12.5, "heading": 270, "signal": 92, "lat": 28.6139, "lng": 77.209}}
```

4. Optionally report a status (`idle`, `active`, `returning` or `maintenance`):

```json
{"type": "status", "status": "active"}
```

A drone is marked offline when its socket closes or after 30 seconds without messages. To run detection on a drone's camera feed, post frames to `POST /api/detections` with `droneId` set. The Detect page in video mode does the same thing for a video file or webcam.

## API summary

All endpoints are under `/api` and need `Authorization: Bearer <token>` except login and health.

| Method | Path | Role |
|---|---|---|
| POST | `/auth/login` | — |
| GET | `/auth/me` | any |
| GET / POST / PATCH / DELETE | `/users`, `/users/:id` | admin |
| GET | `/drones`, `/drones/:id` | any |
| POST, PATCH | `/drones`, `/drones/:id` | operator |
| DELETE | `/drones/:id` | admin |
| POST | `/drones/:id/token` | admin |
| GET | `/detections?droneId=&limit=&before=` | any |
| POST | `/detections` (multipart `image`, optional `droneId`, `source`, `lat`, `lng`, `confidence`) | operator |
| GET | `/alerts?status=&limit=&before=` | any |
| POST | `/alerts/:id/ack` | operator |
| GET | `/health` | — |

Viewers who connect to `/ws` with a login token receive `drone`, `drone_removed`, `telemetry`, `detection` and `alert` events.

## Configuration

| Variable | Default | Notes |
|---|---|---|
| `JWT_SECRET` | — | Required, 32+ chars |
| `AI_SERVICE_TOKEN` | — | Shared secret between the backend and the AI service |
| `ADMIN_USERNAME` / `ADMIN_PASSWORD` | `admin` / — | Seeds the first admin; the password needs 12+ chars |
| `ALERT_CLASSES` | `person,car,truck,bus,motorcycle,airplane,boat` | COCO class names that raise alerts |
| `ALERT_MIN_CONFIDENCE` | `0.5` | |
| `ALERT_COOLDOWN_MS` | `60000` | An identical open alert isn't raised again within this window |
| `DRONE_OFFLINE_MS` | `30000` | |
| `MAX_CONCURRENCY` (ai-service) | `2` | Parallel inferences; further requests queue |

The bundled model is the stock COCO-trained `yolov8n.pt`. To use your own weights, set `MODEL_PATH` on the AI service.
