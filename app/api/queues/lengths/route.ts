import { NextResponse, NextRequest } from "next/server";
import { Queues } from "@/server/queue";

export async function GET(request: NextRequest, { params }: { params: Promise<{[key: string]: string}> }): Promise<NextResponse> {
    return NextResponse.json({
        success: true,
        data: await Promise.all(Queues.queues.map(q => q.length()))
    });
}