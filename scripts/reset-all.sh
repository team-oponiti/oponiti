#!/usr/bin/env bash
# 전체 초기화 + 재설치 (브랜치 전환 후 반드시 실행 권장)
# Metro/gradle/Pods 캐시 삭제 → node_modules 재설치 → CocoaPods 재설치
set -eu

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

echo "========================================"
echo " 전체 리셋: $(git branch --show-current 2>/dev/null || echo '?') 브랜치"
echo "========================================"

bash "$ROOT_DIR/scripts/clean-metro.sh"
bash "$ROOT_DIR/scripts/clean-android.sh"
bash "$ROOT_DIR/scripts/clean-ios.sh"

echo "==> [reset] node_modules 삭제"
rm -rf "$ROOT_DIR/node_modules"

echo "==> [reset] yarn install (vendored Yarn 3.6.4)"
yarn install

if [ "$(uname)" = "Darwin" ]; then
  echo "==> [reset] bundle install (CocoaPods 준비)"
  bundle install
  echo "==> [reset] pod install"
  (cd "$ROOT_DIR/ios" && bundle exec pod install)
else
  echo "==> [reset] macOS 가 아니므로 iOS(pod install) 단계는 건너뜁니다."
fi

echo "========================================"
echo " 리셋 완료. 다음 단계:"
echo "   - Android 디버그 실행: yarn android:devDebug 또는 yarn android:prodDebug"
echo "   - iOS 디버그 실행:     yarn ios:devDebug 또는 yarn ios:prodDebug"
echo "   - 릴리즈 빌드 전 android/app/release.keystore 배치 확인"
echo "========================================"
