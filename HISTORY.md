# 오퍼니티 React Native History

# 인수인계 문서

[~~https://docs.google.com/spreadsheets/d/1x6SSW1NHvsqgKQUDEs3VRlSXRPe_3_L4d8N9FzERBCk/edit?usp=sharing~~](https://docs.google.com/spreadsheets/d/1x6SSW1NHvsqgKQUDEs3VRlSXRPe_3_L4d8N9FzERBCk/edit?usp=sharing) ⇒ 구버젼

[https://docs.google.com/spreadsheets/d/1nfGbH_n69j8l9QBggtAn3-Nzxuaoy6jDWrKhLbiZng8/edit?usp=drive_link](https://docs.google.com/spreadsheets/d/1nfGbH_n69j8l9QBggtAn3-Nzxuaoy6jDWrKhLbiZng8/edit?usp=drive_link) ⇒ 신버젼

# 도메인 현황

| 서비스 | 도메인 | 레포지토리 | 상태 |
| --- | --- | --- | --- |
| 탐정톡 | [tamtalk.com](http://tamtalk.com/) | [https://github.com/team-oponiti/tamtalk](https://github.com/team-oponiti/tamtalk) | 운영 중 |
| 힐메이트 | [healmate.kr](http://healmate.kr/) | [https://github.com/team-oponiti/heal-mate](https://github.com/team-oponiti/heal-mate) | 운영 중 |
| 한방메이트 | [hanbangmate.com](http://hanbangmate.com/) | [https://github.com/team-oponiti/heal-mate/tree/hanbang/develop](https://github.com/team-oponiti/heal-mate/tree/hanbang/develop) | 운영 중 |
| 똑똑 (드롭) | [ddokddok.co](http://ddokddok.co/) | - | 운영 종료 |

### **특이사항**

- 똑똑 ⇒ ~~드롭 프로젝트지만 웹/앱 모두 실 서비스 중~~ ⇒ 서버까지 내려감

# GitHub

### 계정

- ID : [teamoponiti@gmail.com](mailto:teamoponiti@gmail.com)
- PW : -

### 특이사항

- 모든 코드는 깃허브로 관리 중
- [team-oponiti](https://github.com/team-oponiti) 계정은 개인 계정
- 힐메이트/한방메이트 ⇒ 같은 레포지토리, 브랜치만 다름
- RN 은 하나의 레포에서 브랜치 분기해 사용 중

# Firebase

### Firebase 계정(구글 연동)

- ID: [teamoponiti@gmail.com](mailto:teamoponiti@gmail.com)
- PW: -
- MFA: 대표님 휴대폰

### 특이사항

- ~~탐정톡 채팅 관련 계정만 프로젝트 소유자 권한 있음~~
- ~~탐정톡/힐메이트/한방메이트/톡톡 푸시 관련 프로젝트 소유자 권한 필요~~ * 모든 프로젝트 권한 획득 완료
- ~~개발자 계정 추가 필요~~ * 계정 추가 완료

# 진행사항

### 1. 소스 코드 분석 현황 `완료`

| 프로젝트 | 소스 코드 작동 여부 | 배포 가능 여부 | 비고 |
| --- | --- | --- | --- |
| 한방/힐메이트 | 가능 ✅ | 주의 ⚠️ | 수동 배포로 확인되나 정확한 메뉴얼 부재. 설치·실행·배포 가이드라인 문서 요청 예정 |
| 탐톡 | 불가 ❌ | 불가 ❌ | WordPress 관련 코어 파일 및 Firebase 설정 파일 누락. 실제 파일 압축본 및 가이드라인 요청 예정 |
| 똑똑 | 가능 ✅ | 주의 ⚠️ | GitHub Actions 배포로 확인되나 정확한 메뉴얼 부재. 설치·실행·배포 가이드라인 문서 요청 예정 |
- 누락된 파일 및 실제 프로젝트 파일 압축본을 요청할 예정
- 설치·실행·배포 가이드라인(`README.md`) 양식을 전달하여 작성 요청할 예정
- 위와 같은 이유로 블루드래곤 개발팀과 직접 소통 예정

---

### 2. 소스 코드 관련 추가 요청 `완료`

- 각 프로젝트 설치·실행·배포 가이드라인 문서(`README.md`) **`전달 완료`**
    - 이미 각 레포지토리에 `readme` 브랜치를 작성하고 템플릿 제공
    - 기술 스택, 설치 과정, 로컬 실행, 배포 과정 4가지를 자세히 기재 요청
- 작업자 PC에 있는 실제 프로젝트 파일 압축본(`.zip`) **`전달 완료`**
    - 프로젝트 환경 변수 및 기타 누락 가능성 확인을 위해 요청
    - 구글 드라이브 각 레포지토리별 폴더 구성 완료
    - 업로드 전 `readme.txt` 확인 필요

### 2-1. 소스 코드 관련 추가 요청 피드백 `완료`

- 각 프로젝트별 `README.md` 파일 업데이트 확인 완료
    - 각 레포지토리 `readme` 브랜치의 `README.md` 파일 참고
- 작업자 로컬 프로젝트 압축 파일 구글 드라이브 업로드 확인 완료
    - [https://drive.google.com/drive/folders/1Z2ah5AuQsRSzIJoBtP1WgD1yLoiL5o3m?usp=sharing](https://drive.google.com/drive/folders/1Z2ah5AuQsRSzIJoBtP1WgD1yLoiL5o3m?usp=sharing)

---

### 3. React Native 코드 빌드 테스트 현황 `완료`

최근 React Native 버전이 `0.75.3`에서 `0.77.3`으로 업그레이드되었으며, 최신 커밋 기준 빌드 테스트 결과는 다음과 같음.

| 프로젝트(브랜치) | RN 0.75.3 | RN 0.77.3 (IOS) | RN 0.77.3 (AOS) |
| --- | --- | --- | --- |
| ddokddok(똑똑-유저) | 정상 ✅ | 오류 ❌ | - |
| ddokddok2(똑똑-전문가) | 정상 ✅ | 오류 ❌ | - |
| thamtu(탐정톡-탐정) | 정상 ✅ | 오류 ❌ | - |
| thamtu_user(탐정톡-유저) | 정상 ✅ | 오류 ❌ | - |
| healmate(힐메이트-유저) | 정상 ✅ | 오류 ❌ | - |
| healmate_doctor(힐메이트-병원) | 정상 ✅ | 오류 ❌ | - |
| hanbang_user(한방-유저) | - | 정상 ✅ | - |
| hanbang_doctor(한방-병원) | - | 정상 ✅ | - |

~~공통 오류 메시지 (런타임 오류, RN 업그레이드 원인 추정):~~ * 수정 사항 확인 완료

```
Error: Failed to call into JavaScript module method RCTEventEmitter.receiveEvent(). Module has not been registered as callable. Registered callable JavaScript modules (n = 9): AppRegistry, HMRClient, GlobalPerformanceLogger, RCTNativeAppEventEmitter, SamplingProfiler, RCTDeviceEventEmitter, RCTLog, HeapCapture, Systrace. Did you forget to call `registerCallableModule`?
```

---

### 4. React Native 코드 관련 추가 요청 `완료`

- RN 엔지니어가 아직 수정 작업 중인지 여부 확인
    - 모두 작업 완료되었습니다. @Lynette Phuong
- RN 버전을 올린 사유 확인
    - Google Play에서 사용하는 NDK 라이브러리의 페이지 크기 이슈 때문입니다. @Lynette Phuong
- 현재 Git에 올라간 커밋이 최신 작업 반영 상태인지 확인
    - 반영되었습니다. @Lynette Phuong
- 스토어 릴리즈 버전 기준 git tag 추가 요청
    - Play Store 릴리즈 커밋 예시: `thamtu_user-aos-release`
    - App Store 릴리즈 커밋 예시: `thamtu_user-ios-release`
    - 추가하였습니다. @Lynette Phuong

### 4-1. React Native 코드 관련 추가 요청 피드백 `완료`

- RN 추가 작업 사항 커밋 및 푸시 내역 확인 (RN 업그레이드 대응 추정)
    - RN 추가 사항 반영 완료 확인
- RN 추가 작업 사항 테스트 빌드 결과
    - 모든 프로젝트 정상 작동 확인

| 프로젝트(브랜치) | RN 0.77.3 (IOS) | RN 0.77.3 (AOS) |
| --- | --- | --- |
| ddokddok(똑똑-유저) | 정상 ✅ | 정상 ✅ |
| ddokddok2(똑똑-전문가) | 정상 ✅ | 정상 ✅ |
| thamtu(탐정톡-탐정) | 정상 ✅ | 정상 ✅ |
| thamtu_user(탐정톡-유저) | 정상 ✅ | 정상 ✅ |
| healmate(힐메이트-유저) | 정상 ✅ | 정상 ✅ |
| healmate_doctor(힐메이트-병원) | 정상 ✅ | 정상 ✅ |
| hanbang_user(한방-유저) | 정상 ✅ | 정상 ✅ |
| hanbang_doctor(한방-병원) | 정상 ✅ | 정상 ✅ |
