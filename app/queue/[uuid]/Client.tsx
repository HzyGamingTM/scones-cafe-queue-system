"use client";

import Image from "next/image";
import localFont from "next/font/local";
import Card from "@/components/Card";
import Footer from "@/components/Footer";
import QrCode from "qrcode";

import { useEffect, useState, useRef } from "react";

export default function ClientQueue({ uuid } : { uuid: string }) {
    const [peopleAhead, setPeopleAhead] = useState(0);
    const intervalObject = useRef<NodeJS.Timeout>(null);

    Notification.requestPermission((result) => {
        console.log(result);
    });

    useEffect(() => {
        let canvas: HTMLElement | null = document.getElementById('qrcode-canvas');
        QrCode.toCanvas(canvas, window.location.href, () => {
            console.log("Error loading QR Code");
        });

        const pollQueue = () => {
            console.log("finding out rn");
            fetch(`/api/queue?queue_token=${uuid}`).then(async (value: Response) => {
                let json = await value.json();
                console.log(json);
                if (json.success && json.data !== undefined) {
                    setPeopleAhead(json.data.queueStatus.people_ahead);
                }

                if (value.status != 200)
                    if (intervalObject.current !== null)
                        clearInterval(intervalObject.current);

            }).catch((reason) => {
                console.log("failed to find out")
                console.log(reason);
                if (intervalObject.current !== null)
                    clearInterval(intervalObject.current);
            });
        }

        pollQueue();
        intervalObject.current = setInterval(pollQueue, 15000);
    }, []);

    return (
        <div>  
            <div className="flex-col flex bg-blue-300">
                <h1 className="text-center font-bold text-2xl">youre yuri id is {uuid}</h1>
                <h2 className="text-center font-bold text-xl">you are giving {peopleAhead} people backshots</h2>
                <canvas id="qrcode-canvas" className="mx-auto"></canvas>
            </div>
        </div>
    )
}