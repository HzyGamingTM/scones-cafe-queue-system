"use client";

import QrCode from "qrcode";
import InQueue from "./InQueue";
import Served from "./Served"

import { QueueStatus } from "@/server/queue";
import { useEffect, useState, useRef } from "react";
import { urlBase64ToUint8Array } from "@/server/utils";

export default function ClientQueue({ uuid, roomName, initialQueueStatus, isAdmin = false } : { uuid: string, roomName: string, initialQueueStatus: QueueStatus, isAdmin?: boolean }) {
    const [peopleAhead, setPeopleAhead] = useState(0);
    const [queueStatus, setQueueStatus] = useState(initialQueueStatus);
    const [counter, setCounter] = useState(0);
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
            if (Notification.permission === "granted")
                return;
            
            alert("Please enable website notifications!")
            Notification.requestPermission(async (result) => {
                if (!result) {
                    alert("Please enable Web Notifications.");
                    return;
                }

                const reg = await navigator.serviceWorker.ready;
                const vapidPublicKey = "BLdS1xe6dU_RMIdaue-4kiIEZ0n8eB4nTaY95l6fKeNMjBctOKM9r_OF2OTOKvccQIWr9N6ICZI_KXMwuImqz-4";

                const sub = await reg.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: vapidPublicKey,
                });

                await fetch('api/subscribe', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(sub.toJSON()),
                });
            });
        } else alert("Your browser does not support notifications!")
    }, []);

    useEffect(() => {
        navigator.serviceWorker.register("../sw.js").catch(console.error);
    });


    useEffect(() => {
        let canvas: HTMLElement | null = document.getElementById('qrcode-canvas');
        if (canvas != null) {
            QrCode.toCanvas(canvas, window.location.href, () => {
                console.log("Error loading QR Code");
            });
        }
    }, []);

    useEffect(() => {
        console.log("finding out rn");
        fetch(`/api/entry/${uuid}/status`).then(async (value: Response) => {
            let json = await value.json();
            console.log(json);
            if (json.success && json.data !== undefined) {
                setPeopleAhead(json.data.peopleAhead);

                if (json.data.status == QueueStatus.SERVED && queueStatus == QueueStatus.IN_QUEUE) {
                    console.log("Requesting for notification to be shown");
                    fetch(`/api/sendme?uuid=${uuid}`);
                }

                setQueueStatus(json.data.status);
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

        setTimeout(() => setCounter(c => c + 1), 5000);
    }, [counter]);

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