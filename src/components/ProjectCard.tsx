import { useState } from 'react'
import type { Project } from '../types'
import { ProjectBitty } from './ProjectBitty'

export function ProjectCard({ project, featured = false }: { project: Project; featured?: boolean }) {
  const [expanded, setExpanded] = useState(false)
  const detailId = `project-detail-${project.slug}`

  return (
    <article className={`project-card${featured ? ' featured' : ''}`} id={`project-${project.slug}`}>
      <ProjectBitty projectSlug={project.slug} />
      <header>
        <span className="project-index" aria-hidden="true">/{project.slug === 'seeds' ? '01' : project.slug === 'hostiqr' ? '02' : '03'}</span>
        <span className="project-status">{project.status}</span>
      </header>
      <h3>{project.title}</h3>
      <p>{project.summary}</p>
      <div className="project-actions">
        <button
          className="text-action"
          type="button"
          aria-expanded={expanded}
          aria-controls={detailId}
          onClick={() => setExpanded((value) => !value)}
        >
          {expanded ? 'Cerrar ficha' : 'Abrir ficha'} <span aria-hidden="true">{expanded ? '−' : '+'}</span>
        </button>
        {project.url ? (
          <a href={project.url} target="_blank" rel="noreferrer">
            Visitar app <span aria-hidden="true">↗</span>
          </a>
        ) : (
          <span className="no-link">Demo no confirmada</span>
        )}
      </div>
      {expanded && (
        <div className="project-detail" id={detailId}>
          <p>{project.detail}</p>
          <p className="review-label">Datos por revisar</p>
          <ul>{project.needsReview.map((item) => <li key={item}>{item}</li>)}</ul>
        </div>
      )}
    </article>
  )
}
