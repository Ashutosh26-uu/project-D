import { useState } from 'react';
import { api } from '../lib/api';
import { useAuth } from '../lib/auth';
import { useLive } from '../lib/live';
import { fmt, timeAgo } from '../lib/format';
import StatusBadge from '../components/StatusBadge';

const EDITABLE_STATUSES = ['idle', 'active', 'returning', 'maintenance', 'offline'];

export default function Drones() {
  const { drones } = useLive();
  const { can } = useAuth();
  const [name, setName] = useState('');
  const [model, setModel] = useState('');
  const [error, setError] = useState('');
  const [issued, setIssued] = useState(null); // { name, token }

  const list = Object.values(drones).sort((a, b) => a.name.localeCompare(b.name));
  const canEdit = can('admin', 'operator');

  const run = async (fn) => {
    setError('');
    try {
      await fn();
    } catch (err) {
      setError(err.message);
    }
  };

  const create = (e) => {
    e.preventDefault();
    run(async () => {
      await api('/drones', { method: 'POST', body: { name, model } });
      setName('');
      setModel('');
    });
  };

  const setStatus = (d, status) => run(() => api(`/drones/${d.id}`, { method: 'PATCH', body: { status } }));

  const remove = (d) => {
    if (!confirm(`Remove ${d.name}? Its device token stops working.`)) return;
    run(() => api(`/drones/${d.id}`, { method: 'DELETE' }));
  };

  const issueToken = (d) => {
    if (!confirm(`Issue a new device token for ${d.name}? Any previous token is revoked.`)) return;
    run(async () => {
      const { token } = await api(`/drones/${d.id}/token`, { method: 'POST' });
      setIssued({ name: d.name, token });
    });
  };

  return (
    <>
      <header className="page-head"><h1>Drones</h1></header>
      {error && <div className="error">{error}</div>}

      {canEdit && (
        <form className="card inline-form" onSubmit={create}>
          <input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required maxLength={64} />
          <input placeholder="Model (optional)" value={model} onChange={(e) => setModel(e.target.value)} maxLength={64} />
          <button className="btn primary">Add drone</button>
        </form>
      )}

      {issued && (
        <div className="card notice">
          <h2>Device token for {issued.name}</h2>
          <p className="muted">
            Copy it now; it is not shown again. The drone connects to <code>/ws</code>, sends
            <code>{'{"type":"auth","token":"…"}'}</code>, then streams
            <code>{'{"type":"telemetry","data":{…}}'}</code>.
          </p>
          <textarea readOnly rows={3} value={issued.token} onFocus={(e) => e.target.select()} />
          <button className="btn ghost" onClick={() => setIssued(null)}>Done</button>
        </div>
      )}

      <div className="card">
        {list.length === 0 ? <p className="muted">No drones yet.</p> : (
          <table>
            <thead>
              <tr>
                <th>Name</th><th>Model</th><th>Status</th><th>Battery</th><th>Signal</th>
                <th>Position</th><th>Seen</th>{canEdit && <th />}
              </tr>
            </thead>
            <tbody>
              {list.map((d) => (
                <tr key={d.id}>
                  <td>{d.name}</td>
                  <td className="muted">{d.model || '—'}</td>
                  <td>
                    {canEdit ? (
                      <select value={d.status} onChange={(e) => setStatus(d, e.target.value)}>
                        {EDITABLE_STATUSES.map((s) => <option key={s}>{s}</option>)}
                      </select>
                    ) : <StatusBadge value={d.status} />}
                  </td>
                  <td>{fmt(d.telemetry?.battery, '%')}</td>
                  <td>{fmt(d.telemetry?.signal, '%')}</td>
                  <td className="mono">
                    {d.telemetry?.lat !== undefined ? `${fmt(d.telemetry.lat, '', 4)}, ${fmt(d.telemetry.lng, '', 4)}` : '—'}
                  </td>
                  <td className="muted">{timeAgo(d.lastSeenAt)}</td>
                  {canEdit && (
                    <td className="actions">
                      {can('admin') && <button className="btn small" onClick={() => issueToken(d)}>Token</button>}
                      {can('admin') && <button className="btn small danger" onClick={() => remove(d)}>Remove</button>}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
