import { useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { projects } from '../content/projects'
import { ProjectCard } from './ProjectCard'
import './Projects.css'

gsap.registerPlugin(ScrollTrigger, useGSAP)

/** A reversible scroll scene: the page is never pinned and content never moves. */
export function Projects() {
  const sectionRef = useRef<HTMLElement>(null)
  useGSAP(() => {
    const section = sectionRef.current!
    const actor = section.querySelector<HTMLElement>('.sky-diver')!
    const rig = section.querySelector<HTMLElement>('.sky-diver-rig')!
    const clouds = section.querySelectorAll<HTMLElement>('.sky-cloud')
    const media = gsap.matchMedia()
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const mobile = () => section.clientWidth <= 600
      const timeline = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: section, start: 'top 12%', end: 'bottom bottom',
          scrub: .55, invalidateOnRefresh: true,
        },
      })
      timeline.fromTo(actor, { y: 0 }, {
        y: () => Math.max(0, section.offsetHeight - actor.offsetHeight - 110), duration: 1,
      }, 0)
      // A suspended weight sways beneath the canopy; no autonomous infinite loop.
      timeline.fromTo(rig, { rotation: -5 }, { rotation: 5, duration: .25, repeat: 3, yoyo: true, ease: 'sine.inOut' }, 0)
      clouds.forEach((cloud, index) => {
        timeline.fromTo(cloud, { y: 0, x: 0 }, {
          y: () => -(mobile() ? 45 : 130) * (index % 2 ? 1.6 : .7),
          x: () => (index % 2 ? 1 : -1) * (mobile() ? 12 : 36), duration: 1,
        }, 0)
      })
      // Expanded project cases change the runway; refresh without polling.
      let frame = 0, previousHeight = section.offsetHeight
      const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(() => {
        if (section.offsetHeight === previousHeight) return
        previousHeight = section.offsetHeight
        cancelAnimationFrame(frame)
        frame = requestAnimationFrame(() => ScrollTrigger.refresh())
      })
      observer?.observe(section)
      return () => { observer?.disconnect(); cancelAnimationFrame(frame); timeline.scrollTrigger?.kill(); timeline.kill() }
    })
    return () => media.revert()
  }, { scope: sectionRef })

  return <section ref={sectionRef} className="projects projects-sky" id="proyectos" aria-labelledby="projects-title">
    <div className="project-sky-art" aria-hidden="true">
      {[0, 1, 2, 3, 4, 5].map(index => <img key={index} className={`sky-cloud sky-cloud-${index}`} src="/assets/project-sky-clouds.png" width="2172" height="724" alt="" />)}
    </div>
    <div className="sky-diver" aria-hidden="true">
      <div className="sky-diver-rig">
        <img className="sky-parachute" src="/assets/bitty-parachute.png" width="1254" height="1254" alt="" />
        <img className="sky-bitty" src="/assets/bitty-rope-hang.png" width="1024" height="1536" alt="" />
      </div>
      <span className="sky-diver-caption">Esta vez traje paracaídas.</span>
    </div>
    <div className="projects-sky-content">
      <header className="section-heading">
        <div>
          <p className="eyebrow">Trabajo seleccionado</p>
          <h2 id="projects-title">Proyectos reales,<br />sin humo.</h2>
        </div>
        <div className="project-heading-aside"><p>
          Lo que está confirmado se muestra. Lo que falta, se marca. Cada caso
          está preparado para crecer con contexto y resultados verificables.
        </p></div>
      </header>
      <div className="project-grid">
        {projects.map((project, index) => <ProjectCard key={project.slug} project={project} featured={index === 0} />)}
      </div>
    </div>
  </section>
}
