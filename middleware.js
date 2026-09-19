// Vercel Edge Middleware — 로그인 1회 + 쿠키(14일)로 접근을 막는다.
// 매번 기본인증 팝업이 뜨던 방식(특히 iOS 홈화면 추가 시 자주 재요구됨)을
// 로그인 폼 + 서명된 쿠키 방식으로 바꿨다.
//
// 환경변수(Vercel Settings → Environment Variables, 절대 이 파일엔 값을 적지 않는다):
//   BASIC_AUTH_USER, BASIC_AUTH_PASS — 로그인 아이디·비번
//   AUTH_SECRET                       — 쿠키 서명용 임의의 긴 문자열(직접 하나 만들어 넣는다)
export const config = {
  matcher: "/:path*",
};

const COOKIE_NAME = "rfp_session";
const MAX_AGE_MS = 14 * 24 * 60 * 60 * 1000; // 14일

async function sign(data, secret) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(data));
  return btoa(String.fromCharCode(...new Uint8Array(sig)));
}

function timingSafeEqual(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function getCookie(request, name) {
  const raw = request.headers.get("cookie") || "";
  const match = raw.split(";").map((s) => s.trim()).find((s) => s.startsWith(name + "="));
  return match ? match.slice(name.length + 1) : null;
}

async function validSession(request, secret) {
  const raw = getCookie(request, COOKIE_NAME);
  if (!raw) return false;
  const [expiryStr, sig] = raw.split(".");
  if (!expiryStr || !sig) return false;
  const expiry = Number(expiryStr);
  if (!expiry || Date.now() > expiry) return false;
  const expected = await sign(expiryStr, secret);
  return timingSafeEqual(sig, expected);
}

export default async function middleware(request) {
  const user = process.env.BASIC_AUTH_USER;
  const pass = process.env.BASIC_AUTH_PASS;
  const secret = process.env.AUTH_SECRET;
  const url = new URL(request.url);

  // 환경변수를 아직 안 정했으면 무조건 막는다(열어두는 쪽이 아니라 잠그는 쪽이 기본값).
  if (!user || !pass || !secret) {
    return new Response(
      "BASIC_AUTH_USER / BASIC_AUTH_PASS / AUTH_SECRET 환경변수가 설정되지 않았습니다.",
      { status: 503 }
    );
  }

  // 로그인 처리(POST)
  if (url.pathname === "/login" && request.method === "POST") {
    const form = await request.formData();
    const u = String(form.get("username") || "");
    const p = String(form.get("password") || "");
    if (timingSafeEqual(u, user) && timingSafeEqual(p, pass)) {
      const expiry = Date.now() + MAX_AGE_MS;
      const sig = await sign(String(expiry), secret);
      const res = Response.redirect(new URL("/", request.url), 303);
      res.headers.append(
        "Set-Cookie",
        `${COOKIE_NAME}=${expiry}.${sig}; Path=/; Max-Age=${MAX_AGE_MS / 1000}; HttpOnly; Secure; SameSite=Lax`
      );
      return res;
    }
    return Response.redirect(new URL("/login.html?error=1", request.url), 303);
  }

  // 로그인 화면 자체는 인증 없이 보여준다
  if (url.pathname === "/login.html") return; // 정적 파일을 그대로 서빙
  if (url.pathname === "/login") return Response.redirect(new URL("/login.html", request.url), 302);

  // 그 외 모든 경로는 세션 쿠키를 확인한다
  if (await validSession(request, secret)) return;

  return Response.redirect(new URL("/login.html", request.url), 302);
}
