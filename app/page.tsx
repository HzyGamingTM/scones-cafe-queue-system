import Image from "next/image";
import localFont from "next/font/local";
import Card from "@/components/Card";
import Footer from "@/components/Footer";
import { cookies, headers } from "next/headers";
import ClientPage from "./ClientPage";


export default async function Home({ searchParams } : { searchParams: Promise<any> } ) {
    const sp = await searchParams;
    const cookieStore = await cookies();
    let inQueue = false;
    
    return ( 
        <div className="flex flex-col min-h-screen min-w-80 bg-radial from-sky-950 to-black">
            <div className="grow p-4">
                <h1 className="font-bold text-2xl text-center">There is no content on this page.</h1>
            </div>
            <Footer />
        </div>
    );
}
