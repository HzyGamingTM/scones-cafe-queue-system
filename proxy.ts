import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { adminAuthSingleton } from "@/server/adminAuth";

let proxy_count = 0;

export async function proxy(request: NextRequest) {
    console.log("I am proxy " + proxy_count++ + ", " + request.url);

    // TODO: put in matcher
    if (request.nextUrl.pathname == "/admin") {
        let auth_token = request.cookies.get("auth_token")?.value;
        if (auth_token === undefined || !(await adminAuthSingleton.isSessionAuthorized(auth_token))) {
            const newUrl = request.nextUrl.clone();
            newUrl.pathname = "/login"
            return NextResponse.redirect(newUrl);
        }
    } else if (request.nextUrl.pathname == "/login") {
        let auth_token = request.cookies.get("auth_token")?.value;
        if (auth_token !== undefined && (await adminAuthSingleton.isSessionAuthorized(auth_token))) {
            const newUrl = request.nextUrl.clone();
            newUrl.pathname = "/admin"
            return NextResponse.redirect(newUrl);
        }
    }


    return NextResponse.next();
}

export const config = {
    matcher: '/((?!_next/|_vercel/|favicon.ico).*)'
}
