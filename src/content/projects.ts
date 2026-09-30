import rawProjects from '../../content/projects.json'
import type { Project } from '../types'

export const projects = rawProjects as Project[]

export const getProject = (slug: string) => projects.find((project) => project.slug === slug)
