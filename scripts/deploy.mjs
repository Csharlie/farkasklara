#!/usr/bin/env node
/**
 * Deploys a password-gated, non-indexed preview of the site.
 *
 *   pnpm deploy:pspro             https://pspro.hu/farkasklara/  (FTP over TLS)
 *   pnpm deploy:staging           https://farkaskonyveles.hu/    (SFTP, pinned host key)
 *   … --dry-run                   build → stage only, lists what would be uploaded
 *
 * Secrets come from .env.deploy.local (gitignored; template:
 * deploy/pspro/.env.deploy.example). The preview password is stored on the
 * server only as a PBKDF2 hash; the cookie-signing secret is regenerated on
 * every deploy (everyone logs in again). Credentials reach curl through
 * stdin, never through the command line.
 */
import { execSync, spawnSync } from 'node:child_process'
import { pbkdf2Sync, randomBytes } from 'node:crypto'
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { join, relative, sep } from 'node:path'

const root = new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')
const dryRun = process.argv.includes('--dry-run')

/**
 * Deploy targets. `modeEnv` holds the public build settings (DEPLOY_BASE);
 * `prefix` selects the transfer credentials in .env.deploy.local.
 * - robots: the target serves a host root → a disallow-all robots.txt is added.
 * - keepCpanelHtaccess: keep the cPanel-generated blocks of the remote .htaccess.
 */
const targets = {
  pspro: { mode: 'pspro', protocol: 'ftps', prefix: 'FTP_', origin: 'https://pspro.hu', robots: false, keepCpanelHtaccess: false },
  staging: { mode: 'staging', protocol: 'sftp', prefix: 'STAGING_SFTP_', origin: 'https://farkaskonyveles.hu', robots: true, keepCpanelHtaccess: true },
}
const targetName = process.argv.find((arg) => arg.startsWith('--target='))?.slice('--target='.length) ?? 'pspro'
const target = targets[targetName]

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

const base = readEnv(`.env.${target.mode}`).DEPLOY_BASE
if (!base || !base.startsWith('/') || !base.endsWith('/')) fail(`.env.${target.mode}: DEPLOY_BASE must look like / or /farkasklara/`)

const env = readEnv('.env.deploy.local')
const transferKeys = target.protocol === 'sftp' ? ['HOST', 'PORT', 'USER', 'PASS', 'DIR', 'HOSTKEY'] : ['HOST', 'USER', 'PASS', 'DIR']
const required = ['PREVIEW_USER', 'PREVIEW_PASSWORD', ...(dryRun ? [] : transferKeys.map((key) => target.prefix + key))]
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

/** Remote size (curl -I → Content-Length) — null when unknown. */
function remoteSize(url) {
  const match = /Content-Length:\s*(\d+)/i.exec(curl(['-I', url]).stdout ?? '')
  return match ? Number(match[1]) : null
}

// 1. Build ------------------------------------------------------------------
const outDir = `dist-${target.mode}`
console.log(`▶ build ${targetName} (base ${base})`)
execSync(`pnpm exec tsc -b && pnpm exec vite build --mode ${target.mode} --outDir ${outDir} --emptyOutDir`, { cwd: root, stdio: 'inherit' })

// 2. Stage: build + gate files + generated config ----------------------------
const stage = join(root, '.deploy-stage')
rmSync(stage, { recursive: true, force: true })
mkdirSync(stage)
cpSync(join(root, outDir), stage, { recursive: true })
for (const file of ['gate.php', 'auth-check.php', 'login.php']) cpSync(join(root, 'deploy/pspro', file), join(stage, file))

let htaccess = readFileSync(join(root, 'deploy/pspro/.htaccess.tpl'), 'utf8').replaceAll('{{BASE}}', base)
if (target.keepCpanelHtaccess && !dryRun) {
  // cPanel (MultiPHP) writes its PHP settings into public_html/.htaccess — keep those blocks.
  const existing = curl([remoteUrl('.htaccess')])
  const blocks = existing.status === 0 ? existing.stdout.match(/^# BEGIN cPanel-generated[\s\S]*?^# END cPanel-generated.*$/gm) ?? [] : []
  if (blocks.length) htaccess = `${blocks.join('\n\n')}\n\n${htaccess}`
}
writeFileSync(join(stage, '.htaccess'), htaccess)
if (target.robots) writeFileSync(join(stage, 'robots.txt'), 'User-agent: *\nDisallow: /\n')

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

function listFiles(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name)
    return statSync(path).isDirectory() ? listFiles(path) : [path]
  })
}

// Assets first, entry points last — the live site is never half-updated for long.
const entryLast = ['robots.txt', 'index.html', 'auth-config.php', 'gate.php', 'auth-check.php', 'login.php', '.htaccess']
const files = listFiles(stage)
  .map((path) => relative(stage, path).split(sep).join('/'))
  .sort((a, b) => entryLast.indexOf(a) - entryLast.indexOf(b) || a.localeCompare(b))

if (dryRun) {
  console.log(`\n✔ dry run — staged ${files.length} files in .deploy-stage (nothing uploaded):`)
  for (const file of files) console.log(`  ${file}`)
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
