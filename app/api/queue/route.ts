import { NextResponse, NextRequest } from "next/server";
import { joinQueue, leaveQueue, getQueue } from "@/server/queue/queue";

export async function GET(request: NextRequest) {
    let searchParams = request.nextUrl.searchParams;
    let auth_token = searchParams.get("auth_token");

    let result = await getQueue(auth_token!);

    return NextResponse.json({message: result ?? "what the happen rhymes with max verstappen"}); 
}

export async function POST(request: NextRequest) {
    // For joining

    console.log(request.nextUrl.searchParams);
    let searchParams = request.nextUrl.searchParams;
    let email = searchParams.get("email");
    let phone = searchParams.get("phone");

    let result = await joinQueue(phone, email);

    return NextResponse.json({message: result ?? "Couldn't join queue"});
}

export async function DELETE(request: NextRequest) {
    // For leaving (wtf)

    let searchParams = request.nextUrl.searchParams;
    let auth_token = searchParams.get("auth_token");

    let result = await leaveQueue(auth_token!);

    return NextResponse.json({message: result});
}