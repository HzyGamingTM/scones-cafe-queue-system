import AdminClientPage from "./ClientPage";
import { adminAuthSingleton } from "@/server/adminAuth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function AdminPage() {
    return (
        <>
            <AdminClientPage/>
        </>
    );
}
