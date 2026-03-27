import Client from "./Client"

import { redirect, notFound } from "next/navigation";
import { cookies } from "next/headers";

import { clientSupabase } from "@/server/client-supabase";

import NotFound from "@/components/NotFound";
import LightPillar from "@/components/LightPillar";
import Footer from "@/components/Footer";
import { QueueEntry } from "@/server/queue";
import { getServerQueryClient } from "@/server/getServerQueryClient";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

export default async function Queue({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const { data, error } = await clientSupabase.from("public_queues").select("*").eq("id", id).limit(1);

    if (error) {
        notFound();
    }

    const queryClient = await getServerQueryClient();

    await queryClient.prefetchQuery({
        queryKey: ["queue", id],
        queryFn: async () => {
            const { data, error } = await clientSupabase.from("public_queues").select("*").eq("id", id).limit(1);
            if (error) {
                notFound();
            }
            if (data.length) {
                let peopleAhead = await clientSupabase.from("public_queues")
                    .select("*", { count: "exact", head: true })
                    .eq("queue", data[0].queue)
                    .eq("served", false)
                    .lt("created_at", data[0].created_at);

                return {
                    room: data[0].queue,
                    served: data[0].served,
                    id_in_queue: data[0].id_in_queue,
                    peopleAhead: peopleAhead.count,
                }

            } else {
                throw new Error("eror")
            }
        }
    })

    const cookieStore = await cookies();

    if (data && data.length) {
        const entry: QueueEntry = data[0];
        return (
            <HydrationBoundary state={dehydrate(queryClient)}>
                <div suppressHydrationWarning className="flex flex-col min-h-screen min-w-80 justify-between">
                    <div className="grow content-center">
                        <Client id={id} initialEntry={entry} room={entry.queue} isAdmin={cookieStore.has("auth_token")} />
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
            </HydrationBoundary>
        );
    }

    notFound();
}
