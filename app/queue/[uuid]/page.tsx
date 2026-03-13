import Client from "./Client"

import { QueueStatus, singletonQueues } from "@/server/queue";
import { redirect } from "next/navigation";
import NotFound from "@/components/NotFound";
import { cookies } from "next/headers";

export default async function Queue({ searchParams, params } : { searchParams: Promise<{ set_cookie?: boolean }>, params: Promise<{ uuid: string }> }) {
    const { uuid } = await params;
    const uuidQueueStatus = await (await singletonQueues.getQueueContainingUuid(uuid))?.getQueueStatus(uuid);
    const { set_cookie: setCookie } = await searchParams;

    if (uuidQueueStatus && uuidQueueStatus.status == QueueStatus.IN_QUEUE) {
        if (setCookie === true) {
            const twodays = 2 * 86400 * 1000;
            (await cookies()).set("queue_token", uuid, {
                expires: new Date(Date.now() + twodays)
            });
        }
        return <Client uuid={uuid} />
    }

    return <NotFound/>;
}