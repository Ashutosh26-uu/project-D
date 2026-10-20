import { useEffect, useRef, useState } from 'react';
import { api } from '../lib/api';
import { useAuth } from '../lib/auth';
import { useLive } from '../lib/live';
import { summarize } from '../lib/format';
import DetectionOverlay from '../components/DetectionOverlay';
import StatusBadge from '../components/StatusBadge';

async function runDetection(blob, { droneId, source }) {
  const form = new FormData();
  form.append('image', blob, 'frame.jpg');
  form.append('source', source);
  if (droneId) form.append('droneId', droneId);
  return api('/detections', { method: 'POST', form });
}

function DroneSelect({ value, onChange }) {
  const { drones } = useLive();
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="">No drone (manual)</option>
      {Object.values(drones).map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
    </select>
  );
}

function Result({ result }) {
  if (!result) return null;
  const { detection, alert } = result;
  return (
    <div className="result">
      <strong>{summarize(detection.objects)}</strong>
      <span className="muted"> · {detection.inferenceMs} ms inference</span>
      {alert && <div><StatusBadge value={alert.severity} /> Alert raised: {alert.message}</div>}
    </div>
  );
}

function ImageMode({ droneId }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!file) return undefined;
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const detect = async () => {
    setBusy(true);
    setError('');
    try {
      setResult(await runDetection(file, { droneId, source: 'upload' }));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <div className="toolbar">
        <input type="file" accept="image/jpeg,image/png,image/webp,image/bmp"
          onChange={(e) => { setFile(e.target.files[0] || null); setResult(null); }} />
        <button className="btn primary" disabled={!file || busy} onClick={detect}>
          {busy ? 'Detecting…' : 'Run detection'}
        </button>
      </div>
      {error && <div className="error">{error}</div>}
      <Result result={result} />
      {preview && (
        <div className="stage">
          <img src={preview} alt="Selected" />
          {result && (
            <DetectionOverlay objects={result.detection.objects}
              width={result.detection.imageSize.width} height={result.detection.imageSize.height} />
          )}
        </div>
      )}
    </>
  );
}

function VideoMode({ droneId }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [source, setSource] = useState(null); // { kind: 'file', url } | { kind: 'camera', stream }
  const [running, setRunning] = useState(false);
  const [intervalMs, setIntervalMs] = useState(1000);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  // Release the camera / object URL when the source changes or the page unmounts
  useEffect(() => () => {
    if (source?.kind === 'file') URL.revokeObjectURL(source.url);
    if (source?.kind === 'camera') source.stream.getTracks().forEach((t) => t.stop());
  }, [source]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !source) return;
    if (source.kind === 'camera') video.srcObject = source.stream;
    else { video.srcObject = null; video.src = source.url; }
    video.play().catch(() => {});
  }, [source]);

  // Sample one frame at a time: the next request is only sent after the previous one returns,
  // so a slow AI service never builds up a backlog of queued frames
  useEffect(() => {
    if (!running) return undefined;
    let cancelled = false;
    let timer;
    const tick = async () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || video.readyState < 2 || video.paused) {
        timer = setTimeout(tick, 250);
        return;
      }
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext('2d').drawImage(video, 0, 0);
      const blob = await new Promise((r) => canvas.toBlob(r, 'image/jpeg', 0.8));
      try {
        const res = await runDetection(blob, { droneId, source: 'video' });
        if (!cancelled) { setResult(res); setError(''); }
      } catch (err) {
        if (!cancelled) setError(err.message);
      }
      if (!cancelled) timer = setTimeout(tick, intervalMs);
    };
    tick();
    return () => { cancelled = true; clearTimeout(timer); };
  }, [running, intervalMs, droneId]);

  const useCamera = async () => {
    setError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setSource({ kind: 'camera', stream });
    } catch (err) {
      setError(`Camera unavailable: ${err.message}`);
    }
  };

  return (
    <>
      <div className="toolbar">
        <input type="file" accept="video/*" onChange={(e) => {
          const f = e.target.files[0];
          if (f) setSource({ kind: 'file', url: URL.createObjectURL(f) });
        }} />
        <button className="btn" onClick={useCamera}>Use camera</button>
        <label className="inline">
          Every
          <select value={intervalMs} onChange={(e) => setIntervalMs(Number(e.target.value))}>
            {[500, 1000, 2000, 5000].map((ms) => <option key={ms} value={ms}>{ms / 1000}s</option>)}
          </select>
        </label>
        <button className={`btn ${running ? 'danger' : 'primary'}`} disabled={!source}
          onClick={() => setRunning((r) => !r)}>
          {running ? 'Stop' : 'Start detecting'}
        </button>
      </div>
      {error && <div className="error">{error}</div>}
      <Result result={result} />
      <div className="stage" hidden={!source}>
        <video ref={videoRef} muted loop playsInline controls />
        {result && running && (
          <DetectionOverlay objects={result.detection.objects}
            width={result.detection.imageSize.width} height={result.detection.imageSize.height} />
        )}
      </div>
      <canvas ref={canvasRef} hidden />
    </>
  );
}

export default function Detect() {
  const { can } = useAuth();
  const [mode, setMode] = useState('image');
  const [droneId, setDroneId] = useState('');

  if (!can('admin', 'operator')) {
    return <><header className="page-head"><h1>Detect</h1></header><p className="muted">Viewers cannot run detections.</p></>;
  }

  return (
    <>
      <header className="page-head">
        <h1>Detect</h1>
        <div className="tabs">
          <button className={mode === 'image' ? 'active' : ''} onClick={() => setMode('image')}>Image</button>
          <button className={mode === 'video' ? 'active' : ''} onClick={() => setMode('video')}>Video / camera</button>
        </div>
      </header>
      <div className="card">
        <div className="toolbar">
          <label className="inline">Attribute to <DroneSelect value={droneId} onChange={setDroneId} /></label>
        </div>
        {mode === 'image' ? <ImageMode droneId={droneId} /> : <VideoMode droneId={droneId} />}
      </div>
    </>
  );
}
