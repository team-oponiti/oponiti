# 오퍼니티 React Native 모노레포 — 탐정톡 유저용 (stable/thamtu_user)

하나의 레포지토리에서 **브랜치 분기로 8개의 RN 앱**을 관리합니다.
이 문서는 공통 가이드 + **현재 브랜치의 앱(탐정톡 유저용)** 상세를 담고 있습니다.
다른 앱 브랜치에서는 "앱 상세" 섹션만 해당 앱 내용으로 교체됩니다.

> 인수인계 이력/계정 정보는 [HISTORY.md](./HISTORY.md) 참고.

---

## 1. 레포 구조: 브랜치 = 앱

| 브랜치            | 앱                              | 서비스 도메인           |
| ----------------- | ------------------------------- | ----------------------- |
| `ddokddok`        | 똑똑 - 유저용                   | ddokddok.co (운영 종료) |
| `ddokddok2`       | 똑똑 - 전문가용                 | ddokddok.co (운영 종료) |
| `thamtu`          | 탐정톡 - 탐정용                 | tamtalk.com             |
| **`thamtu_user`** | **탐정톡 - 유저용 (이 브랜치)** | tamtalk.com             |
| `healmate`        | 힐메이트 - 유저용               | healmate.kr             |
| `healmate_doctor` | 힐메이트 - 병원용               | healmate.kr             |
| `hanbang_user`    | 한방메이트 - 유저용             | hanbangmate.com         |
| `hanbang_doctor`  | 한방메이트 - 병원용             | hanbangmate.com         |

- 각 앱 브랜치에는 `stable/<브랜치명>` 형태의 **안정 버전 브랜치**가 존재합니다. 작업/검증은 `stable/*` 기준으로 진행하세요.
- 스토어 릴리즈 시점에는 git tag 를 사용합니다. 규칙: `<브랜치명>-aos-release`, `<브랜치명>-ios-release` (예: `thamtu_user-aos-release`).
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

`.env` 파일은 **사용하지 않습니다.** 환경(dev/prod) 분기는 네이티브 상수로 처리됩니다 (아래 4-2 참고).

## 4. 앱 상세: 탐정톡 유저용 (thamtu_user)

### 4-1. 앱 성격

- **tamtalk.com 을 감싸는 WebView 셸 앱**입니다. 네이티브 코드는 로그인 유지(토큰/쿠키 동기화), 푸시, 딥링크, 뱃지, QR 스캔 등 브릿지 역할만 수행합니다.
- 화면 흐름: 스플래시 → 로그인 WebView(`/login/`) → 대시보드(하단 4탭: 탐정 / 메시지 / 블로그 / 더보기, 각 탭이 WebView).
  - 블로그 탭은 Firebase Remote Config `review` 키가 `1.0.1` 일 때 숨겨집니다 (앱 심사용 스위치, `src/screen/DashboardScreen.js`).
- 웹→네이티브 브릿지: `src/screen/WebviewScreen.js` — `navigate`, `set-token`, `logout`, `socialLogin`, `share`, `badge-main` 등 메시지 타입 처리.
- 소스는 전부 `.js/.jsx` 입니다 (TypeScript 미사용, 엔트리는 `App.jsx`).

### 4-2. 환경(dev/prod) 분기 방식

`.env` / react-native-config 를 쓰지 않고 **네이티브 상수**를 JS 에서 읽습니다 (`src/define/webviewUri.js` → `NativeModules.AppNativeModule`):

| 플랫폼  | 파일                                                               | 분기 기준                        | dev 서버                |
| ------- | ------------------------------------------------------------------ | -------------------------------- | ----------------------- |
| Android | `android/app/src/main/java/com/oponiti/tamtalk/AppNativeModule.kt` | `dev` 플레이버 여부              | `http://43.203.213.15`  |
| iOS     | `ios/detective/RNENVConfig.m`                                      | `dev` 타겟의 `DEV` 전처리 매크로 | `http://43.203.234.150` |

⚠️ **Android 와 iOS 의 dev 서버 IP 가 서로 다릅니다.** 네이티브 상수가 없으면 JS 는 `https://tamtalk.com` (운영) 으로 폴백합니다.

### 4-3. Android 구성

- gradle 플레이버: `dev` / `chplay` — **이 문서와 스크립트에서 `prod` = `chplay` 플레이버**입니다 (chplay = Google Play 운영 빌드).

| 플레이버        | applicationId             | versionCode / versionName | 용도           |
| --------------- | ------------------------- | ------------------------- | -------------- |
| `dev`           | `com.oponiti.tamtalk.dev` | 29 / 1.0.7                | 개발 서버 연결 |
| `chplay` (prod) | `com.oponiti.tamtalk`     | 28 / 1.0.6                | 운영(스토어)   |

- 빌드 변형: `devDebug` / `devRelease` / `chplayDebug` / `chplayRelease`
- 버전 관리: `android/app/build.gradle` 의 **각 플레이버 블록** 안에서 versionCode/versionName 을 올립니다 (defaultConfig 값은 플레이버에 덮여 사용되지 않음).
- 릴리즈 서명: `android/app/build.gradle` `signingConfigs.release` (release.keystore 필요, 위 3장 참고).
- Firebase 설정: 플레이버별 커밋됨 — `android/app/src/dev/google-services.json`, `android/app/src/chplay/google-services.json` (프로젝트 `detective-46229`).
- `react-native.config.js` 가 `packageName` 을 `com.oponiti.tamtalk` 로 고정하므로, CLI 실행 스크립트에는 `--appId` 가 명시되어 있습니다 (dev 실행 시 `.dev` 접미사 필요).

### 4-4. iOS 구성

- 워크스페이스: `ios/detective.xcworkspace` (프로젝트명 `detective`)

| 타겟 / 스킴          | Bundle ID                            | 버전        | 용도                  |
| -------------------- | ------------------------------------ | ----------- | --------------------- |
| `detective` (prod)   | `com.detectiveuser.app`              | 1.0.13 (27) | 운영(스토어)          |
| `dev`                | `com.detectiveuser.dev`              | 1.0.8 (14)  | 개발 서버 연결        |
| `NotiService` (확장) | `com.detectiveuser.app.Notification` | —           | 푸시 알림 서비스 확장 |

- 개발팀 ID: `Z59VCCA327` (자동 서명)
- 버전 관리: Xcode 각 타겟의 `MARKETING_VERSION` / `CURRENT_PROJECT_VERSION`
- Firebase 설정: `ios/detective/GoogleService-Info.plist`(prod), `ios/detective/dev/GoogleService-Info.plist`(dev) — 단, dev 타겟 연결 버그 있음(6장 참고)
- CocoaPods 는 반드시 `bundle exec pod install` (= `yarn ios:install`) 로 실행하세요. bundler 기준 CocoaPods 1.15.2 가 사용되며 `Podfile.lock` 은 커밋 대상입니다 (6장 이슈 4 참고).

### 4-5. 푸시 / 딥링크

- 푸시: FCM (`@react-native-firebase/messaging`). 기동 시 토픽 `noti`, `user` 구독. 알림 탭 시 `data.contentUrl` 로 WebView 라우팅 (`src/screen/DashboardScreen.js`).
- URL 스킴: `tamtalk-u://` (탐정용 앱은 `tamtalk-t://`)
- 유니버설/앱 링크: `https://link.tamtalk.com`, `oponiti.page.link` (Firebase Dynamic Links). 딥링크는 `https://tamtalk.com` 으로 시작하는 URL 만 허용 (하드코딩, dev 링크는 라우팅되지 않음).

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

1. **iOS `dev` 타겟이 운영용 Firebase 설정을 복사** — `dev` 타겟의 Resources 빌드 페이즈가 `ios/detective/GoogleService-Info.plist`(prod, `com.detectiveuser.app`) 를 포함하고, dev 용 plist(`ios/detective/dev/GoogleService-Info.plist`) 는 어떤 빌드 페이즈에도 없습니다. dev 빌드의 푸시/애널리틱스가 운영 Firebase 앱으로 잡힐 수 있습니다.
2. **chplay APK 파일명에 `-null` 접미사** — `archivesBaseName` 이 `applicationIdSuffix` 를 보간하는데 chplay 는 접미사가 없어 `...-null` 로 끝납니다. 동작에는 무해.
3. **NotiService 배포 타겟 17.5 vs 앱 13.4** — iOS 17.5 미만 기기에서는 알림 확장이 동작하지 않습니다.
4. **CocoaPods 버전 불일치** — 기존 `Podfile.lock` 은 전역 CocoaPods 1.16.2 로 생성됐지만, `Gemfile` 이 `xcodeproj < 1.26` 을 강제해 bundler 경유(`yarn ios:install`)로는 1.15.2 가 설치됩니다. 따라서 최초 `yarn ios:install` 시 `Podfile.lock` 의 SPEC CHECKSUMS 와 COCOAPODS 버전 줄이 재생성되는데, **정상 동작이며 커밋해도 무방**합니다. 재현성을 위해 `Gemfile.lock` 도 함께 커밋하세요.
5. **릴리즈 서명 정보가 gradle 에 하드코딩** — keystore 비밀번호가 `android/app/build.gradle` 에 평문으로 커밋되어 있습니다.
6. **iOS 위치 권한 문구가 빈 문자열** — `NSLocationWhenInUseUsageDescription` 이 비어 있어 심사 리젝 사유가 될 수 있습니다. 마이크 권한 문구도 카메라용 문구를 재사용 중.
7. **디버그 서명 변경 이력** — 최근 커밋에서 디버그 빌드 서명이 release.keystore → 기본 debug.keystore 로 변경되어, 이전에 등록한 SHA-1 지문(Firebase/App Links)과 달라졌을 수 있습니다.
8. **dev 서버 IP 가 플랫폼별 상이** (4-2 참고) — Android `43.203.213.15`, iOS `43.203.234.150`.
