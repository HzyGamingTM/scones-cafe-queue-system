import { NextResponse, NextRequest } from "next/server";
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation';
import { adminAuthSingleton } from "@/server/adminAuth";

export async function GET(request: NextRequest) {
	const searchParams = request.nextUrl.searchParams;
	const nextPage = searchParams.get("next");

	const cookieStore = await cookies()
	const authToken = cookieStore.get("auth_token")?.value;
	if (authToken !== undefined) {
		adminAuthSingleton.logout(authToken);
	}

	cookieStore.delete("auth_token");
	
	if (nextPage !== null)
		redirect(nextPage);

	return NextResponse.json({ success: true });
}
