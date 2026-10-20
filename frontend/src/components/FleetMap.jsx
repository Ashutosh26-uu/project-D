import { useEffect, useRef } from 'react';
import { CircleMarker, MapContainer, Popup, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { fmt, timeAgo } from '../lib/format';

const COLORS = { active: '#22c55e', idle: '#38bdf8', returning: '#f59e0b', maintenance: '#a855f7', offline: '#64748b' };

// Fits the view whenever the number of located drones changes, not on every telemetry tick,
// so the operator's own panning/zooming isn't constantly undone
function FitToDrones({ points }) {
  const map = useMap();
  const pointsRef = useRef(points);
  pointsRef.current = points;
  useEffect(() => {
    const pts = pointsRef.current;
    if (pts.length === 1) map.setView(pts[0], 14);
    else if (pts.length > 1) map.fitBounds(pts, { padding: [40, 40], maxZoom: 15 });
  }, [map, points.length]);
  return null;
}

export default function FleetMap({ drones, height = 380 }) {
  const located = drones.filter((d) => d.telemetry?.lat !== undefined && d.telemetry?.lng !== undefined);
  const points = located.map((d) => [d.telemetry.lat, d.telemetry.lng]);

  return (
    <div className="map" style={{ height }}>
      <MapContainer center={[20, 0]} zoom={2} style={{ height: '100%' }} scrollWheelZoom>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitToDrones points={points} />
        {located.map((d) => (
          <CircleMarker
            key={d.id}
            center={[d.telemetry.lat, d.telemetry.lng]}
            radius={9}
            pathOptions={{ color: '#0f172a', weight: 2, fillColor: COLORS[d.status] || COLORS.offline, fillOpacity: 0.95 }}
          >
            <Popup>
              <strong>{d.name}</strong> · {d.status}
              <br />Battery {fmt(d.telemetry.battery, '%')} · Alt {fmt(d.telemetry.altitude, ' m')}
              <br />Seen {timeAgo(d.lastSeenAt)}
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
      {located.length === 0 && <div className="map-empty">No drone has reported a position yet</div>}
    </div>
  );
}
