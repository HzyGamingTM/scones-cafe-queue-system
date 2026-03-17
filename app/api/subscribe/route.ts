import { NextRequest, NextResponse } from "next/server";
import { saveSubscription } from "@/server/notifications";

export async function POST(request: NextRequest) {
    const sub: PushSubscriptionJSON = await request.json();
    if (!sub?.endpoint) return NextResponse.json({ error: 'Bad subscription' }, { status: 400 });
        saveSubscription(sub);

    return NextResponse.json({ ok: true }, { status: 200 });
}