"use client";

import Image from "next/image";
import localFont from "next/font/local";
import Card from "@/components/Card";
import Footer from "@/components/Footer";
import QrCode from "qrcode";
import InQueue from "./InQueue";
import Served from "./Served"

import { QueueStatus } from "@/server/queue";

import { useEffect, useState, useRef } from "react";

export default function ClientQueue({ uuid, roomName, initialQueueStatus, isAdmin = false } : { uuid: string, roomName: string, initialQueueStatus: QueueStatus, isAdmin?: boolean }) {
    const [peopleAhead, setPeopleAhead] = useState(0);
    const [queueStatus, setQueueStatus] = useState(initialQueueStatus);
    const intervalObject = useRef<NodeJS.Timeout>(null);
    
    const WAIT_TIME_PER_PERSON: number = 8;
    const WAIT_TIME_COLOUR = (peopleAhead: number) => {
        if (peopleAhead <= 3) return "text-green-500"
        if (peopleAhead <= 5) return "text-yellow-500";
        if (peopleAhead <= 7) return "text-orange-500";
        if (peopleAhead <= 9) return "text-orange-700";
        return "text-red-500";
    }

    useEffect(() => {
        if ('Notification' in window) {
            if (Notification.permission === "granted") return;
            alert("Please enable website notifications!")
            Notification.requestPermission((result) => {
                if (!result) alert("Please enable Web Notifications.");
            });
        } else alert("Your browser does not support notifications!")
    }, []);

    useEffect(() => {
        let canvas: HTMLElement | null = document.getElementById('qrcode-canvas');
        if (canvas != null) {
            QrCode.toCanvas(canvas, window.location.href, () => {
                console.log("Error loading QR Code");
            });
        }

        const pollQueue = () => {
            console.log("finding out rn");
            fetch(`/api/queue?queue_token=${uuid}`).then(async (value: Response) => {
                let json = await value.json();
                console.log(json);
                if (json.success && json.data !== undefined) {
                    setPeopleAhead(json.data.queueStatus.people_ahead);
                    setQueueStatus(json.data.queueStatus.status);
                }

                if (value.status != 200)
                    if (intervalObject.current !== null)
                        clearInterval(intervalObject.current);

            }).catch((reason) => {
                console.log("failed to find out");
                console.log(reason);
                if (intervalObject.current !== null)
                    clearInterval(intervalObject.current);
            });
        }

        pollQueue();
        intervalObject.current = setInterval(pollQueue, 5000); // 5 Sec interval
    }, []);

    if (queueStatus == QueueStatus.IN_QUEUE) {
        return (
            <InQueue
                uuid={uuid}
                roomName={roomName}
                peopleAhead={peopleAhead}
                waitTimeMins={peopleAhead * WAIT_TIME_PER_PERSON}
                waitTimeColour={WAIT_TIME_COLOUR(peopleAhead)}
                isAdmin={isAdmin}
            />
        )
    } else {
        return (
            <Served
                uuid={uuid}
                roomName={roomName}
                isAdmin={isAdmin}
            />
        )
    }
}