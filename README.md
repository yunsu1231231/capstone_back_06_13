# Capstone Project - Dongguk University



## 🪐 프로젝트 제목 : 운동 어플리케이션 




## 🤷 팀원

  * 홍지수
  * 조윤수
  * 김태영
  * 안수연


## 🐾 개발 포지션

| 개발내용        | 내용                            | 개발팀원 |
|-------------|-------------------------------|-----|
| JavaScript,Node.js,MySQL   | 백엔드, 데이터베이스         | 조윤수 |
| MySQL, MediaPipe   | 모션인식, 데이터베이스         | 김태영 |
| Figma, MediaPipe   | 모션인식, UI/UX 디자인         | 홍지수 |
| Figma, ReactNative, JavaScript   |  프론트엔드, 디자인         | 안수연 |


## 🎯 목적 

 > 모션인식을 통해 올바른 자세로 운동하고 동기부여 기능을 제공하는 웹앱 
 > Using JavaScript/Node.js/ReactNative/MySQL/MediaPipe



## 📚 기능

### 회원 인증
- JWT 인증을 활용한 회원가입 및 로그인
- 트레이너 전용 기능 제공

### 게시글 관리
#### Create
- 운동 기록 게시글 작성
- 댓글 작성

#### Read
- 전체 게시글 불러오기
- 프로필에서 자신이 쓴 글 보기
- 가입자 목록 보기
- 날짜별 운동 기록 검색

#### Update
- 게시글 수정
- 댓글 수정
- 프로필 수정

#### Delete
- 게시글 삭제
- 댓글 삭제

### 운동 기록 관리
- 날짜별 운동 기록 관리
- 좋아요 추가 및 삭제 기능

### 실시간 대화
- WebSocket을 활용한 비동기 대화 시스템
  - 게시글 작성자와 실시간 DM 가능
  - 메시지 답장 및 삭제 기능

### 운동 동작 분석
- MediaPipe를 활용한 동작 분석 시스템
  - 운동 동작 인식 및 초기 위치 설정
  - 동작 평가 및 피드백 제공


## 실행 방식

### 백엔드 실행
- **폴더명:** `capstone_final_back`
- **명령어:** `npm run dev`
- **포트:** `3000`

### 프론트엔드 실행
- **폴더명:** `capstone_final_front`
- **명령어:** `npx expo start`
- **웹 실행 주소:** `http://localhost:8081`
- **앱 실행 주소:** `exp://192.168.35.45:8081`

---

## 웹앱 서비스 제공

### 웹
- 별도의 권한 설정 없이 **사진 및 모션 인식** 사용 가능.
- **접속 주소:** [http://localhost:8081](http://localhost:8081)

### 앱
- **사진 및 모션 인식** 사용 시 권한 설정 필요.
- **준비 사항:**
  - Expo Go 앱 설치.
  - QR 코드 연동 필수.

---

## 모션 인식 서비스

- **접속 주소:** [https://jisuuuuu.github.io/mediapipe_js/](https://jisuuuuu.github.io/mediapipe_js/)
- 로그인 후 **자세 측정** 버튼을 누르면 웹앱에서 모션 인식 서비스 사용 가능.





