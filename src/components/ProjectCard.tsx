import { useEffect, useState } from 'react'
import { useBittyGuide } from './BittyGuide'
import type { Project } from '../types'
import { ProjectBitty } from './ProjectBitty'

export function ProjectCard({ project, featured = false }: { project: Project; featured?: boolean }) {
  const [expanded, setExpanded] = useState(false)
  const guide = useBittyGuide()
  useEffect(() => {
    if (guide?.selectedProject === project.slug) setExpanded(true)
  }, [guide?.selectedProject, guide?.projectRequest, project.slug])
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
          {expanded ? 'Close case study' : 'Open case study'} <span aria-hidden="true">{expanded ? '−' : '+'}</span>
        </button>
        {project.url ? (
          <a href={project.url} target="_blank" rel="noreferrer">
            Visit app <span aria-hidden="true">↗</span>
          </a>
        ) : (
          <span className="no-link">Demo not confirmed</span>
        )}
      </div>
      {expanded && (
        <div className="project-detail" id={detailId}>
          <p>{project.detail}</p>
          <dl className="case-facts">
            <div><dt>Problem</dt><dd>{project.caseStudy?.problem ?? 'To document: the original problem and who faced it.'}</dd></div>
            <div><dt>My contribution</dt><dd>{project.caseStudy?.contribution ?? 'To document: personal responsibilities and scope of work.'}</dd></div>
            <div><dt>Technical decisions</dt><dd>{project.caseStudy?.decisions ?? 'To document: alternatives considered, the choice and its trade-offs.'}</dd></div>
            <div><dt>Result</dt><dd>{project.result ?? 'No documented results yet.'}</dd></div>
          </dl>
          {project.repositoryUrl && <a href={project.repositoryUrl} target="_blank" rel="noreferrer">Review source ↗</a>}
          <p className="review-label">Details to review</p>
          <ul>{project.needsReview.map((item) => <li key={item}>{item}</li>)}</ul>
        </div>
      )}
    </article>
  )
}
