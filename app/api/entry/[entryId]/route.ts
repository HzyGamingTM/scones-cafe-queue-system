import { NextResponse, NextRequest } from "next/server";
import { clientSupabase } from "@/server/client-supabase";

export async function GET(request: NextRequest, { params } : { params: Promise<{ entryId: string }> }) {
    const { entryId } = await params;

    const { data, error } = await clientSupabase.from("public_queues").select().eq("id", entryId).limit(1);

    if (error) {
        return NextResponse.json({
            success: false,
            message: error
        }, { status: 500 });
    }
    
    if (data.length) {
        let peopleAhead = await clientSupabase.from("public_queues")
            .select("*", { count: "exact", head: true })
            .eq("queue", data[0].queue)
            .eq("served", false)
            .lt("created_at", data[0].created_at);

        return NextResponse.json({
            success: true,
            message: "Success",
            data: {
                room: data[0].queue,
                served: data[0].served,
                id_in_queue: data[0].id_in_queue,
                peopleAhead: peopleAhead.count
            }
        });
    } else {
        return NextResponse.json({
            success: false,
            message: "No queue entry found from id" 
        }, { status: 404 });
    }
}
