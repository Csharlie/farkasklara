#!/usr/bin/env node
/**
 * Deploys the site.
 *
 *   pnpm deploy:pspro             https://pspro.hu/farkasklara/  gated preview (FTP over TLS)
 *   pnpm deploy:staging           https://farkaskonyveles.hu/    gated preview (SFTP, pinned host key)
 *   pnpm deploy:production        https://farkaskonyveles.hu/    public, indexable (SFTP, pinned host key)
 *   … --dry-run                   build → stage only, lists what would be uploaded (no credentials needed)
 *   … --target=production --remove-gate
 *                                 after the upload, deletes the preview gate files left on the
 *                                 server — lists them first and asks for a typed confirmation
 *
 * Secrets come from .env.deploy.local (gitignored; template:
 * deploy/pspro/.env.deploy.example). Gated previews: the password is stored on
 * the server only as a PBKDF2 hash; the cookie-signing secret is regenerated
 * on every deploy (everyone logs in again). Credentials reach curl through
 * stdin, never through the command line.
 */
import { execSync, spawnSync } from 'node:child_process'
import { pbkdf2Sync, randomBytes } from 'node:crypto'
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { join, relative, sep } from 'node:path'
import { createInterface } from 'node:readline/promises'

const root = new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')
const dryRun = process.argv.includes('--dry-run')
const removeGate = process.argv.includes('--remove-gate')

/**
 * Deploy targets. `mode` selects the Vite mode (.env.<mode>: DEPLOY_BASE, form
 * driver); `prefix` selects the transfer credentials in .env.deploy.local.
 * - gate: password login gate (deploy/pspro) in front of the site, noindex.
 * - robots: the target serves a host root → a disallow-all robots.txt is added
 *   (gated only; the production build makes its own, indexable robots.txt).
 * - keepCpanelHtaccess: keep the cPanel-generated blocks of the remote .htaccess.
 * - production uses its own PRODUCTION_SFTP_* keys although it is the same
 *   server as staging today: going live must be a deliberate setting, never a
 *   silent fallback to wherever staging points.
 */
const targets = {
  pspro: { mode: 'pspro', protocol: 'ftps', prefix: 'FTP_', origin: 'https://pspro.hu', gate: true, robots: false, keepCpanelHtaccess: false },
  staging: { mode: 'staging', protocol: 'sftp', prefix: 'STAGING_SFTP_', origin: 'https://farkaskonyveles.hu', gate: true, robots: true, keepCpanelHtaccess: true },
  production: { mode: 'production', protocol: 'sftp', prefix: 'PRODUCTION_SFTP_', origin: 'https://farkaskonyveles.hu', gate: false, robots: false, keepCpanelHtaccess: true },
}
const targetName = process.argv.find((arg) => arg.startsWith('--target='))?.slice('--target='.length) ?? 'pspro'
const target = targets[targetName]

/** Preview gate files (deploy/pspro) — uploaded by gated targets, left behind by staging. */
const gateFiles = ['gate.php', 'auth-check.php', 'login.php']
const gateLeftovers = [...gateFiles, 'auth-config.php']

function readEnv(file) {
  const path = join(root, file)
  if (!existsSync(path)) return {}
  return Object.fromEntries(
    readFileSync(path, 'utf8')
      .split(/\r?\n/)
      .filter((line) => line.trim() && !line.trim().startsWith('#') && line.includes('='))
      .map((line) => {
        const i = line.indexOf('=')
        return [line.slice(0, i).trim(), line.slice(i + 1).trim().replace(/^(['"])(.*)\1$/, '$2')]
      }),
  )
}

function fail(message) {
  console.error(`\n✖ ${message}`)
  process.exit(1)
}

if (!target) fail(`unknown --target=${targetName} (${Object.keys(targets).join(', ')})`)
if (removeGate && target.gate) fail('--remove-gate only goes with --target=production')

const base = readEnv(`.env.${target.mode}`).DEPLOY_BASE
if (!base || !base.startsWith('/') || !base.endsWith('/')) fail(`.env.${target.mode}: DEPLOY_BASE must look like / or /farkasklara/`)

const env = readEnv('.env.deploy.local')
const transferKeys = target.protocol === 'sftp' ? ['HOST', 'PORT', 'USER', 'PASS', 'DIR', 'HOSTKEY'] : ['HOST', 'USER', 'PASS', 'DIR']
const required = [...(target.gate ? ['PREVIEW_USER', 'PREVIEW_PASSWORD'] : []), ...(dryRun ? [] : transferKeys.map((key) => target.prefix + key))]
const missing = required.filter((key) => !env[key])
if (missing.length) fail(`.env.deploy.local is missing: ${missing.join(', ')} (template: deploy/pspro/.env.deploy.example)`)
const remote = Object.fromEntries(transferKeys.map((key) => [key, env[target.prefix + key]]))

// Transfer ------------------------------------------------------------------
const remoteDir = `/${(remote.DIR ?? '').replace(/^\/+|\/+$/g, '')}/`
const credentials = `user = "${(remote.USER ?? '').replace(/"/g, '\\"')}:${(remote.PASS ?? '').replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"\n`
const transferArgs =
  target.protocol === 'sftp'
    ? ['--hostpubsha256', remote.HOSTKEY ?? '']
    : [env.FTP_TLS === 'optional' ? '--ssl' : '--ssl-reqd']
const curl = (args) => spawnSync('curl', ['--config', '-', ...transferArgs, '--silent', '--show-error', ...args], { input: credentials, encoding: 'utf8' })
const remoteUrl = (file) =>
  target.protocol === 'sftp'
    ? `sftp://${remote.HOST}:${remote.PORT}${remoteDir}${file.split('/').map(encodeURIComponent).join('/')}`
    : `ftp://${remote.HOST}${remoteDir}${file.split('/').map(encodeURIComponent).join('/')}`

const devNull = process.platform === 'win32' ? 'NUL' : '/dev/null'

/** Whether a remote file exists (1-byte download; works on SFTP and FTPS alike). */
function remoteExists(url) {
  return curl(['--fail', '--range', '0-0', '--output', devNull, url]).status === 0
}

/** Remote size (curl -I → Content-Length) — null when unknown. */
function remoteSize(url) {
  const match = /Content-Length:\s*(\d+)/i.exec(curl(['-I', url]).stdout ?? '')
  return match ? Number(match[1]) : null
}

// 1. Build ------------------------------------------------------------------
const outDir = `dist-${target.mode}`
console.log(`▶ build ${targetName} (base ${base})`)
execSync(`pnpm exec tsc -b && pnpm exec vite build --mode ${target.mode} --outDir ${outDir} --emptyOutDir`, { cwd: root, stdio: 'inherit' })

// 2. Stage: build + server files + generated config --------------------------
const stage = join(root, '.deploy-stage')
rmSync(stage, { recursive: true, force: true })
mkdirSync(stage)
cpSync(join(root, outDir), stage, { recursive: true })

const host = new URL(target.origin).hostname
let htaccess
if (target.gate) {
  for (const file of gateFiles) cpSync(join(root, 'deploy/pspro', file), join(stage, file))
  htaccess = readFileSync(join(root, 'deploy/pspro/.htaccess.tpl'), 'utf8').replaceAll('{{BASE}}', base)
} else {
  // Production: the build already holds every page, 404.html, sitemap.xml,
  // robots.txt and the form settings; the endpoint and cache rules come from deploy/production.
  for (const file of ['index.html', '404.html', 'sitemap.xml', 'robots.txt', 'ajanlatkeres-config.php']) {
    if (!existsSync(join(stage, file))) fail(`${outDir}/${file} is missing — is the fk-seo plugin active in vite.config.ts?`)
  }
  cpSync(join(root, 'deploy/production/ajanlatkeres.php'), join(stage, 'ajanlatkeres.php'))
  for (const dir of ['assets', 'images']) {
    if (existsSync(join(stage, dir))) cpSync(join(root, `deploy/production/${dir}.htaccess`), join(stage, dir, '.htaccess'))
  }
  htaccess = readFileSync(join(root, 'deploy/production/.htaccess.tpl'), 'utf8')
    .replaceAll('{{ORIGIN}}', target.origin)
    .replaceAll('{{HOST_PATTERN}}', host.replace(/\./g, '\\.'))
}

if (target.keepCpanelHtaccess && !dryRun) {
  // cPanel (MultiPHP) writes its PHP settings into public_html/.htaccess — keep those blocks.
  const existing = curl([remoteUrl('.htaccess')])
  const blocks = existing.status === 0 ? existing.stdout.match(/^# BEGIN cPanel-generated[\s\S]*?^# END cPanel-generated.*$/gm) ?? [] : []
  if (blocks.length) htaccess = `${blocks.join('\n\n')}\n\n${htaccess}`
}
writeFileSync(join(stage, '.htaccess'), htaccess)
if (target.robots) writeFileSync(join(stage, 'robots.txt'), 'User-agent: *\nDisallow: /\n')

if (target.gate) {
  const iterations = 210_000
  const salt = randomBytes(16)
  const hash = pbkdf2Sync(env.PREVIEW_PASSWORD, salt, iterations, 32, 'sha256')
  const phpString = (value) => `'${String(value).replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`
  writeFileSync(
    join(stage, 'auth-config.php'),
    `<?php
// GENERATED by scripts/deploy.mjs — do not edit, do not commit.
return [
    'base' => ${phpString(base)},
    'user' => ${phpString(env.PREVIEW_USER)},
    'salt' => ${phpString(salt.toString('base64'))},
    'hash' => ${phpString(hash.toString('base64'))},
    'iterations' => ${iterations},
    'secret' => ${phpString(randomBytes(32).toString('hex'))},
    'ttl' => ${60 * 60 * 24 * 14},
];
`,
  )
}

function listFiles(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name)
    return statSync(path).isDirectory() ? listFiles(path) : [path]
  })
}

/**
 * Upload order — the live site is never half-updated for long: assets and
 * images first, then PHP, the pages (homepage last), sitemap/robots, the
 * gate files, and the .htaccess files at the very end (root one last).
 */
function uploadRank(file) {
  if (file === '.htaccess') return 7
  if (file.endsWith('/.htaccess')) return 6
  if (gateLeftovers.includes(file)) return 5
  if (file === 'robots.txt' || file === 'sitemap.xml') return 4
  if (file === 'index.html') return 3
  if (file.endsWith('.html')) return 2
  if (file.endsWith('.php')) return 1
  return 0
}
const files = listFiles(stage)
  .map((path) => relative(stage, path).split(sep).join('/'))
  .sort((a, b) => uploadRank(a) - uploadRank(b) || a.localeCompare(b))

if (dryRun) {
  console.log(`\n✔ dry run — staged ${files.length} files in .deploy-stage (nothing uploaded):`)
  for (const file of files) console.log(`  ${file}`)
  if (removeGate) {
    console.log(`\n--remove-gate would check and, after confirmation, delete on the server:`)
    const dir = remote.DIR ? remoteDir : `<${target.prefix}DIR>/`
    for (const file of gateLeftovers) console.log(`  ${dir}${file}`)
  }
  process.exit(0)
}

// 3. Upload ------------------------------------------------------------------
console.log(`\n▶ upload ${files.length} files → ${remoteUrl('')} (${target.protocol})`)
for (const file of files) {
  const url = remoteUrl(file)
  const localSize = statSync(join(stage, file)).size
  let error = ''
  for (let attempt = 1; attempt <= 3; attempt++) {
    const result = curl(['--ftp-create-dirs', '--fail', '-T', join(stage, file), url])
    if (result.status === 0) {
      error = ''
      break
    }
    error = result.stderr.trim()
    // Some FTPS servers answer 451 on the TLS data-channel close although the
    // file arrived intact — accept it when the remote size matches.
    if (remoteSize(url) === localSize) {
      error = ''
      break
    }
  }
  if (error) fail(`upload failed: ${file}\n${error}`)
  console.log(`  ✓ ${file}`)
}

rmSync(stage, { recursive: true, force: true })
console.log(`\n✔ deployed — ${target.origin}${base}`)

// 4. Production: preview gate files left on the server ------------------------
if (!target.gate) {
  const leftovers = gateLeftovers.filter((file) => remoteExists(remoteUrl(file)))
  if (leftovers.length === 0) process.exit(0)
  console.log(`\n⚠ preview gate files still on the server (the new .htaccess denies access to them):`)
  for (const file of leftovers) console.log(`  ${remoteDir}${file}`)
  if (!removeGate) {
    console.log('  Remove them with `pnpm deploy:production --remove-gate`, or by hand in the cPanel File Manager.')
    process.exit(0)
  }
  const rl = createInterface({ input: process.stdin, output: process.stdout })
  const answer = await rl.question('\nType "torles" to delete exactly these files: ')
  rl.close()
  if (answer.trim() !== 'torles') {
    console.log('  Nothing deleted.')
    process.exit(0)
  }
  for (const file of leftovers) {
    const result = curl(['--quote', `rm ${remoteDir}${file}`, '--output', devNull, remoteUrl('')])
    if (result.status !== 0) fail(`delete failed: ${file}\n${result.stderr.trim()}`)
    console.log(`  ✗ ${file} deleted`)
  }
}
