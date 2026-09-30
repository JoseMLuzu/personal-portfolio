type ProjectBittyVariant = 'corner-peek' | 'sit-top' | 'hang-bottom'

const variantByProject: Record<string, ProjectBittyVariant> = {
  seeds: 'corner-peek',
  hostiqr: 'sit-top',
  fintrack: 'hang-bottom',
}

export function ProjectBitty({ projectSlug }: { projectSlug: string }) {
  const variant = variantByProject[projectSlug] ?? 'corner-peek'

  return (
    <span className={`project-bitty project-bitty--${variant}`} aria-hidden="true">
      <span className="project-bitty-sprite" />
    </span>
  )
}
