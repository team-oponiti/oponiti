#!/usr/bin/env bash
# iOS(CocoaPods/Xcode) 빌드 캐시 초기화 — 브랜치 전환 후 빌드 충돌 시 필수
# 주의: Podfile.lock 은 삭제하지 않음 (버전 고정 유지). Pods 재설치는 'yarn ios:install'
set -u

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
IOS_DIR="$ROOT_DIR/ios"

echo "==> [clean:ios] iOS 빌드 캐시를 정리합니다."

echo "  - ios/Pods, ios/build 삭제"
rm -rf "$IOS_DIR/Pods" "$IOS_DIR/build" 2>/dev/null || true

# 이 프로젝트(detective)의 DerivedData 만 삭제
DERIVED="$HOME/Library/Developer/Xcode/DerivedData"
if [ -d "$DERIVED" ]; then
  echo "  - DerivedData(detective-*) 삭제"
  rm -rf "$DERIVED"/detective-* 2>/dev/null || true
fi

echo "==> [clean:ios] 완료. 이후 'yarn ios:install' 로 Pods 를 재설치하세요."
