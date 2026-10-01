import { useState } from 'react'
import { motion, useMotionValue, useReducedMotion, useSpring } from 'motion/react'
import source from './ProjectArrivalBitty.tsx?raw'
import { projects } from '../content/projects'

const realEyeCode = source.slice(source.indexOf('  const lookX'), source.indexOf('  const staticPose'))

export function BittyCodeLab() {
  const [stiffness, setStiffness] = useState(320)
  const [damping, setDamping] = useState(26)
  const [selected, setSelected] = useState(projects[0])
  const reduced = useReducedMotion()
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const springX = useSpring(x, { stiffness, damping, mass: 0.25 })
  const springY = useSpring(y, { stiffness, damping, mass: 0.25 })
  function look(nextX: number, nextY = 0) {
    x.set(nextX)
    y.set(nextY)
  }
  const contract = {
    text: selected.summary,
    project: { slug: selected.slug, title: selected.title, url: selected.url },
    action: { type: 'show_project', projectSlug: selected.slug },
    source: 'fallback',
  }

  return <section className="bitty-code-lab" id="laboratorio-bitty" aria-labelledby="lab-title">
    <p className="eyebrow">Bitty abre el capó</p>
    <h3 id="lab-title">La personalidad también se programa.</h3>
    <p>«Sí, tengo resortes en los ojos. No preguntes quién autorizó eso.» Prueba cómo el código cambia mi comportamiento.</p>
    <div className="lab-grid">
      <article>
        <h4>01 / Dale carácter a mi mirada</h4>
        <p>Mueve el cursor sobre mí o usa los botones. Una rigidez baja da una mirada suave; poca amortiguación produce más rebote.</p>
        <div className="lab-eye-demo" onPointerMove={(event) => {
          if (event.pointerType === 'touch') return
          const bounds = event.currentTarget.getBoundingClientRect()
          look(Math.max(-4, Math.min(4, (event.clientX - bounds.left - bounds.width / 2) / 20)), Math.max(-3, Math.min(3, (event.clientY - bounds.top - bounds.height / 2) / 25)))
        }} onPointerLeave={() => look(0)}>
          <div className="lab-bitty">
            {['left', 'right'].map((eye) => <span key={eye} className={`project-arrival-eye project-arrival-eye--${eye}`}><motion.img className="project-arrival-pupil" src="/assets/bitty-pupil.png" alt="" style={{ x: reduced ? x : springX, y: reduced ? y : springY }} /></span>)}
          </div>
        </div>
        <div className="lab-controls">
          <label htmlFor="eye-stiffness">Rigidez <output>{stiffness}</output></label>
          <input id="eye-stiffness" type="range" min="60" max="600" step="20" value={stiffness} onChange={(event) => setStiffness(Number(event.target.value))} />
          <label htmlFor="eye-damping">Amortiguación <output>{damping}</output></label>
          <input id="eye-damping" type="range" min="8" max="40" value={damping} onChange={(event) => setDamping(Number(event.target.value))} />
          <div><button type="button" onClick={() => look(-4)}>Mirar a la izquierda</button><button type="button" onClick={() => look(4)}>Mirar a la derecha</button><button type="button" onClick={() => { setStiffness(320); setDamping(26); look(0) }}>Restablecer</button></div>
        </div>
        <pre aria-label="Configuración del ejemplo"><code>{`useSpring(target, {\n  stiffness: ${stiffness},\n  damping: ${damping},\n  mass: 0.25\n})`}</code></pre>
        <details><summary>Ver el fragmento real del portafolio</summary><p>Extraído de ProjectArrivalBitty.tsx durante la compilación.</p><pre><code>{realEyeCode.trim()}</code></pre></details>
      </article>
      <article>
        <h4>02 / Ayudar no siempre requiere IA</h4>
        <p>Selecciona un proyecto. El contenido cambia inmediatamente con datos locales y una acción permitida. Esta demostración no hace solicitudes de red.</p>
        <div className="lab-controls lab-projects">{projects.map((project) => <button type="button" key={project.slug} aria-pressed={selected.slug === project.slug} onClick={() => setSelected(project)}>{project.title}</button>)}</div>
        <div className="lab-local-reply" aria-live="polite"><strong>{selected.title}</strong><p>{selected.summary}</p>{selected.url ? <a href={selected.url} target="_blank" rel="noreferrer">Abrir demo ↗</a> : <span>Demo no confirmada</span>}</div>
        <pre aria-label="Contrato de la respuesta local"><code>{JSON.stringify(contract, null, 2)}</code></pre>
        <p>El modelo puede redactar una respuesta, pero el texto no ejecuta código. React interpreta acciones de una lista permitida y decide la navegación.</p>
      </article>
    </div>
  </section>
}
