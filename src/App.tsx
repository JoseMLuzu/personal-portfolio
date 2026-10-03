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
        <p className="eyebrow">About me</p>
        <div>
          <h2>
            Useful websites.
            <br />
            Thoughtful code.
          </h2>
          <p>
            I’m José Manuel Luzuriaga, a web developer with experience in
            React, Python and databases. I turn real-world problems
            into clear interfaces and maintainable systems.
          </p>
        </div>
        <article className="portfolio-engineering" id="criterio-tecnico">
          <div className="engineering-header"><div>
          <p className="eyebrow">A case you can inspect</p>
          <h3>Inside this portfolio.</h3>
          </div><BittyRest stop="sobre-mi" /></div>
          <p>Bitty’s interactions also show how this site is built.</p>
          <dl className="case-facts">
            <div><dt>2D animation</dt><dd>GSAP coordinates the scroll-driven parachute and stack tide. Motion animates the assistant. All scenes respect reduced motion.</dd></div>
            <div><dt>Instant actions</dt><dd>Showing a project and navigating are local actions. No AI request is needed.</dd></div>
            <div><dt>AI with boundaries</dt><dd>FastAPI keeps the key on the server. The model generates text; actions come from an allowlist. Without a key or if a request fails, prepared replies take over.</dd></div>
            <div><dt>An intentional boundary</dt><dd>Case studies distinguish known facts from missing documentation. The portfolio works without enabling the guide.</dd></div>
          </dl>
          <a className="text-action" href="https://github.com/JoseMLuzu/personal-portfolio" target="_blank" rel="noreferrer">Explore the portfolio source ↗</a>
        </article>
        <BittyCodeLab />
      </section>
      <footer id="final">
        <a className="brand" href="#inicio">
          JML<span>_</span>
        </a>
        <p>
          Built with React + FastAPI ·{" "}
          <span>{new Date().getFullYear()}</span>
        </p>
        <BittyRest stop="final" />
      </footer>
      <BittyChat />
    </main></BittyGuideProvider>
  );
}
