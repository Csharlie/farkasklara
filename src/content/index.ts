import { articles } from './articles'
import { audiences } from './audiences'
import { company, people } from './company'
import { copy, type Copy } from './copy'
import { services } from './services'
import { settings } from './settings'
import type { Article, Audience, Company, Person, Service, Settings } from './types'

/** The complete client content bundle — input of src/data/build-site.ts. */
export interface ClientContent {
  company: Company
  people: Person[]
  settings: Settings
  services: Service[]
  audiences: Audience[]
  articles: Article[]
  copy: Copy
}

export const content: ClientContent = {
  company,
  people,
  settings,
  services,
  audiences,
  articles,
  copy,
}

export type * from './types'
