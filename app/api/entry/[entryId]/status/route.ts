import { NextResponse, NextRequest } from "next/server";
import { Queues, QueueStatus } from "@/server/queue";

export async function GET(request: NextRequest, { params } : { params: Promise<{ entryId: string }> }) {
    const { entryId } = await params;

    const entryInfo = await Queues.getEntryInfo(entryId);

    if (entryInfo.status !== QueueStatus.NOT_IN_QUEUE) {
        return NextResponse.json({
            success: true,
            message: "Success",
            data: {
                room: entryInfo.queueNum,
                status: entryInfo.status,
                peopleAhead: entryInfo.people_ahead
            }
        });
    }

    return NextResponse.json({ success: true, data: { queueStatus: entryInfo.status } }, { status: 404 });
}