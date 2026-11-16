import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Header({ admin = false }) {
  const { isAdmin } = useAuth();

  return (
    <header className="site-header container">
      <Link to="/" className="brand" aria-label="Calendário Villains">
        <img src="/logo-colorida.png" alt="Villains" />
        <span>CALENDÁRIO <strong>VILLAINS</strong></span>
      </Link>
      <nav className="header-nav">
        {admin ? <Link to="/">Ver calendário</Link> : <span className="nav-current">Agenda</span>}
        {admin ? <span className="nav-current">Painel</span> : isAdmin ? <Link to="/admin">Painel</Link> : <Link to="/login">Administração</Link>}
      </nav>
    </header>
  );
}
