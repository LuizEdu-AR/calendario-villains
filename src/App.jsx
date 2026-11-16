import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CalendarProvider } from './contexts/CalendarContext';
import PublicCalendar from './pages/PublicCalendar';
import AdminPage from './pages/AdminPage';
import Login from './pages/Login';

function ProtectedAdmin() {
  const { user, isAdmin, loading } = useAuth();
  if (loading) return <div className="loading-screen">Verificando acesso...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (!isAdmin) return <div className="loading-screen">Esta conta não tem permissão para administrar o calendário. <a href="/login">Voltar ao login</a></div>;
  return <AdminPage />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CalendarProvider>
          <Routes>
            <Route path="/" element={<PublicCalendar />} />
            <Route path="/login" element={<Login />} />
            <Route path="/admin" element={<ProtectedAdmin />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </CalendarProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
