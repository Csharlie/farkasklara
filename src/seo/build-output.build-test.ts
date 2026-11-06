import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, relative, resolve, sep } from 'node:path'
import { build } from 'vite'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { content } from '../content'
import { buildSiteData } from '../data/build-site'
import { htmlFileOf, isIndexable } from './indexable'

const root = resolve(__dirname, '../..')
const PLACEHOLDER = /\[[A-ZÁÉÍÓÖŐÚÜŰ][^\]]*\]/
const ROBOTS_META = /<meta name="robots"[^>]*>/

/** Every file under `dir`, as a '/'-separated path relative to `root`. */
function listFiles(dir: string, root = dir): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name)
    return statSync(path).isDirectory() ? listFiles(path, root) : [relative(root, path).split(sep).join('/')]
  })
}

async function buildMode(mode: string): Promise<string> {
  const outDir = mkdtempSync(join(tmpdir(), `fk-build-${mode}-`))
  await build({ root, mode, logLevel: 'silent', build: { outDir, emptyOutDir: true } })
  return outDir
}

const site = buildSiteData(content)
let production = ''
let staging = ''

beforeAll(async () => {
  production = await buildMode('production')
  staging = await buildMode('staging')
})

afterAll(() => {
  for (const dir of [production, staging]) if (dir) rmSync(dir, { recursive: true, force: true })
})

describe('production build', () => {
  const read = (file: string) => readFileSync(join(production, file), 'utf8')

  it('writes a page file for every route, plus sitemap, robots.txt and the form settings', () => {
    for (const page of site.pages) expect(existsSync(join(production, htmlFileOf(page.slug))), page.slug).toBe(true)
    for (const file of ['sitemap.xml', 'robots.txt', 'ajanlatkeres-config.php', 'favicon.svg', 'og-image.jpg']) {
      expect(existsSync(join(production, file)), file).toBe(true)
    }
  })

  it('has no noindex on indexable pages, noindex on the 404 page and the empty Tudástár', () => {
    for (const page of site.pages) {
      const html = read(htmlFileOf(page.slug))
      if (isIndexable(page, content)) expect(html, page.slug).not.toMatch(ROBOTS_META)
      else expect(html, page.slug).toContain('<meta name="robots" content="noindex, follow" />')
    }
  })

  it('gives each route its own title and canonical', () => {
    const kapcsolat = read('kapcsolat.html')
    expect(kapcsolat).toContain('<link rel="canonical" href="https://farkaskonyveles.hu/kapcsolat" />')
    expect(kapcsolat).not.toContain(read('index.html').match(/<title>[^<]*<\/title>/)![0])
  })

  it('puts the confirmed opening hours into the homepage JSON-LD', () => {
    const json = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/.exec(read('index.html'))![1]!
    expect(JSON.parse(json).openingHoursSpecification).toEqual([
      { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday'], opens: '09:00', closes: '16:00' },
    ])
  })

  it('contains no [PLACEHOLDER] in any served document', () => {
    for (const file of listFiles(production).filter((f) => /\.(html|xml|txt|php)$/.test(f))) {
      expect(read(file), file).not.toMatch(PLACEHOLDER)
    }
  })

  it('loads fonts from its own /assets, never from Google', () => {
    const files = listFiles(production)
    expect(files.some((f) => /^assets\/instrument-sans-latin-ext-400-normal-.*\.woff2$/.test(f))).toBe(true)
    expect(files.some((f) => f.startsWith('fonts/'))).toBe(false)
    for (const file of files.filter((f) => /\.(html|css)$/.test(f))) expect(read(file), file).not.toContain('fonts.googleapis.com')
  })
})

describe('staging build (gated preview)', () => {
  it('keeps one noindex index.html and no per-route files', () => {
    expect(readFileSync(join(staging, 'index.html'), 'utf8')).toContain('<meta name="robots" content="noindex, nofollow" />')
    for (const file of ['kapcsolat.html', '404.html', 'sitemap.xml', 'robots.txt', 'ajanlatkeres-config.php']) {
      expect(existsSync(join(staging, file)), file).toBe(false)
    }
  })
})
