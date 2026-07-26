#!/usr/bin/env bash
# Android(gradle) 빌드 캐시 초기화 — 브랜치 전환 후 빌드 충돌 시 필수
set -u

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
ANDROID_DIR="$ROOT_DIR/android"

echo "==> [clean:android] Android 빌드 캐시를 정리합니다."

if [ -x "$ANDROID_DIR/gradlew" ] && [ -d "$ROOT_DIR/node_modules" ]; then
  echo "  - ./gradlew clean 실행"
  (cd "$ANDROID_DIR" && ./gradlew clean -q) || echo "  ! gradlew clean 실패(무시하고 디렉토리 직접 삭제로 진행)"
else
  echo "  - gradlew 실행 불가(node_modules 미설치 등): 디렉토리 직접 삭제만 수행"
fi

echo "  - .gradle / build / .cxx 디렉토리 삭제"
rm -rf \
  "$ANDROID_DIR/.gradle" \
  "$ANDROID_DIR/build" \
  "$ANDROID_DIR/app/build" \
  "$ANDROID_DIR/app/.cxx" \
  2>/dev/null || true

echo "==> [clean:android] 완료."
