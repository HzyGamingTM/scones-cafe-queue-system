import Client from "./Client"

import { QueueStatus, singletonQueues } from "@/server/queue";
import { redirect, notFound } from "next/navigation";
import NotFound from "@/components/NotFound";
import { cookies } from "next/headers";
import LightPillar from "@/components/LightPillar";

export default async function Queue({ searchParams, params } : { searchParams: Promise<{ set_cookie?: boolean, roomName: string }>, params: Promise<{ uuid: string }> }) {
    const { uuid } = await params;
    const uuidQueueStatus = await (await singletonQueues.getQueueContainingUuid(uuid))?.getQueueStatus(uuid);
    
    const { set_cookie: setCookie, roomName } = await searchParams;

    const cookieStore = await cookies();

    if (uuidQueueStatus && uuidQueueStatus.status != QueueStatus.NOT_IN_QUEUE) {
        if (setCookie === true) {
            const twodays = 2 * 86400 * 1000;
            cookieStore.set("queue_token", uuid, {
                expires: new Date(Date.now() + twodays)
            });
        }
        return (
            <div suppressHydrationWarning> 
                <Client uuid={uuid} roomName={roomName} initialQueueStatus={uuidQueueStatus.status} isAdmin={cookieStore.has("auth_token")} />
                <div className="w-max h-max">
                    <LightPillar
                        topColor="#5227FF"
                        bottomColor="#FF9FFC"
                        intensity={1}
                        rotationSpeed={0.3}
                        glowAmount={0.002}
                        pillarWidth={3}
                        pillarHeight={0.4}
                        noiseIntensity={0.5}
                        pillarRotation={25}
                        interactive={false}
                        mixBlendMode="screen"
                        quality="high"
                    />
                </div>
            </div>
        );
    }

    notFound();
}