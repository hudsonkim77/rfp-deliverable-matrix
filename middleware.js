// Vercel Edge Middleware — 이 배포 전체를 기본인증(Basic Auth)으로 잠근다.
// 아이디·비번은 Vercel 프로젝트 환경변수(BASIC_AUTH_USER, BASIC_AUTH_PASS)에서만
// 읽는다. 이 파일에는 값을 절대 적지 않는다 — 공공 사업 RFP 분석 표라 비공개 유지.
export const config = {
  matcher: "/:path*",
};

export default function middleware(request) {
  const user = process.env.BASIC_AUTH_USER;
  const pass = process.env.BASIC_AUTH_PASS;

  // 환경변수를 아직 안 정했으면 무조건 막는다(열어두는 쪽이 아니라 잠그는 쪽이
  // 기본값) — 공공 사업 자료라 "설정을 깜빡해서 공개됨"보다 "설정 전엔 접근
  // 자체가 안 됨"이 안전하다.
  if (!user || !pass) {
    return new Response("BASIC_AUTH_USER / BASIC_AUTH_PASS 환경변수가 설정되지 않았습니다.", {
      status: 503,
    });
  }

  const auth = request.headers.get("authorization");
  if (auth) {
    const [scheme, encoded] = auth.split(" ");
    if (scheme === "Basic" && encoded) {
      const [u, p] = atob(encoded).split(":");
      if (u === user && p === pass) return;
    }
  }

  return new Response("인증이 필요합니다.", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="RFP Matrix"' },
  });
}
