import { useState } from 'react'
import { BittyScene, type HeroPhase } from './BittyScene'

export function Hero() {
  const [phase, setPhase] = useState<HeroPhase>('ready')
  return <section className={`hero hero-curtain-intro hero-peek phase-${phase}`} id="inicio" aria-label="Presentación de José Manuel">
    <div className="hero-copy">
      <p className="eyebrow"><span aria-hidden="true">// </span>Hola, soy José.</p>
      <BittyScene onPhaseChange={setPhase} />
      <p className="hero-role">Desarrollador full-stack <span aria-hidden="true">·</span> Web + IA</p>
      <p className="intro">Construyo aplicaciones web claras y útiles.<br />Bitty se encarga de que no sean aburridas.</p>
      <div className="hero-action-wrap">
        <a className="primary-action" href="#proyectos">Ver proyectos <span aria-hidden="true">→</span></a>
        <svg className="hero-button-arrow" viewBox="0 0 180 100" fill="none" aria-hidden="true" focusable="false">
          <path d="M170 8 C151 48 98 75 12 78 M29 64 L12 78 L31 90" />
        </svg>
      </div>
    </div>
    <div className="hero-edge-bitty" aria-hidden="true">
      <span className="hero-edge-speech">Sí, el botón funciona.</span>
      <img src="/assets/bitty-rope-hang.png" alt="" width="1024" height="1536" />
    </div>
  </section>
}
