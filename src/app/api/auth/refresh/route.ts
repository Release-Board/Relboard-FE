import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { serialize } from "cookie";
import { API_BASE_URL } from "@/lib/api/client";

export async function POST(request: Request) {
    try {
        const cookieStore = await cookies();
        const refreshToken = cookieStore.get("refreshToken")?.value;

        if (!refreshToken) {
            return NextResponse.json({ error: "No refresh token" }, { status: 401 });
        }

        // Call Backend Refresh API
        const response = await fetch(`${API_BASE_URL}/api/v1/auth/refresh`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${refreshToken}`
            },
        });

        if (!response.ok) {
            // If refresh failed (token expired), clear cookie
            const clearCookie = serialize("refreshToken", "", {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                maxAge: -1,
                path: "/",
            });

            return NextResponse.json(
                { error: "Refresh failed" },
                {
                    status: 401,
                    headers: { "Set-Cookie": clearCookie }
                }
            );
        }

        const data = await response.json();

        if (!data.success) {
            return NextResponse.json({ error: data.error?.message }, { status: 401 });
        }

        const newTokens = data.data;

        // Update Cookie with new refresh token
        const newCookie = serialize("refreshToken", newTokens.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 7 * 24 * 60 * 60,
            path: "/",
            sameSite: "lax",
        });

        return NextResponse.json(
            { accessToken: newTokens.accessToken },
            {
                status: 200,
                headers: {
                    "Set-Cookie": newCookie,
                },
            }
        );

    } catch (error) {
        console.error("Refresh route error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
