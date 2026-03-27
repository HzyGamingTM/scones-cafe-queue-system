import { NextResponse, NextRequest } from "next/server";
import { secretSupabase } from "@/server/secret-supabase";
import { AuthSingleton } from "@/server/auth";
import { redis } from "@/server/redis";
import { rooms } from "@/server/rooms.json"

export async function POST(request: NextRequest, { params } : { params: Promise<{ room: string }> }) {
    const { room }: { room: string } = await params;
    const roomNum: number = parseInt(room);
    if (isNaN(roomNum) || roomNum < 0 || roomNum >= rooms.length) {
        return NextResponse.json({
            success: false,
            message: "Invalid parameter: room"
        }, { status: 404 });
    }

    const authToken: string | undefined = request.cookies.get("auth_token")?.value;
    if (authToken == undefined || await AuthSingleton.isSessionAuthorized(authToken) == false) {
        return NextResponse.json({
            success: false,
            message: "Forbidden"
        }, { status: 403 });
    }

    const { data, error } = await secretSupabase.rpc("enqueue", { room: roomNum });
    if (error) {
        return NextResponse.json({
            success: false,
            message: error
        }, { status: 500 });
    }

    if (await redis.get(`queue_${roomNum}_buffer`) == 1) {
        const { data: newData, error: newError } = await secretSupabase.rpc("dequeue", { room: roomNum });
        await redis.set(`queue_${roomNum}_buffer`, 0);
        if (newError) {
            return NextResponse.json({
                success: false,
                message: newError
            }, { status: 500 });
        }

        return NextResponse.json({
            success: true, 
            data: newData
        });
    }

    return NextResponse.json({
        success: true,
        data: data
    })
}