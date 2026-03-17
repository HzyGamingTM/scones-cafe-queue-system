import { NextResponse, NextRequest } from "next/server";
import { Queues, QueueEntry } from "@/server/queue";
import { AuthSingleton } from "@/server/auth";

export async function POST(request: NextRequest, { params } : { params: Promise<{ queueId: string }> }) {
    const { queueId }: { queueId: string } = await params;
    const queueNum: number = parseInt(queueId);
    if (isNaN(queueNum) || queueNum < 0 || queueNum >= Queues.queues.length) {
        return NextResponse.json({
            success: false,
            message: "Invalid parameter: queueId"
        }, { status: 404 });
    }

    const authToken: string | undefined = request.cookies.get("auth_token")?.value;
    if (authToken == undefined || await AuthSingleton.isSessionAuthorized(authToken) == false) {
        return NextResponse.json({
            success: false,
            message: "Forbidden"
        }, { status: 403 });
    }

    const data: QueueEntry | undefined = await Queues.enqueue(queueNum);
    if (data == undefined) {
        return NextResponse.json({
            success: false,
            message: "Internal Server Error"
        }, { status: 500 });
    }

    return NextResponse.json({
        success: true,
        data: data
    })
}