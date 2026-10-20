import { useCallback, useEffect, useState } from 'react';
import { api } from '../lib/api';
import { useAuth } from '../lib/auth';

const ROLES = ['admin', 'operator', 'viewer'];

export default function Users() {
  const { user: me } = useAuth();
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ username: '', password: '', role: 'viewer' });
  const [error, setError] = useState('');

  const load = useCallback(() => api('/users').then((d) => setUsers(d.users)).catch((e) => setError(e.message)), []);
  useEffect(() => { load(); }, [load]);

  const run = async (fn) => {
    setError('');
    try {
      await fn();
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  const create = (e) => {
    e.preventDefault();
    run(async () => {
      await api('/users', { method: 'POST', body: form });
      setForm({ username: '', password: '', role: 'viewer' });
    });
  };

  return (
    <>
      <header className="page-head"><h1>Users</h1></header>
      {error && <div className="error">{error}</div>}
      <form className="card inline-form" onSubmit={create}>
        <input placeholder="Username" value={form.username} required
          onChange={(e) => setForm({ ...form, username: e.target.value })} />
        <input placeholder="Password (12+ chars)" type="password" value={form.password} required minLength={12}
          autoComplete="new-password" onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
          {ROLES.map((r) => <option key={r}>{r}</option>)}
        </select>
        <button className="btn primary">Add user</button>
      </form>
      <div className="card">
        <table>
          <thead><tr><th>Username</th><th>Role</th><th>Created</th><th /></tr></thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.username}{u.id === me.id && <span className="muted"> (you)</span>}</td>
                <td>
                  <select value={u.role} disabled={u.id === me.id}
                    onChange={(e) => run(() => api(`/users/${u.id}`, { method: 'PATCH', body: { role: e.target.value } }))}>
                    {ROLES.map((r) => <option key={r}>{r}</option>)}
                  </select>
                </td>
                <td className="muted">{new Date(u.createdAt).toLocaleDateString()}</td>
                <td className="actions">
                  {u.id !== me.id && (
                    <button className="btn small danger" onClick={() => confirm(`Delete ${u.username}?`)
                      && run(() => api(`/users/${u.id}`, { method: 'DELETE' }))}>Delete</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
