#!/usr/bin/env bash
# Metro 번들러 / watchman 캐시 초기화
set -u

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

echo "==> [clean:metro] Metro / watchman 캐시를 정리합니다."

if command -v watchman >/dev/null 2>&1; then
  echo "  - watchman watch-del-all"
  watchman watch-del-all >/dev/null 2>&1 || true
else
  echo "  - watchman 미설치: 건너뜀"
fi

TMP="${TMPDIR:-/tmp}"
echo "  - Metro/haste 캐시 삭제 ($TMP)"
rm -rf "$TMP"/metro-* "$TMP"/haste-map-* "$TMP"/react-* 2>/dev/null || true

echo "  - $ROOT_DIR/node_modules/.cache 삭제"
rm -rf "$ROOT_DIR/node_modules/.cache" 2>/dev/null || true

echo "==> [clean:metro] 완료. Metro는 'yarn start:reset' 으로 다시 시작하세요."
