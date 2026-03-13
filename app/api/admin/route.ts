import { NextResponse, NextRequest } from "next/server";
import { redirect, RedirectType } from 'next/navigation'
import { cookies } from 'next/headers';
import { adminAuthSingleton } from "@/server/adminAuth";
import { singletonQueues } from "@/server/queue";
import crypto from "node:crypto";

export async function GET(request: NextRequest) {
    const authToken: string | undefined = (await cookies()).get("authToken")?.value;
    
    if (authToken === undefined || await adminAuthSingleton.isSessionAuthorized(authToken) == false)
        return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });

    const params = request.nextUrl.searchParams;
    const method = params.get("method");
}

export async function POST(request: NextRequest) {
    const authToken: string | undefined = (await cookies()).get("authToken")?.value;
    
    if (authToken === undefined || await adminAuthSingleton.isSessionAuthorized(authToken) == false)
        return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });

    const params = request.nextUrl.searchParams;
    const method = params.get("method");

    switch (method) {
        case "dequeue": {
            const room = params.get("room");

            if (room === null)
                return NextResponse.json({
                    success: false,
                    message: "Missing required parameter: room" 
                }, { status: 400 });

            const roomNum = parseInt(room);
            if (roomNum === null)
                return NextResponse.json({
                    success: false,
                    message: "Invalid room" 
                }, { status: 400 });

            const result = await singletonQueues.dequeueFirst(roomNum);
            if (result === undefined) {
                return NextResponse.json({
                    success: false,
                    message: "Unsuccessful"
                }, { status: 500 });
            }

            return NextResponse.json({
                success: true,
                data: result
            });
        }

        case "enqueue": {
            const room = params.get("room");

            if (room === null) {
                return NextResponse.json({
                    success: false,
                    message: "Missing required parameter: room" 
                }, { status: 400 });
            }

            const roomNum = parseInt(room);
            if (roomNum === null) {
                return NextResponse.json({
                    success: false,
                    message: "Invalid room" 
                }, { status: 400 });
            }

            const result = await singletonQueues.enqueue(roomNum);
            if (result === undefined) {
                return NextResponse.json({
                    success: false,
                    message: "Unsuccessful"
                }, { status: 500 });
            }

            return NextResponse.json({
                success: true,
                data: result
            });
        }
    }
}
