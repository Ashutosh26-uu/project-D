import { lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { useLive } from '../lib/live';
import { fmt, summarize, timeAgo } from '../lib/format';
import StatusBadge from '../components/StatusBadge';

const FleetMap = lazy(() => import('../components/FleetMap'));

export default function Overview() {
  const { drones, alerts, detections } = useLive();
  const list = Object.values(drones).sort((a, b) => a.name.localeCompare(b.name));
  const online = list.filter((d) => d.status !== 'offline').length;
  const open = alerts.filter((a) => a.status === 'open');

  return (
    <>
      <header className="page-head">
        <h1>Overview</h1>
      </header>

      <section className="stats">
        <div className="stat"><span className="muted">Drones</span><strong>{list.length}</strong></div>
        <div className="stat"><span className="muted">Online</span><strong>{online}</strong></div>
        <div className="stat"><span className="muted">Open alerts</span><strong className={open.length ? 'text-danger' : ''}>{open.length}</strong></div>
        <div className="stat"><span className="muted">Detections (live)</span><strong>{detections.length}</strong></div>
      </section>

      <section className="grid-2">
        <div className="card">
          <h2>Fleet map</h2>
          <Suspense fallback={<div className="map placeholder" />}>
            <FleetMap drones={list} />
          </Suspense>
        </div>

        <div className="card">
          <h2>Fleet</h2>
          {list.length === 0 ? (
            <p className="muted">No drones registered. <Link to="/drones">Add one</Link>.</p>
          ) : (
            <table>
              <thead><tr><th>Name</th><th>Status</th><th>Battery</th><th>Alt</th><th>Seen</th></tr></thead>
              <tbody>
                {list.map((d) => (
                  <tr key={d.id}>
                    <td>{d.name}</td>
                    <td><StatusBadge value={d.status} /></td>
                    <td>{fmt(d.telemetry?.battery, '%')}</td>
                    <td>{fmt(d.telemetry?.altitude, ' m')}</td>
                    <td className="muted">{timeAgo(d.lastSeenAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      <section className="card">
        <h2>Latest alerts <Link className="small" to="/alerts">View all</Link></h2>
        {open.length === 0 ? <p className="muted">No open alerts.</p> : (
          <ul className="feed">
            {open.slice(0, 5).map((a) => (
              <li key={a.id}>
                <StatusBadge value={a.severity} /> {a.message}
                <span className="muted"> · {drones[a.drone]?.name || 'manual upload'} · {timeAgo(a.createdAt)}</span>
              </li>
            ))}
          </ul>
        )}
        {detections.length > 0 && (
          <>
            <h2>Live detections</h2>
            <ul className="feed">
              {detections.slice(0, 5).map((d) => (
                <li key={d.id}>
                  {summarize(d.objects)}
                  <span className="muted"> · {drones[d.drone]?.name || d.source} · {timeAgo(d.createdAt)}</span>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>
    </>
  );
}
