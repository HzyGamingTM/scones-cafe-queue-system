import { NextResponse, NextRequest } from "next/server";
import { secretSupabase } from "@/server/secret-supabase";
import { redis } from "@/server/redis";
import { AuthSingleton } from "@/server/auth";
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

    const { data, error } = await secretSupabase.rpc("dequeue", { room: roomNum });
    if (error) {
        if (error.code == "P0002") {
            await redis.set(`queue_${roomNum}_buffer`, 1);
            return NextResponse.json({
                success: true,
                data: null
            });
        }

        return NextResponse.json({
            success: false,
            message: error
        }, { status: 500 });
    }

    return NextResponse.json({
        success: true,
        data: data
    })
}