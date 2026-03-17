import Client from "./Client"

import { redirect, notFound } from "next/navigation";
import { cookies } from "next/headers";

import { QueueStatus, Queues } from "@/server/queue";

import NotFound from "@/components/NotFound";
import LightPillar from "@/components/LightPillar";
import Footer from "@/components/Footer";

export default async function Queue({ searchParams, params } : { searchParams: Promise<{ set_cookie?: boolean, roomName: string }>, params: Promise<{ uuid: string }> }) {
    const { uuid } = await params;
    const entryInfo = await Queues.getEntryInfo(uuid);
    
    const { set_cookie: setCookie, roomName } = await searchParams;

    const cookieStore = await cookies();

    if (entryInfo.status != QueueStatus.NOT_IN_QUEUE) {
        if (setCookie === true) {
            const twodays = 2 * 86400 * 1000;
            cookieStore.set("queue_token", uuid, {
                expires: new Date(Date.now() + twodays)
            });
        }
        return (
            <div suppressHydrationWarning className="flex flex-col min-h-screen min-w-80 justify-between"> 
                <div className="grow content-center">
                    <Client uuid={uuid} roomName={roomName} initialQueueStatus={entryInfo.status} isAdmin={cookieStore.has("auth_token")} />
                </div>
                <Footer />
                <div className="w-max h-max">
                    <LightPillar
                        topColor="#5227FF"
                        bottomColor="#FF9FFC"
                        intensity={1}
                        rotationSpeed={0.3}
                        glowAmount={0.002}
                        pillarWidth={3}
                        pillarHeight={0.4}
                        noiseIntensity={0}
                        pillarRotation={30}
                        interactive={false}
                        mixBlendMode="screen"
                        quality="high"
                        className="fixed"
                    />
                </div>
            </div>
        );
    }

    notFound();
}