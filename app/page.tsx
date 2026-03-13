import Image from "next/image";
import localFont from "next/font/local";
import Card from "@/components/Card";
import Footer from "@/components/Footer";
import { cookies, headers } from "next/headers";
import { singletonQueues } from "@/server/queue";
import ClientPage from "./ClientPage";

export default async function Home({ searchParams } : { searchParams: Promise<any> } ) {
    const sp = await searchParams;
    const cookieStore = await cookies();
    let inQueue = false;

    const paramQueueToken = sp["q"];
    const cookieQueueToken = cookieStore.get("queue_token")?.value;

    if (paramQueueToken && await singletonQueues.get(paramQueueToken) !== undefined) {

        const twodays = 2 * 86400 * 1000;
        cookieStore.set("queue_token", paramQueueToken, {
            expires: new Date(Date.now() + twodays)
        });

        inQueue = true;

    } else if (cookieQueueToken) {

        if (await singletonQueues.get(cookieQueueToken) !== undefined) {
            inQueue = true;
        } else {
            cookieStore.delete("queue_token");
        }

    }
    
    return ( 
        <div className="flex flex-col min-h-screen min-w-80 bg-radial from-sky-950 to-black">
            <ClientPage inQueue={inQueue} />
            <Footer />
        </div>
    );
}
