# 🛰️ Border Security Drone Surveillance System

An AI-powered, simulation-based web app for monitoring and managing drone operations along border zones. This project features a responsive frontend dashboard and a Node.js-based backend capable of future AI integrations.

---

## 📂 Project Structure

```
project-D/
├── backend/                      # Node.js backend
│   ├── index.js                  # Server entry point
│   ├── uploads/                  # For image/video input (if needed)
│   ├── package.json
│   └── package-lock.json
│
├── drone-surveillance/          # React frontend (Vite)
│   ├── public/
│   ├── src/
│   ├── yolov5s.pt               # Model placeholder (for planned AI)
│   ├── index.html
│   ├── vite.config.js
│   ├── README.md
│   └── package.json
│
├── .gitignore
├── package.json
└── README.md (this file)
```

---

## 🚀 Key Features

- 🛰️ Simulate drone swarm attacks, GPS jamming, and kamikaze strikes
- 🧠 Toggle AI-powered scenarios with button-based triggers
- 📋 Live threat level monitoring & drone fleet status
- 🔔 Real-time system alerts + operator logs
- ⚙️ Backend ready to process uploaded files and run detection models (planned)

---

## 📚 Tech Stack

### Frontend:
- ⚛️ React.js (with Vite)
- 💨 Tailwind CSS
- 🧠 TensorFlow.js (with COCO-SSD)
- 🎥 MP4 simulation playback and canvas overlay

### Backend:
- 🟢 Node.js
- 📂 Express.js server (index.js)
- ✈️ FastAPI 
- 🧠 Placeholder model file: yolov5s.pt (integration planned)
- 🧪 For image upload & AI inference (future scope)

---

## 💻 Local Setup

### 1. Clone the Repo

```bash
git clone <github url>
cd project-D
```

---

### 2. Start the Frontend

```bash
cd drone-surveillance
npm install
npm run dev
```

> Visit `http://localhost:5173` to view the app.

---

### 3. Start the Backend

```bash
cd ../backend
npm install
node index.js
```

> Default port is usually `http://localhost:3000` (configurable).

---

## 🧠 Planned AI Integration

- 🎯 Use YOLOv5 (`yolov5s.pt`) for real-time object detection
- 📷 Upload images/videos via the backend for AI processing
- 🔗 Bridge TensorFlow.js frontend with Python/Node inference backend

---

## 📈 Impacts

**🧠 Intelligent Border Monitoring**  
Leverages AI and thermal imaging to provide continuous real-time surveillance across national borders. Enables rapid detection and tracking of intrusions, ensuring faster response times and heightened situational awareness.

**🛡️ Risk Reduction for Personnel**  
By automating drone surveillance and threat simulation tasks, the system minimizes the need for human presence in hostile or hazardous environments, reducing exposure to dangerous situations for defense and security personnel.

---

## 🔮 Future Enhancements

- **🛰️ GPS Integration**: Simulate and detect real-time satellite navigation manipulation or signal jamming.
- **🔊 Sound & Voice Alerts**: Incorporate audio-based system notifications and voice command modules for improved accessibility and command execution.
- **🧑‍✈️ Multi-Drone Swarm Control**: Enable synchronized, AI-coordinated multi-drone missions with autonomous decision-making for defense operations.
- **🎯 AI Model Integration**: Real-time object detection using models like YOLOv5 for enhanced threat classification.
- **📡 Real-time Data Streaming**: WebSocket-based communication for live drone telemetry and feed processing.

---

## ⚠️ Disclaimer

This project is a **simulation only**. It does **not** control real drones or defense systems. Intended for educational and project demonstration purposes only.

---
