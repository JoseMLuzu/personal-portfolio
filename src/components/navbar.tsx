import { FaGithub } from "react-icons/fa";

export const Navbar = () => {
  const githubUrl = import.meta.env.VITE_GITHUB_URL?.trim();

  return (
    <nav className="nav" aria-label="Navegación principal">
      <a className="brand" href="#inicio">
        JML<span aria-hidden="true">_</span>
      </a>
      <div className="nav-links">
        <a href="#proyectos">Proyectos</a>
        <a className="nav-about-link" href="#sobre-mi">
          Sobre mí
        </a>
        {githubUrl ? (
          <a
            className="github-link"
            href={githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub de José Manuel (abre en una pestaña nueva)"
          >
            <FaGithub aria-hidden="true" />
          </a>
        ) : (
          <span
            className="github-link github-link--pending"
            aria-label="GitHub: enlace pendiente de configurar"
            title="Añade VITE_GITHUB_URL para activar este enlace"
          >
            <FaGithub aria-hidden="true" />
          </span>
        )}
      </div>
    </nav>
  );
};
