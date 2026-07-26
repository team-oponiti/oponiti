#!/usr/bin/env bash
# Android 릴리즈 빌드 사전 체크: release.keystore 존재 확인
set -u

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
KEYSTORE="$ROOT_DIR/android/app/release.keystore"

if [ ! -f "$KEYSTORE" ]; then
  echo "[오류] 릴리즈 서명 키스토어가 없습니다: android/app/release.keystore" >&2
  echo "  이 파일은 gitignore 되어 저장소에 포함되지 않습니다." >&2
  echo "  인수인계 자료(구글 드라이브 압축본)에서 release.keystore 를 복사해" >&2
  echo "  android/app/release.keystore 경로에 배치한 뒤 다시 실행하세요." >&2
  exit 1
fi

echo "==> release.keystore 확인 완료."
