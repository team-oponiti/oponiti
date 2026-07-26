# 오퍼니티 React Native 모노레포 — 힐메이트 유저용 (stable/healmate)

하나의 레포지토리에서 **브랜치 분기로 8개의 RN 앱**을 관리합니다.
이 문서는 공통 가이드 + **현재 브랜치의 앱(힐메이트 유저용)** 상세를 담고 있습니다.
다른 앱 브랜치에서는 "앱 상세" 섹션만 해당 앱 내용으로 교체됩니다.

> 인수인계 이력/계정 정보는 [HISTORY.md](./HISTORY.md) 참고.

---

## 1. 레포 구조: 브랜치 = 앱

| 브랜치            | 앱                                | 서비스 도메인           |
| ----------------- | --------------------------------- | ----------------------- |
| `ddokddok`        | 똑똑 - 유저용                     | ddokddok.co (운영 종료) |
| `ddokddok2`       | 똑똑 - 전문가용                   | ddokddok.co (운영 종료) |
| `thamtu`          | 탐정톡 - 탐정용                   | tamtalk.com             |
| `thamtu_user`     | 탐정톡 - 유저용                   | tamtalk.com             |
| **`healmate`**    | **힐메이트 - 유저용 (이 브랜치)** | healmate.kr             |
| `healmate_doctor` | 힐메이트 - 병원용                 | healmate.kr             |
| `hanbang_user`    | 한방메이트 - 유저용               | hanbangmate.com         |
| `hanbang_doctor`  | 한방메이트 - 병원용               | hanbangmate.com         |

- 각 앱 브랜치에는 `stable/<브랜치명>` 형태의 **안정 버전 브랜치**가 존재합니다. 작업/검증은 `stable/*` 기준으로 진행하세요.
- 스토어 릴리즈 시점에는 git tag 를 사용합니다. 규칙: `<브랜치명>-aos-release`, `<브랜치명>-ios-release` (예: `healmate-aos-release`).
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

## 4. 앱 상세: 힐메이트 유저용 (healmate)

### 4-1. 앱 성격

- **healmate.kr 을 감싸는 WebView 셸 앱**입니다 (힐메이트 — 암요양병원 찾기 서비스, 유저 측). 네이티브 코드는 로그인 유지(토큰/쿠키), 푸시+뱃지, 위치 기반 검색용 위치 권한, QR 스캔, 딥링크 진입을 담당합니다.
- 대시보드 **하단 5탭**: Home(`home`) / Search(`search`, 주변 병원 정렬) / Community(`community`) / Info(`info-board`) / Profile(`user-me`) — 각 탭이 WebView.
- Remote Config 심사용 스위치 없음 (`@react-native-firebase/remote-config` 미설치, 탭 구성 하드코딩).
- 로그인: `login?role=user`. 카카오 SDK(Android manifest), 구글/페이스북/잘로 URL 스킴(iOS) 흔적 있음.
- 소스는 전부 `.js` 입니다 (엔트리 `App.js`). QR 스캔 화면(`src/screen/QrcodeScreen.js`) 정상 포함.

### 4-2. 환경(dev/prod) 분기 방식 — 사실상 없음 ⚠️

- 서비스 URL 은 `src/define/webviewUri.js` 에 **`https://healmate.kr` 로 하드코딩**되어 있습니다 (주석 처리된 `7coffee.net` 스테이징 블록 존재).
- 네이티브 env 모듈(`android .../biz/AppNativeModule.kt`, `ios/RNENVConfig.m`)은 **탐정톡 시절 URL 이 방치된 잔재**이며 JS 어디에서도 읽지 않습니다.
- 따라서 **`dev` 플레이버/타겟으로 빌드해도 운영 healmate.kr 을 로드합니다.** dev 빌드의 의미는 버전 코드/산출물 이름 차이뿐입니다.

### 4-3. Android 구성

- gradle 플레이버: `dev` / `chplay` — **이 문서와 스크립트에서 `prod` = `chplay` 플레이버**입니다 (chplay = Google Play 운영 빌드).

| 플레이버        | applicationId       | versionCode / versionName | 용도         |
| --------------- | ------------------- | ------------------------- | ------------ |
| `dev`           | `com.healmate.prod` | 18 / 1.0.0                | (분기 무의미) |
| `chplay` (prod) | `com.healmate.prod` | 17 / 1.0.0                | 운영(스토어) |

- ⚠️ **두 플레이버의 applicationId 가 동일** → 한 기기에 dev/prod 동시 설치 불가, 서로 덮어씀. debug↔release 서명이 다르면 설치 전 `adb uninstall com.healmate.prod` 필요.
- `namespace` 와 `react-native.config.js` 의 packageName 은 **`com.oponiti.tamtalk.biz`** (탐정톡 잔재 — Kotlin 패키지 경로일 뿐 동작에는 문제 없음. 실행 스크립트는 `--appId com.healmate.prod` 로 보정).
- 빌드 변형: `devDebug` / `devRelease` / `chplayDebug` / `chplayRelease`
- 버전 관리: `android/app/build.gradle` 의 각 플레이버 블록에서 versionCode/versionName 관리.
- Firebase: 프로젝트 **`helmate-5b345`** (철자 주의 — hel'''mate). `android/app/src/{dev,chplay}/google-services.json` (클라이언트: `com.healmate.prod`, `com.helmate.prod`, `com.helmatedoc.prod`).
- 딥링크: 앱 링크 `https://healmate.kr`(autoVerify), 커스텀 스킴 `heal://healmate.kr`, `heal://healmate`. 카카오 OAuth 스킴 `kakao0135...://oauth`.

### 4-4. iOS 구성

- 워크스페이스: `ios/detective.xcworkspace` (프로젝트/디렉토리 이름은 탐정톡 시절 `detective` 그대로).

| 타겟                | 스킴        | Bundle ID               | 버전       | 팀         |
| ------------------- | ----------- | ----------------------- | ---------- | ---------- |
| `healmate` (prod)   | `detective` | `com.ddokddok.expert` ⚠️ | 1.0.6 (19) | Z59VCCA327 |
| `dev`               | `dev`       | `com.ddokddok2.blue.dev` ⚠️ | 1.0.3 (17) | WAN6Y987S4 |

- ⚠️ **번들 ID 가 똑똑(ddokddok) 앱의 것**입니다 — App Store 에 등록된 힐메이트 실제 번들 ID 와 일치하는지 반드시 확인 후 아카이브하세요 (6장 이슈 1).
- 프로드 타겟 이름은 `healmate` 지만 **스킴 이름은 `detective`** 입니다 (`yarn ios:prodDebug` 가 `--scheme detective` 를 쓰는 이유). `dev` 공유 스킴 커밋되어 있음.
- 두 앱 타겟의 개발팀이 서로 다릅니다 (Z59VCCA327 / WAN6Y987S4).
- Firebase 설정: `ios/detective/GoogleService-Info.plist` 와 `ios/detective/dev/GoogleService-Info.plist` 모두 `com.healmate.prod` 용 — 타겟 번들 ID 와 불일치 (6장 이슈 1).
- CocoaPods 는 반드시 `bundle exec pod install` (= `yarn ios:install`) 로 실행. bundler 기준 CocoaPods 1.15.2, `Podfile.lock` 커밋 대상 (6장 이슈 참고). Podfile 메인 타겟명은 `healmate`.

### 4-5. 푸시 / 딥링크

- 푸시: FCM (`@react-native-firebase/messaging`) + 앱 아이콘 뱃지 (ShortcutBadger).
- 딥링크 진입: `Linking.getInitialURL` / `url` 이벤트로 처리 (`src/screen/DashboardScreen.js`). Firebase Dynamic Links 코드는 주석 처리됨.
- iOS URL 스킴: `heal`, 구글 로그인, 페이스북(`fb3304...`), 잘로(`zalo-2932...`).
- iOS associated domains 는 `applinks:expert.ddokddok.co` — **healmate.kr 이 아님** (6장 이슈 3). iOS 유니버설 링크는 현재 동작하지 않는 상태로 봐야 합니다.

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

1. **iOS 번들 ID 가 똑똑 앱 잔재** — prod 타겟 `com.ddokddok.expert`, dev 타겟 `com.ddokddok2.blue.dev`. GoogleService-Info.plist 는 둘 다 `com.healmate.prod` 용이라 번들 ID 와 불일치합니다. App Store 의 힐메이트 실제 번들 ID 를 확인하고 아카이브 전 반드시 대조하세요. (똑똑 전문가용 앱을 포크한 흔적으로 추정)
2. **환경 분기 부재** — dev 플레이버/타겟도 운영 healmate.kr 로드 (4-2 참고). 네이티브 AppNativeModule 상수는 탐정톡 URL 잔재로 미사용.
3. **iOS 유니버설 링크 도메인 불일치** — entitlements 가 `applinks:expert.ddokddok.co` (똑똑 잔재). healmate.kr 유니버설 링크는 iOS 에서 미동작.
4. **dev/prod 동일 applicationId** (`com.healmate.prod`) — 동시 설치 불가, 서로 덮어씀.
5. **JS 가 `dheal://healmate` 스킴 호출** — 병원용(닥터) 앱 스킴이 유저 앱 코드에 누출 (`src/screen/WebviewScreen.js`). 이 manifest 에는 미선언.
6. **탐정톡/똑똑 잔재 식별자 다수** — Android namespace/packageName `com.oponiti.tamtalk.biz`, iOS 프로젝트명 `detective`, dev APK 접두사 `dd-biz`, 빌드 설정의 표시명 잔재(똑똑/탐정톡, 실제 표시는 plist 의 힐메이트 적용). 동작에는 무해하나 혼동 주의.
7. **CocoaPods 버전 불일치** — 기존 `Podfile.lock` 은 전역 CocoaPods 1.16.2 생성본, bundler 경유(`yarn ios:install`)는 1.15.2 설치 (Gemfile 의 `xcodeproj < 1.26` 제약). 최초 실행 시 `Podfile.lock` 재생성은 정상이며 커밋해도 무방. `Gemfile.lock` 도 함께 커밋하세요.
8. **릴리즈 서명 정보가 gradle 에 하드코딩** + 현재 디스크의 release.keystore 는 타 브랜치 작업에서 남은 파일 — 힐메이트 서명 키가 맞는지 Play Console SHA-1 대조 필요.
9. **APK 파일명을 신뢰하지 말 것** — `archivesBaseName` 을 플레이버 블록에서 `setProperty` 로 설정하는데 이는 프로젝트 전역 속성이라 **마지막에 정의된 dev 플레이버의 값(`dd-biz-v18...`)이 chplay 산출물에도 적용**됩니다. 즉 chplay APK 도 파일명은 `dd-biz-v18(1.0.0)-...` 로 나오지만 내용물은 chplay(versionCode 17)가 맞습니다. 실제 값은 `aapt dump badging <apk>` 로 확인하세요. `${applicationIdSuffix}` null 보간(`...-null` 접미사)도 동일 맥락의 파일명 문제.
10. **iOS 두 앱 타겟의 개발팀 상이** — prod Z59VCCA327 / dev WAN6Y987S4. dev 빌드 서명 시 해당 팀 인증서 필요.
