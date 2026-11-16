import { Github } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="site-footer villains-footer">
      <div className="footer-brand">
        <img src="/logo-colorida.png" alt="Logo Villains" />
      </div>

      <p className="footer-copyright">
        © {new Date().getFullYear()} Villains. Todos os direitos reservados.
      </p>

      <div className="footer-credit">
        <span>Desenvolvido por <strong>Luiz Eduardo de A. Rodrigues</strong></span>
        <a
          href="https://github.com/LuizEdu-AR"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="GitHub de Luiz Eduardo de A. Rodrigues"
          title="GitHub de Luiz Eduardo"
        >
          <Github size={18} aria-hidden="true" />
        </a>
      </div>
    </footer>
  );
}
