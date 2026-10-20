import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './lib/auth';
import { LiveProvider } from './lib/live';
import Layout from './components/Layout';
import Login from './pages/Login';
import Overview from './pages/Overview';
import Drones from './pages/Drones';
import Detect from './pages/Detect';
import Alerts from './pages/Alerts';
import Users from './pages/Users';

function Protected() {
  const { user, loading, can } = useAuth();
  if (loading) return <div className="center muted">Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;
  return (
    // Keyed by user so switching accounts drops the old socket and state
    <LiveProvider key={user.id}>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Overview />} />
          <Route path="drones" element={<Drones />} />
          <Route path="detect" element={<Detect />} />
          <Route path="alerts" element={<Alerts />} />
          {can('admin') && <Route path="users" element={<Users />} />}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </LiveProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/*" element={<Protected />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
