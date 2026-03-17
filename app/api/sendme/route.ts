import { NextResponse, NextRequest } from "next/server";
import { sendQueueNotification } from "@/server/notifications";

export async function GET(req: NextRequest) {
    const uuid = await req.nextUrl.searchParams.get("uuid");
    if (uuid == undefined) 
        return NextResponse.json({success: false, message: "Missing parameter: uuid"}, {status: 400});

    await sendQueueNotification(uuid);
    return NextResponse.json({success: true});
}