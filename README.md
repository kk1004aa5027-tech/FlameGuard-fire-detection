# YOLO 알고리즘을 이용한 화재 감지 시스템

YOLO 기반 실시간 **화재 및 연기 감지 시스템**입니다.  
카메라 영상을 분석하여 불꽃과 연기를 탐지하고 웹 인터페이스에서 확인할 수 있는 AI 시스템입니다.

---

# 프로젝트 소개

FlameGuard는 **컴퓨터 비전 기반 화재 감지 시스템**으로  
YOLO 객체 탐지 모델을 활용하여 **실시간으로 화재 및 연기를 감지**합니다.

감지된 결과는 **FastAPI 서버를 통해 처리되고**,  
**Next.js 웹 인터페이스에서 확인할 수 있습니다.**

---

# 참고자료

## YOLO
- [YOLO Official Website](https://www.ultralytics.com/)
- [YOLO 11 Documentation](https://docs.ultralytics.com/models/yolo11/)

## Roboflow
- [Roboflow Website](https://roboflow.com/)
- [Roboflow Universe](https://universe.roboflow.com/)

---

## YOLO 학습 방법

1. Roboflow Universe에서 학습용 데이터셋을 찾는다.  
2. 학습에 사용할 데이터셋을 다운로드한다.  
3. 다운로드한 데이터셋으로 모델을 학습한다.  
4. 학습이 끝나면 생성된 `best.pt` 파일을 복사한다.  
5. 복사한 `best.pt` 파일을 프로젝트에 추가한다.  
6. 프로젝트에 추가한 `best.pt` 모델을 사용한다.  
7. `best.pt` 파일을 이용해 테스트를 진행한다.  

---

## API 구조

```
app/
├── main.py
├── api/
│ ├── create_user/ # 사용자 생성 API (POST /users)
│ │ ├── router.py # API 라우터
│ │ ├── schema.py # Pydantic 요청/응답 스키마
│ │ ├── crud.py # 데이터베이스 관련 로직
│
│ ├── update_user/ # 사용자 수정 API (PUT /users/{id})
│ │ ├── router.py
│ │ ├── schema.py
│ │ ├── crud.py
│
│ ├── get_users/ # 사용자 조회 API (GET /users)
│ │ ├── router.py
│ │ ├── schema.py
│ │ ├── crud.py
│
│ ├── delete_user/ # 사용자 삭제 API (DELETE /users/{id})
│ │ ├── router.py
│ │ ├── schema.py
│ │ ├── crud.py
│
│ ├── share_crud.py # 공통 데이터베이스 로직
│ ├── share_schema.py # 공통 Pydantic 스키마
```

---

```
Camera Image
↓
YOLO Model (AI)
↓
FastAPI Backend
↓
Next.js Frontend
↓
User Interface
```

---

# Backend

Backend는 **FastAPI 기반 서버**로 구성되어 있으며  
사용자 관리, 화재 감지 데이터 처리, 알림 제공 등의 기능을 담당합니다.

Frontend와 **REST API 방식**으로 통신하여 데이터를 주고받습니다.

---

```
## Backend 구조
app/
├── main.py                # FastAPI 앱 진입점
├── api/                   # REST API 엔드포인트 모음
│   ├── create_user/       # 사용자 생성 API (POST /users)
│   │   ├── router.py      # API 라우터
│   │   ├── schema.py      # 요청/응답 Pydantic 스키마
│   │   ├── crud.py        # DB 관련 로직
│   │
│   ├── update_user/       # 사용자 수정 API (PUT /users/{id})
│   │   ├── router.py
│   │   ├── schema.py
│   │   ├── crud.py
│   │
│   ├── get_users/         # 사용자 조회 API (GET /users)
│   │   ├── router.py
│   │   ├── schema.py
│   │   ├── crud.py
│   │
│   ├── delete_user/       # 사용자 삭제 API (DELETE /users/{id})
│   │   ├── router.py
│   │   ├── schema.py
│   │   ├── crud.py
│
│   ├── alarm/             # 화재 알림 관련 API
│   │   ├── router.py
│   │   ├── schema.py
│   │   ├── crud.py
│
│   ├── status/            # 화재 상태 관리 API
│   │   ├── router.py
│   │   ├── schema.py
│   │   ├── crud.py
│
│   ├── share_crud.py      # 공통 DB 로직
│   ├── share_schema.py    # 공통 Pydantic 스키마
│
├── models/                # DB 모델 정의 (SQLAlchemy 등)
├── core/                  # 환경 설정, 인증, 유틸 함수 등
└── tests/                 # 테스트 코드
```

---

# Frontend

Frontend는 **Next.js 기반의 웹 인터페이스**로 구성되어 있으며  
화재 감지 결과와 알림 정보를 사용자에게 시각적으로 제공합니다.

React와 TypeScript를 사용하여 UI를 구성하고,  
사용자는 자유롭게 게시글을 작성할 수 있습니다.

관리자는 **상태 수정 및 게시글 삭제와 같은 관리 기능**을 수행할 수 있습니다.

FastAPI 백엔드 서버와 **REST API 통신(GET / POST)**을 통해 데이터를 가져옵니다.

---

## Frontend 구조

```
app
├ alarm
├ board
├ detectionLogs
├ login
├ mainboard
├ signup
├ status
├ write
```

---

## 주요 기능

- 화재 및 연기 감지 알림 제공  
- 감지 이미지 확인  
- 화재 감지 기록 조회  
- 관리자 상태 수정 기능  
- 게시판 기능  
- 게시글 작성 기능  
- 로그인 / 회원가입 기능  
- 대시보드 제공  

---

### 사용된 기술

```
## Frontend
- Next.js
- React
- TypeScript
- CSS
- Fetch API
```

## Backend

```
- Python
- FastAPI
- Uvicorn
- Pydantic
```

## AI
- YOLO
- Roboflow Dataset

---

## 시스템 아키텍처

```
Next.js (Frontend)
│
│ REST API
▼
FastAPI (Backend)
│
▼
YOLO Model (AI)
```

---
## 실행 방법

# Frontend

```
cd frontend
pnpm install
pnpm run dev
```

# Backend

```
cd backend/app
uvicorn main:app --reload
```
