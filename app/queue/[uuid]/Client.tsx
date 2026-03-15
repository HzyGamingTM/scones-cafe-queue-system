"use client";

import Image from "next/image";
import localFont from "next/font/local";
import Card from "@/components/Card";
import Footer from "@/components/Footer";
import QrCode from "qrcode";

import { useEffect, useState, useRef } from "react";

export default function ClientQueue({ uuid, roomName } : { uuid: string, roomName: string }) {
    const [peopleAhead, setPeopleAhead] = useState(0);
    const intervalObject = useRef<NodeJS.Timeout>(null);
    const WAIT_TIME_PER_PERSON = 5;

    useEffect(() => {
        if ('Notification' in window) {
            if (Notification.permission == "granted")
                return;
            alert("Please enable website notifications!")
            Notification.requestPermission((result) => {
                console.log(result);
                if (!result) {
                    alert("Please enable Web Notifications.")
                }
            });
        } else alert("Your browser does not support notifications!")
    }, []); 


    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const intervalId = setInterval(() => {
          setTime(new Date());
        }, 5000);
        return () => clearInterval(intervalId);
    }, []); 

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
        <div className="max-h-dvh">  
            <div className="flex-col flex bg-black justify-items-stretch gap-3 mx-auto max-w-2xs border-2 rounded-2xl py-5">
                <h1 className="text-center font-bold text-3xl">{roomName}</h1>
                <hr className="bg-white"></hr>
                <h1 className="text-center font-bold text-2xl">Queue ID:</h1>
                <h1 className="text-center font-bold text-xs">{uuid}</h1>
                <div className="flex flex-row gap-5 justify-center">
                    <div className="flex flex-col">
                        <h2 className="text-center text-green-500 font-bold text-xl">{peopleAhead}</h2>
                        <h2 className="text-center text-neutral-500 font-bold text-xs">People Ahead</h2>
                    </div>
                    <hr className="bg-white w-[0.2] h-10"></hr>    
                    <div className="flex flex-col">
                        <h3 className="text-center text-green-500 font-bold text-xl">{peopleAhead * WAIT_TIME_PER_PERSON} mins</h3>
                        <h3 className="text-center text-neutral-500 font-bold text-xs">Wait Time</h3>
                    </div>
                </div>
                
                <canvas id="qrcode-canvas" className="mx-auto"></canvas>
            </div>
        </div>
    )
}