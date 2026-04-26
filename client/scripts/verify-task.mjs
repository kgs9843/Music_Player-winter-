/**
 * 커밋/CI 공통 검증 (크로스 플랫폼).
 * bash 없이 Node만으로 실행됩니다. (린트·포맷·타입·빌드·FSD 경계)
 *
 * `--precommit` 또는 VERIFY_PRECOMMIT=1:
 *   전역 `prettier --check` 생략 — Husky에서 lint-staged가 이미 스테이징 파일에 Prettier 적용.
 *   워크트리/레포에 아직 안 맞춘 md 등이 있어도 커밋 가능. 전역 포맷은 `npm run verify`(기본) 또는 CI.
 */
import { execSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
process.chdir(root)

const precommitMode =
  process.argv.includes('--precommit') || process.env.VERIFY_PRECOMMIT === '1'

const sh = (cmd) => {
  console.log(`\n== ${cmd} ==`)
  execSync(cmd, { stdio: 'inherit', shell: true, env: process.env })
}

if (!fs.existsSync(path.join(root, 'node_modules'))) {
  sh('npm install')
}

sh('npm run lint')
if (!precommitMode) {
  sh('npm run format:check')
} else {
  console.log('\n== format:check (skipped in precommit mode) ==')
}
sh('npm run type-check')
sh('npm run build')

const walk = (dir, acc = []) => {
  if (!fs.existsSync(dir)) return acc
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name)
    const st = fs.statSync(p)
    if (st.isDirectory()) walk(p, acc)
    else if (/\.(ts|tsx)$/.test(name)) acc.push(p)
  }
  return acc
}

const forbidden = ['pages', 'features', 'widgets', 'entities', 'processes']
const sharedRoot = path.join(root, 'src', 'shared')
for (const f of walk(sharedRoot)) {
  const text = fs.readFileSync(f, 'utf8')
  for (const layer of forbidden) {
    const re = new RegExp(`from\\s+['"]@/${layer}`, 'm')
    if (re.test(text)) {
      console.error(
        `error: FSD violation in ${f}: shared must not import @/${layer}`,
      )
      process.exit(1)
    }
  }
}

console.log('\nverify-task: OK')
