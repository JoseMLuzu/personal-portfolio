import { BittyChat } from "./components/BittyChat";
import { BittyScene } from "./components/BittyScene";
import { Navbar } from "./components/navbar";
import { ProjectCard } from "./components/ProjectCard";
import { projects } from "./content/projects";

export function App() {
  return (
    <main>
      <Navbar />
      <section className="hero" id="inicio">
        <div className="hero-copy">
          <p className="eyebrow">Desarrollador web · Ecuador</p>
          <h1>
            José Manuel
            <br />
            <span className="surname">
              Luzu<span className="falling-piece">riaga.</span>
            </span>
          </h1>
          <p className="intro">
            Construyo productos web claros y útiles con React, Python y bases de
            datos.
          </p>
          <a className="primary-action" href="#proyectos">
            Ver proyectos <span aria-hidden="true">↘</span>
          </a>
          <div className="status" aria-label="Tecnologías principales">
            <span>React</span>
            <span>Python</span>
            <span>Bases de datos</span>
          </div>
        </div>
        <BittyScene />
      </section>
      <section
        className="projects"
        id="proyectos"
        aria-labelledby="projects-title"
      >
        <header className="section-heading">
          <div>
            <p className="eyebrow">Trabajo seleccionado</p>
            <h2 id="projects-title">
              Proyectos reales,
              <br />
              sin humo.
            </h2>
          </div>
          <p>
            Lo que está confirmado se muestra. Lo que falta, se marca. Cada caso
            está preparado para crecer con contexto y resultados verificables.
          </p>
        </header>
        <div className="project-grid">
          {projects.map((project, index) => (
            <ProjectCard
              key={project.slug}
              project={project}
              featured={index === 0}
            />
          ))}
        </div>
      </section>
      <section className="about" id="sobre-mi">
        <p className="eyebrow">Sobre mí</p>
        <div>
          <h2>
            Web útil.
            <br />
            Código con criterio.
          </h2>
          <p>
            Soy José Manuel Luzuriaga, desarrollador web con experiencia en
            React, Python y bases de datos. Me interesa convertir problemas
            concretos en interfaces claras y sistemas mantenibles.
          </p>
        </div>
      </section>
      <footer>
        <a className="brand" href="#inicio">
          JML<span>_</span>
        </a>
        <p>
          Construido con React + FastAPI ·{" "}
          <span>{new Date().getFullYear()}</span>
        </p>
      </footer>
      <BittyChat />
    </main>
  );
}
