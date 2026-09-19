# rfp-deliverable-matrix

고향사랑e음 클라우드 네이티브 전환 사업 — RFP 요구사항 93건 × 산출물 × 단계 한눈에 보는 표.
`RFP_requirements.csv`(OneDrive의 `cloud_native_transformation` 위키 원본)를 정적 페이지로 옮긴 것.

**빌드 없는 순수 정적 사이트**(HTML/CSS/JS)라 Vercel 배포 시 Framework Preset은 **Other**로 둔다.

## 로컬 실행

```
python -m http.server 8010
```

## 비공개 배포(중요)

공공 사업 RFP 분석 내용이라 **비공개로 운영한다.** 로그인 화면(`login.html`) + 서명된 쿠키(14일)
방식이다 — 기본인증(브라우저 팝업) 대신 이걸 쓴 이유는, 폰 홈 화면에 앱처럼 추가했을 때 iOS
standalone 모드에서 기본인증 팝업이 자꾸 다시 뜨는 문제가 있었기 때문이다. 쿠키 방식은 한 번
로그인하면 14일간 다시 안 물어본다.

1. GitHub 저장소를 **Private**로 만든다.
2. Vercel 프로젝트 Settings → Environment Variables에 다음 세 값을 추가한다(Production 환경).

   | Key | Value |
   |---|---|
   | `BASIC_AUTH_USER` | 원하는 아이디 |
   | `BASIC_AUTH_PASS` | 원하는 비밀번호 |
   | `AUTH_SECRET` | 쿠키 서명용 임의의 긴 문자열(아무 값이나 길게, 예: `openssl rand -hex 32` 결과) |

3. `middleware.js`가 이 세 값으로 로그인·세션을 처리한다 — 셋 중 하나라도 없으면 전체를
   차단한다(fail-closed). **배포 전 반드시 세 값 다 설정하고 재배포**한다.
4. 아이디·비번·시크릿은 이 저장소 어디에도 커밋하지 않는다.
5. `AUTH_SECRET`을 바꾸면 기존에 로그인해둔 사람들의 세션도 전부 무효화된다(로그아웃 용도로도 씀).

## 홈 화면에 앱처럼 추가하기

`manifest.json` + 아이콘(`icon-192.png`, `icon-512.png`)을 넣어뒀다. 모바일 브라우저에서
"홈 화면에 추가"를 누르면 주소창 없이 앱처럼 열린다. 로그인은 처음 한 번만 하면 되고,
이후 14일간은 쿠키로 자동 통과된다.
