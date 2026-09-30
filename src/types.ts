export type Project = {
  slug: string
  title: string
  url: string | null
  status: string
  summary: string
  detail: string
  stack: string[]
  result: string | null
  needsReview: string[]
}

export type BittyAction =
  | { type: 'none'; projectSlug: null }
  | { type: 'show_project' | 'scroll_projects'; projectSlug: string | null }

export type BittyReply = {
  text: string
  project: Pick<Project, 'slug' | 'title' | 'url'> | null
  action: BittyAction
  source: 'ai' | 'fallback'
}
