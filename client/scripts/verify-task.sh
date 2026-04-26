#!/usr/bin/env bash
set -euo pipefail
# 크로스 플랫폼 검증 엔트리( POSIX 환경에서 Node 실행 )
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"
exec node scripts/verify-task.mjs
