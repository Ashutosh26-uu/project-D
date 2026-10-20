import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { useLive } from '../lib/live';

const links = [
  { to: '/', label: 'Overview', end: true },
  { to: '/drones', label: 'Drones' },
  { to: '/detect', label: 'Detect' },
  { to: '/alerts', label: 'Alerts' },
];

export default function Layout() {
  const { user, logout, can } = useAuth();
  const { connected, alerts } = useLive();
  const openAlerts = alerts.filter((a) => a.status === 'open').length;

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          <img src="/favicon.svg" alt="" width="28" height="28" />
          <span>Drone Ops</span>
        </div>
        <nav>
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end}>
              {l.label}
              {l.to === '/alerts' && openAlerts > 0 && <span className="pill danger">{openAlerts}</span>}
            </NavLink>
          ))}
          {can('admin') && <NavLink to="/users">Users</NavLink>}
        </nav>
        <div className="sidebar-foot">
          <div className={`conn ${connected ? 'ok' : 'down'}`}>
            <span className="dot" /> {connected ? 'Live' : 'Reconnecting…'}
          </div>
          <div className="who">
            <strong>{user.username}</strong>
            <span className="muted">{user.role}</span>
          </div>
          <button className="btn ghost" onClick={logout}>Sign out</button>
        </div>
      </aside>
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}
