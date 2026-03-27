"use client";

import QrCode from "qrcode";
import InQueue from "./InQueue";
import Served from "./Served"

import Link from "next/link";
import { flushSync } from 'react-dom';
import { QueueEntry } from "@/server/queue";
import { useEffect, useState, useRef } from "react";
import { rooms } from "@/server/rooms.json"
import { clientSupabase } from "@/server/client-supabase";
import { PostgrestError } from "@supabase/supabase-js"
import { useQuery } from "@tanstack/react-query";
import { REALTIME_SUBSCRIBE_STATES } from "@supabase/supabase-js";

export default function ClientQueue({ id, initialEntry, room, isAdmin = false }: { id: string, initialEntry: QueueEntry, room: number, isAdmin?: boolean }) {

    const WAIT_TIME_PER_PERSON: number = 8;
    const WAIT_TIME_COLOUR = (peopleAhead: number) => {
        if (peopleAhead <= 3) return "text-green-500"
        if (peopleAhead <= 5) return "text-yellow-500";
        if (peopleAhead <= 7) return "text-orange-500";
        if (peopleAhead <= 9) return "text-orange-700";
        return "text-red-500";
    }

    const { data, isLoading } = useQuery({
        queryKey: ["queue", id],
        queryFn: async () => {
            const res = await fetch(`/api/entry/${id}`)
            if (!res.ok) {
                throw new Error("idk bro");
            }
            return res.json();
        },
        enabled: !!id,
        staleTime: 60 * 1000,
        refetchInterval: 60 * 1000,
        refetchOnWindowFocus: true
    })

    const [peopleAhead, setPeopleAhead] = useState<number>(data.peopleAhead);
    const [entry, setEntry] = useState<null | QueueEntry>(data);
    const [subscribedStatus, setSubscribedStatus] = useState<REALTIME_SUBSCRIBE_STATES>(REALTIME_SUBSCRIBE_STATES.CLOSED);
    const [counter, setCounter] = useState(0);

    useEffect(() => {
        if (!isLoading) {
            console.log("daddadad", data)
            setPeopleAhead(data.peopleAhead);
            setEntry(data)
        }
    }, [isLoading])

    useEffect(() => {
        let canvas: HTMLElement | null = document.getElementById('qrcode-canvas');
        if (canvas != null) {
            QrCode.toCanvas(canvas, window.location.href, () => {
                console.log("Error loading QR Code");
            });
        }

    }, []);

    useEffect(() => {
        if (subscribedStatus !== REALTIME_SUBSCRIBE_STATES.SUBSCRIBED) {
            (async () => {
                const { data, error } = await clientSupabase.from("public_queues").select("*").eq("id", id).limit(1);
                if (data && data.length) {
                    let peopleAhead = await clientSupabase.from("public_queues")
                        .select("*", { count: "exact", head: true })
                        .eq("queue", data[0].queue)
                        .eq("served", false)
                        .lt("created_at", data[0].created_at);

                    setEntry(data[0]);
                    setPeopleAhead(peopleAhead.count ?? 0);
                }
            })();
        }

        setTimeout(() => setCounter(c => c + 1), 10000);
    }, [counter]);

    useEffect(() => {
        (async () => {
            await clientSupabase.realtime.setAuth();
            clientSupabase.channel("topic:queues", { config: { private: true } })
                .on("broadcast", { event: "UPDATE" }, event => {
                    console.log(event.payload);
                    if (event.payload.record.id == id)
                        setEntry(event.payload.record)

                    if (event.payload.old_record.served == false && event.payload.record.served == true)
                        setPeopleAhead(p => p - 1);
                })
                .subscribe(async status => {
                    console.log(status);
                    setSubscribedStatus(status);

                    if (status === "SUBSCRIBED") {
                        const { data, error } = await clientSupabase.from("public_queues").select("*").eq("id", id).limit(1);
                        if (data && data.length) {
                            let peopleAhead = await clientSupabase.from("public_queues")
                                .select("*", { count: "exact", head: true })
                                .eq("queue", data[0].queue)
                                .eq("served", false)
                                .lt("created_at", data[0].created_at);

                            setEntry(data[0]);
                            setPeopleAhead(peopleAhead.count ?? 0);
                        }
                    }
                })
        })();
    }, [])

    if (!entry?.served) {
        return (
            <div className="w-full h-full flex flex-col gap-4">
                <InQueue
                    id={`${rooms[room].queue_prefix}${entry?.id_in_queue ?? "(we don't know)"}`}
                    roomName={rooms[room].name}
                    peopleAhead={peopleAhead}
                    waitTimeMins={peopleAhead * WAIT_TIME_PER_PERSON}
                    waitTimeColour={WAIT_TIME_COLOUR(peopleAhead)}
                    isAdmin={isAdmin}
                    subscriptionStatus={subscribedStatus}
                />
                {isAdmin && (
                    <Link className="mx-auto rounded-2xl p-3 bg-black/20 backdrop-blur-2xl outline outline-fuchsia-300/15 text-center" href="/admin">Back to Admin page</Link>
                )}
            </div>
        )
    } else {
        return (
            <div className="w-full h-full flex flex-col gap-4">
                <Served
                    id={`${rooms[room].queue_prefix}${entry?.id_in_queue ?? "(we don't know)"}`}
                    roomName={rooms[room].name}
                    isAdmin={isAdmin}
                />
                {isAdmin && (
                    <Link className="mx-auto rounded-2xl p-3 bg-black/20 backdrop-blur-2xl outline outline-fuchsia-300/15 text-center" href="/admin">Back to Admin page</Link>
                )}
            </div>
        )
    }
}
