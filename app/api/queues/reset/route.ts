import { NextRequest, NextResponse } from "next/server";
import { redirect } from "next/navigation";
import { secretSupabase } from "@/server/secret-supabase";

export async function POST(request: NextRequest) {
    const formData = await request.formData();
    const password = formData.get("password")
    const queue = formData.get("queue");
    console.log(password);
    if (password == "kimjonggoon") {
        let builder = secretSupabase.from("public_queues").delete().lt("queue", 67);
        if (queue != "all") {
            builder = builder.eq("queue", queue);
        }
        await builder;
    }
    return redirect("/admin");
}
