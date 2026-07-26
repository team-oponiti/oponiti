# 오퍼니티 React Native 모노레포 — 힐메이트 병원용 (stable/healmate_doctor)

하나의 레포지토리에서 **브랜치 분기로 8개의 RN 앱**을 관리합니다.
이 문서는 공통 가이드 + **현재 브랜치의 앱(힐메이트 병원용)** 상세를 담고 있습니다.
다른 앱 브랜치에서는 "앱 상세" 섹션만 해당 앱 내용으로 교체됩니다.

> 인수인계 이력/계정 정보는 [HISTORY.md](./HISTORY.md) 참고.

---

## 1. 레포 구조: 브랜치 = 앱

| 브랜치              | 앱                                | 서비스 도메인           |
| ------------------- | --------------------------------- | ----------------------- |
| `ddokddok`          | 똑똑 - 유저용                     | ddokddok.co (운영 종료) |
| `ddokddok2`         | 똑똑 - 전문가용                   | ddokddok.co (운영 종료) |
| `thamtu`            | 탐정톡 - 탐정용                   | tamtalk.com             |
| `thamtu_user`       | 탐정톡 - 유저용                   | tamtalk.com             |
| `healmate`          | 힐메이트 - 유저용                 | healmate.kr             |
| **`healmate_doctor`** | **힐메이트 - 병원용 (이 브랜치)** | hospital.healmate.kr    |
| `hanbang_user`      | 한방메이트 - 유저용               | hanbangmate.com         |
| `hanbang_doctor`    | 한방메이트 - 병원용               | hanbangmate.com         |

- 각 앱 브랜치에는 `stable/<브랜치명>` 형태의 **안정 버전 브랜치**가 존재합니다. 작업/검증은 `stable/*` 기준으로 진행하세요.
- 스토어 릴리즈 시점에는 git tag 를 사용합니다. 규칙: `<브랜치명>-aos-release`, `<브랜치명>-ios-release` (예: `healmate_doctor-aos-release`).
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

`.env` 파일은 **사용하지 않습니다.** 이 앱은 환경 분기 없이 JS 에 운영 URL 이 하드코딩되어 있습니다 (아래 4-2 참고).

## 4. 앱 상세: 힐메이트 병원용 (healmate_doctor)

### 4-1. 앱 성격

- **hospital.healmate.kr 을 감싸는 WebView 셸 앱**입니다 (힐메이트의 병원/의료진 측 — 환자 요청 수신·응답, 병원 소식/커뮤니티 관리). 네이티브 코드는 로그인 유지(리프레시 토큰/쿠키), 푸시+뱃지, QR 스캔, 카카오 OAuth 리다이렉트, 딥링크, 유저 앱으로의 점프(`heal://`)를 담당합니다.
- 대시보드 **하단 5탭**: Home / Request(환자 요청) / Community / News(병원소식) / Me — 각 탭이 `/hospital/*` 경로의 WebView. Review 탭은 주석 처리됨. 로그인은 `/login-hospital`, 별도 `LoginScreen.js` 존재.
- Remote Config 심사용 스위치 없음. 소스는 전부 `.js` (엔트리 `App.js`).
- 웹→네이티브 브릿지 메시지: `hide-navigation`, `set-refresh`, `open-app`, `navigate`, `set-time-stamp`, `copy-text` 등 (`src/screen/WebviewScreen.js`).

### 4-2. 환경(dev/prod) 분기 방식 — 사실상 없음 ⚠️

- 서비스 URL 은 `src/define/webviewUri.js` 에 **`https://hospital.healmate.kr` 로 하드코딩** (주석 처리된 `7coffee.net` 스테이징 블록 존재).
- 네이티브 env 모듈(`AppNativeModule.kt`, `ios/RNENVConfig.m`)은 탐정톡 시절 URL 잔재이며 JS 가 읽지 않습니다.
- 따라서 **dev 플레이버/타겟도 운영 hospital.healmate.kr 을 로드**합니다. dev 의 의미는 버전 코드/산출물 이름 차이뿐.

### 4-3. Android 구성

- gradle 플레이버: `dev` / `chplay` — **이 문서와 스크립트에서 `prod` = `chplay` 플레이버** (chplay = Google Play 운영 빌드).

| 플레이버        | applicationId          | versionCode / versionName | 용도          |
| --------------- | ---------------------- | ------------------------- | ------------- |
| `dev`           | `com.healmatedoc.prod` | 11 / 1.0.0                | (분기 무의미) |
| `chplay` (prod) | `com.healmatedoc.prod` | 10 / 1.0.0                | 운영(스토어)  |

- ⚠️ **두 플레이버의 applicationId 가 동일** → 동시 설치 불가, 서로 덮어씀. debug↔release 서명이 다르면 설치 전 `adb uninstall com.healmatedoc.prod` 필요.
- `namespace` 와 `react-native.config.js` 의 packageName 은 **`com.oponiti.tamtalk.biz`** (탐정톡 잔재 — 실행 스크립트는 `--appId com.healmatedoc.prod` 로 보정).
- 빌드 변형: `devDebug` / `devRelease` / `chplayDebug` / `chplayRelease`
- Firebase: 프로젝트 **`helmate-5b345`** (유저용과 공유). `android/app/src/{dev,chplay}/google-services.json` 은 서로 동일 파일 (클라이언트: `com.healmate.prod`, `com.healmatedoc.prod`, `com.helmate.prod`, `com.helmatedoc.prod` — 철자 다른 helmate* 잔재 클라이언트 혼재 주의).
- 딥링크: 앱 링크 `https://hospital.healmate.kr`(autoVerify), 커스텀 스킴 `dheal://healmate`. 카카오 OAuth 스킴 `kakao0135...://oauth`.

### 4-4. iOS 구성

- 워크스페이스: `ios/detective.xcworkspace` (프로젝트/디렉토리 이름은 탐정톡 시절 `detective` 그대로).

| 타겟              | 스킴        | Bundle ID                   | 버전       | 팀         |
| ----------------- | ----------- | --------------------------- | ---------- | ---------- |
| `healmate` (prod) | `detective` | `com.ddokddok.expert` ⚠️     | 1.0.6 (19) | Z59VCCA327 |
| `dev`             | `dev`       | `com.ddokddok2.blue.dev` ⚠️  | 1.0.3 (17) | WAN6Y987S4 |

- ⚠️ **번들 ID 가 똑똑(ddokddok) 앱의 것** — 유저용 브랜치와 동일한 문제. App Store 의 병원용 실제 번들 ID 와 대조 전에는 아카이브 금지 (6장 이슈 1). 두 타겟의 개발팀도 상이.
- 프로드 타겟 이름은 `healmate` 지만 **스킴 이름은 `detective`** (`yarn ios:prodDebug` 가 `--scheme detective` 인 이유). `dev` 공유 스킴 커밋되어 있음.
- Firebase 설정: prod/dev 용 `GoogleService-Info.plist` 가 **서로 동일 파일**이고 둘 다 `com.healmatedoc.prod` 용 — 타겟 번들 ID 와 불일치 (6장 이슈 1).
- prod/dev 의 `Info.plist` 도 내용이 동일해 dev 분리는 사실상 없음. dev 타겟은 빌드 설정의 표시명 잔재(`탐정톡`)가 plist 값을 덮을 수 있어 표시명 확인 필요.
- CocoaPods 는 반드시 `bundle exec pod install` (= `yarn ios:install`). bundler 기준 1.15.2, `Podfile.lock` 커밋 대상 (6장 이슈 참고). Podfile 메인 타겟명 `healmate`.

### 4-5. 푸시 / 딥링크 / 앱 간 이동

- 푸시: FCM + 앱 아이콘 뱃지. `aps-environment` 가 `development` 로 고정되어 있는 점 주의 (6장 이슈 5).
- iOS URL 스킴: `dheal`, 구글 로그인, 페이스북, 잘로. iOS associated domains 는 `applinks:expert.ddokddok.co` (똑똑 잔재) — hospital.healmate.kr 유니버설 링크는 iOS 미동작.
- **앱 간 이동**: 웹 브릿지 `open-app` 메시지가 유저 앱(`heal://healmate`)을 엽니다 — 유저 앱이 설치돼 있어야 동작하며, `canOpenURL` 의 Promise 를 동기값처럼 쓰는 버그로 폴백 분기가 죽어 있습니다 (6장 이슈 6). 반대로 유저 앱은 `dheal://` 로 이 앱을 엽니다 (상호 점프 구조).

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
| `yarn ios:prodDebug`              | iOS     | prod         | 스킴 `detective` (타겟 healmate)  |
| `yarn ios:devRelease`             | iOS     | dev          | 릴리즈 모드                       |
| `yarn ios:prodRelease`            | iOS     | prod         | 릴리즈 모드                       |

※ 이 앱은 환경 분기가 사실상 없으므로 (4-2), 일상 개발은 `prodDebug` 기준으로 진행해도 무방합니다.

### 배포용 빌드 (Android)

| 명령                      | 산출물                      | 경로                                              |
| ------------------------- | --------------------------- | ------------------------------------------------- |
| `yarn android:build:dev`  | dev APK                     | `android/app/build/outputs/apk/dev/release/`      |
| `yarn android:build:prod` | prod APK                    | `android/app/build/outputs/apk/chplay/release/`   |
| `yarn android:build:aab`  | **Play Store 업로드용 AAB** | `android/app/build/outputs/bundle/chplayRelease/` |

- 세 명령 모두 실행 전 `release.keystore` 존재를 자동 체크합니다.
- iOS 스토어 배포는 Xcode 에서 `detective` 스킴 선택 → Product > Archive → Organizer 업로드 (fastlane 등 자동화 없음). **아카이브 전 번들 ID 확인 필수 (6장 이슈 1).**

### 기타

| 명령        | 설명   |
| ----------- | ------ |
| `yarn lint` | ESLint |
| `yarn test` | Jest   |

### 트러블슈팅

- **Android debug 빌드 시 `JetifyTransform ... Java heap space` 오류** — `android.enableJetifier=true` 상태에서 RN debug AAR 변환에 힙 2GB 로는 부족해 발생. `android/gradle.properties` 의 `org.gradle.jvmargs` 를 `-Xmx4096m -XX:MaxMetaspaceSize=1024m` 로 상향해 해결해 둠. 재발 시 `cd android && ./gradlew --stop` 으로 데몬 재시작 후 다시 빌드하세요.
- 원인 불명의 빌드 실패는 우선 `yarn reset` 후 재시도.

## 6. 알려진 이슈 (이 브랜치 기준, 미수정 상태)

빌드/배포 시 알고 있어야 할 문제들입니다. 코드 수정 시 참고하세요.

1. **iOS 번들 ID 가 똑똑 앱 잔재** — prod `com.ddokddok.expert`, dev `com.ddokddok2.blue.dev`. GoogleService-Info.plist 는 둘 다 `com.healmatedoc.prod` 용이라 불일치. App Store 의 병원용 실제 번들 ID 대조 필수. Info.plist 의 구글 로그인 URL 스킴 프로젝트 번호(317564366281)도 Firebase 프로젝트(980487197898)와 불일치 — 구글 로그인은 이 구성으로 동작 불가.
2. **환경 분기 부재** — dev 도 운영 hospital.healmate.kr 로드 (4-2). 네이티브 AppNativeModule 은 탐정톡 URL 잔재로 미사용.
3. **iOS 유니버설 링크 도메인 불일치** — entitlements 가 `applinks:expert.ddokddok.co` (똑똑 잔재).
4. **dev/prod 동일 applicationId** (`com.healmatedoc.prod`) — 동시 설치 불가.
5. **APNs 환경이 development 로 고정** — entitlements `aps-environment = development` 가 Release 에도 적용. 실배포 푸시 환경 확인 필요 (아카이브 시 Xcode 가 자동 전환하는지 검증할 것).
6. **`open-app` 브릿지 버그** — `Linking.canOpenURL()` 의 Promise 를 if 조건에 그대로 사용해 항상 참 → 유저 앱(`heal://`) 미설치 시 폴백 없이 실패 (`src/screen/WebviewScreen.js`).
7. **탐정톡/똑똑 잔재 식별자 다수** — namespace/packageName `com.oponiti.tamtalk.biz`, iOS 프로젝트명 `detective`, dev 타겟 표시명 잔재 `탐정톡`, dev APK 접두사 `dd-biz`, 미사용 Facebook/Zalo 설정 등.
8. **CocoaPods 버전 불일치** — 기존 `Podfile.lock` 은 1.16.2 생성본, bundler 경유는 1.15.2 (Gemfile 의 `xcodeproj < 1.26` 제약). 최초 `yarn ios:install` 시 재생성은 정상, `Gemfile.lock` 과 함께 커밋 권장.
9. **APK 파일명을 신뢰하지 말 것** — `archivesBaseName` 이 프로젝트 전역 속성이라 **마지막 정의된 dev 플레이버의 이름(`dd-biz-v11...`)이 chplay 산출물에도 적용**됩니다. 실제 값은 `aapt dump badging <apk>` 로 확인 (`${applicationIdSuffix}` null 보간 `...-null` 접미사 포함).
10. **릴리즈 서명 하드코딩** + 디스크의 release.keystore 는 타 브랜치 잔존 파일 — 병원용 서명 키가 맞는지 Play Console SHA-1 대조 필요. `@react-native-firebase/dynamic-links` 는 서비스 종료된 Firebase Dynamic Links 의존성(핸들러 존재)이라 추후 제거 대상.
