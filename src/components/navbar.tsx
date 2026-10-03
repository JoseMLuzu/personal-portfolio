import { FaGithub } from "react-icons/fa";
import { ThemeToggle } from './ThemeToggle';
import "./Navbar.css";

export const Navbar = () => {
  const githubUrl = import.meta.env.VITE_GITHUB_URL?.trim();

  return (
    <nav className="nav nav-with-bitty" aria-label="Main navigation">
      <a className="brand" href="#inicio">
        JML<span aria-hidden="true">_</span>
      </a>
      <div className="nav-links">
        <a className="nav-bitty-link nav-bitty-projects" href="#proyectos">
          Projects
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
          About me
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
            aria-label="José Manuel’s GitHub (opens in a new tab)"
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
            aria-label="GitHub: link not configured yet"
            title="Set VITE_GITHUB_URL to enable this link"
          >
            <FaGithub aria-hidden="true" />
          </span>
        )}
      </div>
    </nav>
  );
};
