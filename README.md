# rfp-deliverable-matrix

고향사랑e음 클라우드 네이티브 전환 사업 — RFP 요구사항 93건 × 산출물 × 단계 한눈에 보는 표.
`RFP_requirements.csv`(OneDrive의 `cloud_native_transformation` 위키 원본)를 정적 페이지로 옮긴 것.

**빌드 없는 순수 정적 사이트**(HTML/CSS/JS)라 Vercel 배포 시 Framework Preset은 **Other**로 둔다.

## 로컬 실행

```
python -m http.server 8010
```

## 비공개 배포(중요)

공공 사업 RFP 분석 내용이라 **비공개로 운영한다.**

1. GitHub 저장소를 **Private**로 만든다.
2. Vercel 프로젝트 Settings → Environment Variables에 다음 두 값을 추가한다(Production 환경).

   | Key | Value |
   |---|---|
   | `BASIC_AUTH_USER` | 원하는 아이디 |
   | `BASIC_AUTH_PASS` | 원하는 비밀번호 |

3. `middleware.js`가 이 두 값으로 전체 페이지에 기본인증(Basic Auth)을 건다 — 값이 하나라도
   없으면 잠기지 않으니, **배포 전 반드시 두 값 다 설정하고 재배포**한다.
4. 아이디·비번은 이 저장소 어디에도 커밋하지 않는다.

## 홈 화면에 앱처럼 추가하기

`manifest.json` + 아이콘(`icon-192.png`, `icon-512.png`)을 넣어뒀다. 모바일 브라우저에서
"홈 화면에 추가"를 누르면 주소창 없이 앱처럼 열린다(로그인은 Basic Auth 창으로 한 번 더 뜬다).
