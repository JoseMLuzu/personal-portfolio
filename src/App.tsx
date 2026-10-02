import { BittyChat } from "./components/BittyChat";
import { Hero } from "./components/Hero";
import { Projects } from "./components/Projects";
import { Navbar } from "./components/navbar";
import { BittyGuideProvider, BittyRest } from "./components/BittyGuide";
import { BittyCodeLab } from "./components/BittyCodeLab";
import { Technologies } from "./components/Technologies";

export function App() {
  return (
    <BittyGuideProvider><main>
      <Navbar />
      <Hero />
      <Projects />
      <Technologies />
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
        <article className="portfolio-engineering" id="criterio-tecnico">
          <div className="engineering-header"><div>
          <p className="eyebrow">Un caso que puedes inspeccionar</p>
          <h3>Este portafolio, por dentro.</h3>
          </div><BittyRest stop="sobre-mi" /></div>
          <p>La interacción de Bitty también es una muestra de cómo está construido el sitio.</p>
          <dl className="case-facts">
            <div><dt>Animación 2D</dt><dd>GSAP coordina el paracaídas con el scroll y la inundación del stack. Motion anima al asistente. Las escenas respetan el movimiento reducido.</dd></div>
            <div><dt>Acciones inmediatas</dt><dd>Mostrar un proyecto y navegar son acciones locales. No requieren una llamada a la IA.</dd></div>
            <div><dt>IA con límites</dt><dd>FastAPI conserva la clave en el servidor. El modelo genera texto; las acciones se eligen de una lista permitida. Sin clave o ante un error, hay respuestas preparadas.</dd></div>
            <div><dt>Un límite consciente</dt><dd>Las fichas distinguen los datos conocidos de lo que falta documentar. El recorrido funciona sin activar al guía.</dd></div>
          </dl>
          <a className="text-action" href="https://github.com/JoseMLuzu/personal-portfolio" target="_blank" rel="noreferrer">Revisar el código del portafolio ↗</a>
        </article>
        <BittyCodeLab />
      </section>
      <footer id="final">
        <a className="brand" href="#inicio">
          JML<span>_</span>
        </a>
        <p>
          Construido con React + FastAPI ·{" "}
          <span>{new Date().getFullYear()}</span>
        </p>
        <BittyRest stop="final" />
      </footer>
      <BittyChat />
    </main></BittyGuideProvider>
  );
}
