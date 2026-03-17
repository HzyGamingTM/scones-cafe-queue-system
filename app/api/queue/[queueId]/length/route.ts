import { NextResponse, NextRequest } from "next/server";
import { Queues } from "@/server/queue";

export async function GET(request: NextRequest, { params } : { params: Promise<{ queueId: string }> }) {
    const { queueId }: { queueId: string } = await params;
    const queueNum: number = parseInt(queueId);
    if (isNaN(queueNum) || queueNum < 0 || queueNum >= Queues.queues.length) {
        return NextResponse.json({
            success: false,
            message: "Invalid parameter: queueId"
        }, { status: 404 });
    }

    const data: number = await Queues.queues[queueNum].length();
    return NextResponse.json({
        success: true,
        data: data
    })
}