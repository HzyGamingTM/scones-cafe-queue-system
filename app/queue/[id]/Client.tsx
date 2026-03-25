"use client";

import QrCode from "qrcode";
import InQueue from "./InQueue";
import Served from "./Served"

import { flushSync } from 'react-dom';
import { QueueEntry } from "@/server/queue";
import { useEffect, useState, useRef } from "react";
import { rooms } from "@/server/rooms.json"
import { clientSupabase } from "@/server/client-supabase";
import { useQuery } from "@tanstack/react-query";

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
        (async () => {
            await clientSupabase.realtime.setAuth();
            clientSupabase.channel("topic:queues", { config: { private: true } })
                .on("broadcast", { event: "UPDATE" }, event => {
                    console.log(event.payload);
                    if (event.payload.record.id == id)
                        flushSync(() => {
                            setEntry(event.payload.record)
                        });

                    if (event.payload.old_record.served == false && event.payload.record.served == true)
                        flushSync(() => {
                            setPeopleAhead(p => p - 1);
                        });
                })
                .subscribe(status => {
                    console.log(status);
                })

        })();
    }, [])

    if (!entry?.served) {
        return (
            <InQueue
                id={id}
                roomName={rooms[room].name}
                peopleAhead={peopleAhead}
                waitTimeMins={peopleAhead * WAIT_TIME_PER_PERSON}
                waitTimeColour={WAIT_TIME_COLOUR(peopleAhead)}
                isAdmin={isAdmin}
            />
        )
    } else {
        return (
            <Served
                id={id}
                roomName={rooms[room].name}
                isAdmin={isAdmin}
            />
        )
    }
}