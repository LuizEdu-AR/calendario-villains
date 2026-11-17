import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Header({ admin = false }) {
  const { isAdmin } = useAuth();
  const [scrolled, setScrolled] = useState(() => typeof window !== 'undefined' && window.scrollY > 12);

  useEffect(() => {
    const updateScroll = () => setScrolled(window.scrollY > 12);
    updateScroll();
    window.addEventListener('scroll', updateScroll, { passive: true });
    return () => window.removeEventListener('scroll', updateScroll);
  }, []);

  return (
    <header className={`site-header container${scrolled ? ' is-scrolled' : ''}`}>
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
