import { useState } from 'react';
import { api } from '../lib/api';
import { useAuth } from '../lib/auth';
import { useLive } from '../lib/live';
import { timeAgo } from '../lib/format';
import StatusBadge from '../components/StatusBadge';

export default function Alerts() {
  const { alerts, drones, dispatch } = useLive();
  const { can } = useAuth();
  const [filter, setFilter] = useState('open');
  const [error, setError] = useState('');

  const shown = filter === 'all' ? alerts : alerts.filter((a) => a.status === filter);

  const ack = async (a) => {
    setError('');
    try {
      const { alert } = await api(`/alerts/${a.id}/ack`, { method: 'POST' });
      dispatch({ type: 'alert', payload: alert });
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <>
      <header className="page-head">
        <h1>Alerts</h1>
        <div className="tabs">
          {['open', 'acknowledged', 'all'].map((f) => (
            <button key={f} className={filter === f ? 'active' : ''} onClick={() => setFilter(f)}>{f}</button>
          ))}
        </div>
      </header>
      {error && <div className="error">{error}</div>}
      <div className="card">
        {shown.length === 0 ? <p className="muted">Nothing here.</p> : (
          <table>
            <thead><tr><th>Severity</th><th>What</th><th>Drone</th><th>When</th><th>Status</th><th /></tr></thead>
            <tbody>
              {shown.map((a) => (
                <tr key={a.id}>
                  <td><StatusBadge value={a.severity} /></td>
                  <td>{a.message}</td>
                  <td>{drones[a.drone]?.name || <span className="muted">manual upload</span>}</td>
                  <td className="muted" title={new Date(a.createdAt).toLocaleString()}>{timeAgo(a.createdAt)}</td>
                  <td><StatusBadge value={a.status} /></td>
                  <td className="actions">
                    {a.status === 'open' && can('admin', 'operator') && (
                      <button className="btn small" onClick={() => ack(a)}>Acknowledge</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
