import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

let proxy_count = 0;

export function proxy(request: NextRequest) {
    console.log("I am proxy " + proxy_count++ + ", " + request.url);
    return NextResponse.next();
}

export const config = {
    matcher: '/((?!_next/|_vercel/|favicon.ico).*)'
}