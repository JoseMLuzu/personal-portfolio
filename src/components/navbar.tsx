import { FaGithub } from "react-icons/fa";
import { ThemeToggle } from './ThemeToggle';
import "./Navbar.css";

export const Navbar = () => {
  const githubUrl = import.meta.env.VITE_GITHUB_URL?.trim();

  return (
    <nav className="nav nav-with-bitty" aria-label="Navegación principal">
      <a className="brand" href="#inicio">
        JML<span aria-hidden="true">_</span>
      </a>
      <div className="nav-links">
        <a className="nav-bitty-link nav-bitty-projects" href="#proyectos">
          Proyectos
          <span className="nav-bitty-stage" aria-hidden="true">
            <img
              className="nav-bitty"
              src="/assets/bitty-nav-climb.png"
              alt=""
              aria-hidden="true"
              width="1024"
              height="1536"
            />
          </span>
        </a>
        <a
          className="nav-about-link nav-bitty-link nav-bitty-about"
          href="#sobre-mi"
        >
          Sobre mí
          <span className="nav-bitty-stage" aria-hidden="true">
            <img
              className="nav-bitty"
              src="/assets/bitty-nav-wink.png"
              alt=""
              aria-hidden="true"
              width="1536"
              height="1024"
            />
          </span>
        </a>
        <ThemeToggle />
        {githubUrl ? (
          <a
            className="github-link nav-bitty-link nav-bitty-github"
            href={githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub de José Manuel (abre en una pestaña nueva)"
          >
            <FaGithub aria-hidden="true" />
            <span className="nav-bitty-stage" aria-hidden="true">
              <img
                className="nav-bitty"
                src="/assets/bitty-nav-github-kiss.png"
                alt=""
                aria-hidden="true"
                width="1212"
                height="1298"
              />
            </span>
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
