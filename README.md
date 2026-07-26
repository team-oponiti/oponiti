# 오퍼니티 React Native 모노레포 — 탐정톡 탐정용 (stable/thamtu)

하나의 레포지토리에서 **브랜치 분기로 8개의 RN 앱**을 관리합니다.
이 문서는 공통 가이드 + **현재 브랜치의 앱(탐정톡 탐정용)** 상세를 담고 있습니다.
다른 앱 브랜치에서는 "앱 상세" 섹션만 해당 앱 내용으로 교체됩니다.

> 인수인계 이력/계정 정보는 [HISTORY.md](./HISTORY.md) 참고.

---

## 1. 레포 구조: 브랜치 = 앱

| 브랜치            | 앱                              | 서비스 도메인           |
| ----------------- | ------------------------------- | ----------------------- |
| `ddokddok`        | 똑똑 - 유저용                   | ddokddok.co (운영 종료) |
| `ddokddok2`       | 똑똑 - 전문가용                 | ddokddok.co (운영 종료) |
| **`thamtu`**      | **탐정톡 - 탐정용 (이 브랜치)** | tamtalk.com             |
| `thamtu_user`     | 탐정톡 - 유저용                 | tamtalk.com             |
| `healmate`        | 힐메이트 - 유저용               | healmate.kr             |
| `healmate_doctor` | 힐메이트 - 병원용               | healmate.kr             |
| `hanbang_user`    | 한방메이트 - 유저용             | hanbangmate.com         |
| `hanbang_doctor`  | 한방메이트 - 병원용             | hanbangmate.com         |

- 각 앱 브랜치에는 `stable/<브랜치명>` 형태의 **안정 버전 브랜치**가 존재합니다. 작업/검증은 `stable/*` 기준으로 진행하세요.
- 스토어 릴리즈 시점에는 git tag 를 사용합니다. 규칙: `<브랜치명>-aos-release`, `<브랜치명>-ios-release` (예: `thamtu-aos-release`).
- 기본 브랜치(origin/HEAD)는 `ddokddok2` 입니다.

## 2. ⚠️ 브랜치 전환 시 반드시 읽을 것

브랜치마다 **네이티브 프로젝트(android/, ios/)가 완전히 다른 앱**입니다.
브랜치를 전환하면 이전 앱의 gradle 캐시(`android/.gradle`, `android/app/build`), CocoaPods(`ios/Pods`), Metro haste map, `node_modules` 가 남아 있어 **빌드가 실패하거나, 더 위험하게는 이전 앱의 리소스가 섞인 채 빌드될 수 있습니다.**

**브랜치 전환 후에는 반드시 한 번에 초기화하세요:**

```bash
yarn reset
```

`yarn reset` 은 다음을 순서대로 수행합니다:
Metro/watchman 캐시 삭제 → gradle clean + 빌드 디렉토리 삭제 → Pods/DerivedData 삭제 → `node_modules` 삭제 → `yarn install` → `bundle install` → `pod install`

개별 정리만 필요하면 `yarn clean:metro` / `yarn clean:android` / `yarn clean:ios` 를 사용하세요.

## 3. 사전 준비

| 항목           | 요구 사항                                                                                                                                      |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Node.js        | ≥ 18                                                                                                                                           |
| 패키지 매니저  | **Yarn 3.6.4 (레포에 vendored — `.yarn/releases/`)**. `yarn` 명령만 사용, **`npm install` 금지** (`.yarnrc.yml` 의 `nodeLinker: node-modules`) |
| Ruby / Bundler | CocoaPods 는 `Gemfile` + `bundle exec` 경유로 실행 (`vendor/bundle` 에 설치됨)                                                                 |
| Xcode          | iOS 빌드용. 최초 1회 `yarn ios:install` 로 Pods 설치 필요                                                                                      |
| Android SDK    | `ANDROID_HOME` 환경변수 필요 (`android/local.properties` 는 사용하지 않음)                                                                     |

### 필수 파일: release.keystore (Android 릴리즈 빌드 전용)

`android/app/release.keystore` 는 **gitignore 되어 저장소에 없습니다.**
인수인계 자료(구글 드라이브 압축본)에서 복사해 아래 경로에 배치하세요:

```
android/app/release.keystore
```

- 서명 정보(비밀번호/alias)는 `android/app/build.gradle` 의 `signingConfigs.release` 에 하드코딩되어 있어 별도 환경변수는 필요 없습니다.
- 미배치 시 `yarn android:build:*` 실행 시점에 한글 안내와 함께 조기 실패합니다 (`scripts/check-keystore.sh`).
- 디버그 빌드는 keystore 없이 가능합니다 (기본 `~/.android/debug.keystore` 서명).
- ⚠️ 브랜치별(앱별) 서명 keystore 가 동일 파일인지는 확인이 필요합니다 — Play Console 의 앱 서명 SHA-1 과 대조하세요.

`.env` 파일은 **사용하지 않습니다.** 환경(dev/prod) 분기는 네이티브 상수로 처리됩니다 (아래 4-2 참고).

## 4. 앱 상세: 탐정톡 탐정용 (thamtu)

### 4-1. 앱 성격

- **tamtalk.com 을 감싸는 WebView 셸 앱**의 탐정(사업자) 측입니다. 네이티브 코드는 로그인 유지(토큰/쿠키 동기화), 푸시, 딥링크, 탭별 뱃지 등 브릿지 역할만 수행합니다.
- 화면 흐름: 스플래시 → 로그인 WebView(`/detective-login/`) → 대시보드(**하단 5탭**: Home(채팅) / Comunity(블로그) / Ticket(멤버십) / Account / More, 각 탭이 WebView).
- 유저용과의 주요 차이: 채팅 수신함이 첫 탭, 멤버십(구독권)·계정 탭 존재, **Remote Config 심사용 스위치 없음** (`@react-native-firebase/remote-config` 미설치).
- 웹→네이티브 브릿지: `src/screen/WebviewScreen.js` + `src/common/inject.js`.
- 소스는 전부 `.js` 입니다 (TypeScript 미사용, 엔트리는 `App.js`).

### 4-2. 환경(dev/prod) 분기 방식

`.env` / react-native-config 를 쓰지 않고 **네이티브 상수**를 JS 에서 읽습니다 (`src/define/webviewUri.js` → `NativeModules.AppNativeModule`):

| 플랫폼  | 파일                                                                   | 분기 기준                        | dev 서버                |
| ------- | ---------------------------------------------------------------------- | -------------------------------- | ----------------------- |
| Android | `android/app/src/main/java/com/oponiti/tamtalk/biz/AppNativeModule.kt` | `BuildConfig.FLAVOR == "dev"`    | `http://43.203.213.15`  |
| iOS     | `ios/RNENVConfig.m`                                                    | `dev` 타겟의 `DEV` 전처리 매크로 | `http://43.203.234.150` |

⚠️ **Android 와 iOS 의 dev 서버 IP 가 서로 다릅니다.** 네이티브 상수가 없으면 JS 는 `https://tamtalk.com` (운영) 으로 폴백합니다.

### 4-3. Android 구성

- gradle 플레이버: `dev` / `chplay` — **이 문서와 스크립트에서 `prod` = `chplay` 플레이버**입니다 (chplay = Google Play 운영 빌드).

| 플레이버        | applicationId             | versionCode / versionName | 용도           |
| --------------- | ------------------------- | ------------------------- | -------------- |
| `dev`           | `com.oponiti.tamtalk.biz` | 25 / 1.0.12               | 개발 서버 연결 |
| `chplay` (prod) | `com.oponiti.tamtalk.biz` | 24 / 1.0.11               | 운영(스토어)   |

- ⚠️ **두 플레이버의 applicationId 가 동일**합니다 (유저용과 달리 dev 접미사 없음) → **한 기기에 dev 와 prod 를 동시에 설치할 수 없고 서로 덮어씁니다.** 서명이 다르면(debug↔release) 설치 전 `adb uninstall com.oponiti.tamtalk.biz` 가 필요합니다.
- 빌드 변형: `devDebug` / `devRelease` / `chplayDebug` / `chplayRelease`
- 버전 관리: `android/app/build.gradle` 의 **각 플레이버 블록** 안에서 versionCode/versionName 을 올립니다 (defaultConfig 값은 플레이버에 덮여 사용되지 않음).
- 릴리즈 서명: `android/app/build.gradle` `signingConfigs.release` (release.keystore 필요, 위 3장 참고).
- Firebase 설정: 플레이버별 커밋됨 — `android/app/src/dev/google-services.json`, `android/app/src/chplay/google-services.json` (프로젝트 `detective-46229`).
- `react-native.config.js` 의 `packageName` 은 `com.oponiti.tamtalk.biz` 로 일치합니다.

### 4-4. iOS 구성

- 워크스페이스: `ios/detective.xcworkspace` (프로젝트명 `detective`)

| 타겟 / 스킴          | Bundle ID                                | 버전       | 용도                  |
| -------------------- | ---------------------------------------- | ---------- | --------------------- |
| `detective` (prod)   | `com.detectivex.app`                     | 1.0.6 (24) | 운영(스토어)          |
| `dev`                | `com.detectivex.dev`                     | 1.0.3 (17) | 개발 서버 연결        |
| `NotiService` (확장) | `com.detectivex.app.NotificationService` | —          | 푸시 알림 서비스 확장 |

- 개발팀 ID: `Z59VCCA327` (자동 서명). `dev` 공유 스킴 커밋되어 있음.
- 버전 관리: Xcode 각 타겟의 `MARKETING_VERSION` / `CURRENT_PROJECT_VERSION`
- Firebase 설정: `ios/detective/GoogleService-Info.plist`(prod), `ios/detective/dev/GoogleService-Info.plist`(dev) — **타겟별로 올바르게 연결되어 있음** (유저용 브랜치와 달리 정상).
- CocoaPods 는 반드시 `bundle exec pod install` (= `yarn ios:install`) 로 실행하세요. bundler 기준 CocoaPods 1.15.2 가 사용되며 `Podfile.lock` 은 커밋 대상입니다 (6장 이슈 참고).

### 4-5. 푸시 / 딥링크

- 푸시: FCM (`@react-native-firebase/messaging`). 탭별 뱃지 카운트 갱신 (`src/screen/DashboardScreen.js`).
- URL 스킴: iOS `tamtalk-t://`, Android `detective://app` — **플랫폼별로 커스텀 스킴이 다릅니다** (유저용 앱은 `tamtalk-u://`).
- 앱 링크: Android `https://tamtalk.page.link` (구 Firebase Dynamic Links 도메인), iOS associated domains `applinks:tamtalk.page.link`. Dynamic Links 핸들러 본문은 주석 처리되어 있어 실질 라우팅은 하지 않습니다.

## 5. 명령어 레퍼런스

모든 명령은 레포 루트에서 `yarn <스크립트>` 로 실행합니다.

### 최초 설치 / 초기화

| 명령                 | 설명                                                                       |
| -------------------- | -------------------------------------------------------------------------- |
| `yarn install`       | JS 의존성 설치 (vendored Yarn 3.6.4)                                       |
| `yarn ios:install`   | `bundle install` + `pod install` (iOS 최초 1회 및 네이티브 의존성 변경 시) |
| `yarn reset`         | **전체 초기화 + 재설치 (브랜치 전환 후 필수)**                             |
| `yarn clean:metro`   | Metro/watchman 캐시만 삭제                                                 |
| `yarn clean:android` | gradle clean + `.gradle`/`build`/`.cxx` 삭제                               |
| `yarn clean:ios`     | `Pods`/`build`/DerivedData 삭제 (Podfile.lock 은 유지)                     |

### 로컬 실행 (기기/에뮬레이터 설치 + Metro 연결)

| 명령                              | 플랫폼  | 환경         | 비고                              |
| --------------------------------- | ------- | ------------ | --------------------------------- |
| `yarn start` / `yarn start:reset` | —       | —            | Metro 번들러 (reset 은 캐시 무시) |
| `yarn android:devDebug`           | Android | dev          | `installDevDebug`                 |
| `yarn android:prodDebug`          | Android | prod(chplay) | `installChplayDebug`              |
| `yarn android:devRelease`         | Android | dev          | 릴리즈 모드 설치 (keystore 필요)  |
| `yarn android:prodRelease`        | Android | prod(chplay) | 릴리즈 모드 설치 (keystore 필요)  |
| `yarn ios:devDebug`               | iOS     | dev          | 스킴 `dev`                        |
| `yarn ios:prodDebug`              | iOS     | prod         | 스킴 `detective`                  |
| `yarn ios:devRelease`             | iOS     | dev          | 릴리즈 모드                       |
| `yarn ios:prodRelease`            | iOS     | prod         | 릴리즈 모드                       |

### 배포용 빌드 (Android)

| 명령                      | 산출물                      | 경로                                              |
| ------------------------- | --------------------------- | ------------------------------------------------- |
| `yarn android:build:dev`  | dev APK                     | `android/app/build/outputs/apk/dev/release/`      |
| `yarn android:build:prod` | prod APK                    | `android/app/build/outputs/apk/chplay/release/`   |
| `yarn android:build:aab`  | **Play Store 업로드용 AAB** | `android/app/build/outputs/bundle/chplayRelease/` |

- 세 명령 모두 실행 전 `release.keystore` 존재를 자동 체크합니다.
- iOS 스토어 배포는 Xcode 에서 `detective` 스킴 선택 → Product > Archive → Organizer 업로드로 진행합니다 (fastlane 등 자동화 없음).

### 기타

| 명령        | 설명   |
| ----------- | ------ |
| `yarn lint` | ESLint |
| `yarn test` | Jest   |

### 트러블슈팅

- **Android debug 빌드 시 `JetifyTransform ... Java heap space` 오류** — `android.enableJetifier=true` 상태에서 RN debug AAR 변환에 힙 2GB 로는 부족해 발생. `android/gradle.properties` 의 `org.gradle.jvmargs` 를 `-Xmx4096m -XX:MaxMetaspaceSize=1024m` 로 상향해 해결해 둠. 재발 시 `cd android && ./gradlew --stop` 으로 데몬 재시작 후 다시 빌드하세요 (jvmargs 변경은 데몬 재시작 후 적용).
- 원인 불명의 빌드 실패는 우선 `yarn reset` 후 재시도.

## 6. 알려진 이슈 (이 브랜치 기준, 미수정 상태)

빌드/배포 시 알고 있어야 할 문제들입니다. 코드 수정 시 참고하세요.

1. **dev/prod 동일 applicationId** — 두 플레이버 모두 `com.oponiti.tamtalk.biz` 라 한 기기에 동시 설치 불가, 서로 덮어씁니다 (4-3 참고).
2. **QR 스캔 브릿지가 동작하지 않음** — 웹 브릿지 `qrCode` 호출 시 `navigation.push("QrcodeScreen")` 을 실행하지만 (`src/common/functions.js`), `QrcodeScreen` 화면 파일도 네비게이션 등록도 존재하지 않습니다. `react-native-qrcode-scanner`/`react-native-camera` 의존성만 남아 있는 상태.
3. **iOS `dev` 빌드에 NotiService 미포함** — `dev` 타겟의 확장 임베드 페이즈가 비어 있어 dev 빌드는 알림 서비스 확장이 없습니다 (NotiService 번들 ID 가 `com.detectivex.app.*` 프리픽스라 dev 에 그대로 임베드할 수도 없는 구조).
4. **iOS dev 의 `env` 상수가 `"prod"` 반환** — `ios/RNENVConfig.m` 의 DEV 분기에도 `env: "prod"` 로 하드코딩되어 있습니다 (복붙 버그). URL 상수는 정상 분기.
5. **DashboardScreen 의 `language` 변수 미정의** — `tabBarLabel` 에서 정의되지 않은 `language` 를 참조합니다. 현재 동작하더라도 잠재 ReferenceError.
6. **CocoaPods 버전 불일치** — 기존 `Podfile.lock` 은 전역 CocoaPods 1.16.2 로 생성됐지만, `Gemfile` 이 `xcodeproj < 1.26` 을 강제해 bundler 경유(`yarn ios:install`)로는 1.15.2 가 설치됩니다. 최초 `yarn ios:install` 시 `Podfile.lock` 이 재생성되는데 정상 동작이며 커밋해도 무방합니다. 재현성을 위해 `Gemfile.lock` 도 함께 커밋하세요.
7. **릴리즈 서명 정보가 gradle 에 하드코딩** — keystore 비밀번호가 `android/app/build.gradle` 에 평문으로 커밋되어 있습니다. 이 브랜치의 release.keystore 가 유저용 앱과 동일 파일인지도 미확인 (Play Console SHA-1 대조 필요).
8. **APK 파일명 특이사항** — `archivesBaseName` 이 `${applicationIdSuffix}`(항상 null) 를 보간해 `...-null` 로 끝나고, dev 산출물 접두사가 `DEV-Detective_USER` 로 **유저용 이름을 그대로 사용** 중입니다 (실제로는 탐정용 앱). 파일명만의 문제로 동작에는 무해.
9. **앱 표시명이 유저용과 동일** — 런처 라벨이 둘 다 `탐정톡` 이라 한 기기에 유저용/탐정용을 같이 설치하면 아이콘 라벨로 구분되지 않습니다.
10. **dev 서버 IP 가 플랫폼별 상이** (4-2 참고) — Android `43.203.213.15`, iOS `43.203.234.150`.
