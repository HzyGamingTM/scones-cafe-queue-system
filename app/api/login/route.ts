import { NextResponse, NextRequest } from "next/server";
import { redirect, RedirectType } from 'next/navigation'
import { cookies } from 'next/headers';
import { adminAuthSingleton } from "@/server/adminAuth";

import crypto from 'node:crypto';

export async function POST(request: NextRequest) {
    const formData = await request.formData();
    const username = formData.get('username')?.toString();  
    const password = formData.get('password')?.toString();  

    if (username === undefined || password === undefined)
        return NextResponse.json({ success: false, messsage: "Bad Request" }, { status: 400 })

    const authToken = await adminAuthSingleton.tryLogin(username, password);
    if (authToken !== undefined) {
        const twodays = 2 * 86400 * 1000;
        (await cookies()).set("auth_token", authToken, {
            expires: new Date(Date.now() + twodays),
            secure: true,
            httpOnly: true
        });
        redirect("/admin", RedirectType.replace);
    } else {
        redirect("/login", RedirectType.replace);
        // return NextResponse.json({ message: 'Invalid Credentials' }, { status: 403 });
    }
}
