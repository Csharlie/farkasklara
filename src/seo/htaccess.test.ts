import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const template = readFileSync(resolve(__dirname, '../../deploy/production/.htaccess.tpl'), 'utf8')
/** The template without comment lines — what the server actually reads. */
const directives = template
  .split(/\r?\n/)
  .filter((line) => !line.trim().startsWith('#'))
const rules = directives.filter((line) => /^\s*Rewrite(Rule|Cond)\b/.test(line)).map((line) => line.trim())
const text = directives.join('\n')

describe('production .htaccess template', () => {
  it('leaves /.well-known/ alone before any redirect or rewrite', () => {
    expect(rules[0]).toBe(String.raw`RewriteRule ^\.well-known/ - [L]`)
  })

  it('redirects http and www in one 301 to the canonical origin', () => {
    expect(rules.slice(1, 5)).toEqual([
      'RewriteCond %{HTTPS} !=on [OR]',
      'RewriteCond %{HTTP_HOST} !^{{HOST_PATTERN}}$ [NC]',
      'RewriteCond %{REQUEST_URI} ^/(.*?)/*$',
      'RewriteRule ^ {{ORIGIN}}/%1 [R=301,L,NE]',
    ])
  })

  it('uses only directives Apache and LiteSpeed both read in .htaccess', () => {
    expect(text).not.toMatch(/<If\b|<Location\b/)
    expect(text).toContain('DirectorySlash Off')
    expect(text).toContain('ErrorDocument 404 /404.html')
    expect(text).toContain('Referrer-Policy "strict-origin-when-cross-origin"')
  })

  it('contains none of the preview gate rules', () => {
    expect(text).not.toMatch(/DirectoryIndex auth-check|fk_preview|X-Robots-Tag/)
  })
})
