import { NextResponse } from "next/server";
import { serialize } from "cookie";
import { API_BASE_URL } from "@/lib/api/client";

export async function POST(request: Request) {
    try {
        const { code } = await request.json();

        if (!code) {
            return NextResponse.json({ error: "No code provided" }, { status: 400 });
        }

        // 1. Call Backend to exchange code for tokens
        /* 
           NOTE: The backend endpoint expects 'code' in query param? 
           Wait, spec says GET /login/oauth2/code/kakao is the callback.
           Usually invalid to call GET with body.
           
           Let's check implementation_plan.md again.
           "카카오 인가 코드를 받아 Java 백엔드로 전달하고..."
           
           Wait, typically:
           Frontend -> NextJS Route -> Java Backend (POST /api/v1/auth/kakao/login/callback?code=...) 
           OR Java Backend expects the redirect?
           
           Looking at OAuth2SuccessHandler (Backend), it handles the redirect from Kakao directly if the redirect_uri is set to Backend.
           However, in modern SPA + API separation:
           1. Frontend redirects to Kakao.
           2. Kakao redirects back to Frontend (/auth/callback/kakao?code=...).
           3. Frontend sends 'code' to Backend.
           
           But OAuth2AuthenticationSuccessHandler in Spring Security usually works when the browser is redirected to the backend.
           
           Let's re-read the requirements 2.1 "GET /login/oauth2/code/kakao".
           This implies the redirect URI should be the backend's address.
           
           If Frontend is handling the callback, then Frontend must pass the code to Backend.
           BUT, standard OAuth2 Client in Spring Boot with `oauth2Login()` expects the redirect to land on Backend.
           
           User requirements said: "[ ] Redirect 처리 페이지... 인가 코드를 백엔드로 전달하고..."
           This means Frontend receives the code.
           
           So the flow is:
           FE -> Kakao -> FE (Callback) -> NextJS API -> Backend ?
           
           If Backend is configured as `oauth2Login()`, it expects 'state' and 'code' and validates state.
           If we are doing "Frontend receives code", then usually Backend exposes a manual endpoint like `POST /api/login/kakao { code }`.
           
           However, the doc says: `GET /login/oauth2/code/kakao` is the callback.
           And `GET /api/v1/auth/kakao/login` redirects to `/oauth2/authorization/kakao`.
           
           If I hit `/api/v1/auth/kakao/login` from browser, it redirects to Kakao. 
           Kakao will redirect to `redirect_uri`.
           If `redirect_uri` is set to `http://localhost:8080/login/oauth2/code/kakao`, then Browser lands on Backend.
           Then Backend SuccessHandler writes JSON to response.
           
           So the browser ends up at `http://localhost:8080/login/oauth2/code/kakao` viewing a JSON?
           That's not good for SPA.
           
           Workaround:
           We need to change the flow OR use the proxy to forward the request.
           
           Plan:
           Frontend (`/auth/callback/kakao`) gets the `code`.
           It calls NextJS API `POST /api/auth/login { code }`.
           NextJS API needs to exchange this.
           
           BUT, does the backend have an endpoint that accepts `code` manually?
           I don't see `POST /api/v1/auth/kakao/callback` in the spec.
           I only see `GET /login/oauth2/code/kakao`.
           
           So, `http://localhost:8080/login/oauth2/code/kakao?code=...` 
           The NextJS API can REQUEST this URL with the code?
           Yes, essentially proxying the callback.
           
        */

        const backendUrl = `${API_BASE_URL}/login/oauth2/code/kakao?code=${code}`;

        // We need to fetch this from Next.js Server side.
        const response = await fetch(backendUrl, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            // Typically 401 or 500
            const text = await response.text();
            console.error("Backend login failed:", response.status, text);
            return NextResponse.json({ error: "Login failed" }, { status: response.status });
        }

        const data = await response.json(); // CommonApiResponse

        if (!data.success) {
            return NextResponse.json({ error: data.error?.message }, { status: 400 });
        }

        const { accessToken, refreshToken, expiresIn } = data.data;

        // 2. Set Refresh Token as HttpOnly Cookie
        const cookie = serialize("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 7 * 24 * 60 * 60, // 7 days (matching backend usually)
            path: "/",
            sameSite: "lax",
        });

        // 3. Return Access Token + User (User info is inside accessToken typically, or we need to fetch user me?)
        // Wait, the Login Response (AuthTokenResponse) only has tokens.
        // We need user info. 
        // Spec says 2.2 Login Callback response example: { accessToken, refreshToken, grantType, expiresIn }
        // It does NOT have User info.
        // So we just return tokens for now, and client will fetch user info separately?
        // Or we decode token?
        // Let's just return accessToken and let client fetch /api/v1/users/me (if exists).
        // Or maybe we fetch it here? 
        // Let's keep it simple: return accessToken. Client can fetch user.

        return NextResponse.json(
            { accessToken },
            {
                status: 200,
                headers: {
                    "Set-Cookie": cookie,
                },
            }
        );

    } catch (error) {
        console.error("Login route error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
