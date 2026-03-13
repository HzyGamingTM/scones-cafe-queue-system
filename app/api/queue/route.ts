import { NextResponse, NextRequest } from "next/server";
import { singletonQueues } from "@/server/queue";
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
    let queueToken = request.cookies.get("queue_token")?.value;

    let errMsg = "Required cookie missing: queue_token";

    if (queueToken) {
        let room = await singletonQueues.getQueueNumberContainingUuid(queueToken);

        if (room !== undefined) {
            let queue = singletonQueues.queues[room];
            let status = await queue.getQueueStatus(queueToken);

            return NextResponse.json({
                success: true,
                message: "Success",
                data: {
                    room: room,
                    queueStatus: status
                }
            });
        }

        errMsg = "Not in queue";
    }

    return NextResponse.json({ success: false, message: errMsg }, { status: 404 });
}

/*
export async function POST(request: NextRequest) {
    const queueToken = request.cookies.get("queue_token")?.value;
    const room = request.nextUrl.searchParams.get("room")

    if (room === null)
        return NextResponse.json({ success: false, message: "Missing required parameter: room" }, { status: 400 });

    let roomNum = parseInt(room);
    if (isNaN(roomNum) || roomNum < 0 || roomNum >= singletonQueues.queues.length)
        return NextResponse.json({ success: false, message: "Invalid room" }, { status: 400 });

    const result = await singletonQueues.enqueue(roomNum, queueToken);
    if (result === undefined)
        return NextResponse.json({ success: false, message: "Unable to queue" }, { status: 403 });

    (await cookies()).set("queue_token", result.uuid);

    return NextResponse.json({
        success: true,
        data: result
    });
}

export async function DELETE(request: NextRequest) {
    const room = request.nextUrl.searchParams.get("room")

    if (room === null)
        return NextResponse.json({ success: false, message: "Missing required parameter: room" }, { status: 400 });

    let roomNum = parseInt(room);
    if (isNaN(roomNum) || roomNum < 0 || roomNum >= singletonQueues.queues.length)
        return NextResponse.json({ success: false, message: "Invalid room" }, { status: 400 });

    const result = await singletonQueues.dequeueFirst(roomNum);
    if (result === undefined)
        return NextResponse.json({ success: false, message: "Unable to dequeue" }, { status: 403 });

    return NextResponse.json({
        success: true,
        data: result
    });
}
*/
