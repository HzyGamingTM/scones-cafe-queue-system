"use client";


import Image from "next/image";
import localFont from "next/font/local";
import Card from "@/components/Card";
import Footer from "@/components/Footer";
import { useEffect, useState } from "react"
import { QueueStatus } from "@/server/queue"

export const Pusab = localFont({
    variable: "--my-pusab",
    src: "../public/fonts/PUSAB.otf"
});

const bgUrl : string = "https://media1.tenor.com/m/7Wr359XtEtEAAAAd/uma-musume-meep.gif"; 

type Room = {
    title: string,
    description: string,
    imageUrl: string
}


const rooms: Room[] = [
    {
        title: "Museum Heist", 
        description: "Reallyreallylongdescription\nwithnewlines\nin it\nraelly ling discriotn ! \n reall ylong description \n really long descrtitn! verticall y and horzioyalntally\n wowowowoowow womimkuki,miju \n miumokumoku \n mokou wwowoow!! ikumiukmikumi \ntetotetotetotetotetotetotetotetote\n",
        imageUrl: "/images/placeholder.png"
    },
    {
        title: "Amongst Us in Space", 
        description: "oral with fih",
        imageUrl: "/images/placeholder.png"
    },
    {
        title: "Who Cracked Dumpty?",
        description: "backshots with biembambom",
        imageUrl: "/images/placeholder.png"
    }, // TODO: Ask lim for escape room image
]

function QueueStatusBar() {
    const [queueStatus, setQueueStatus] = useState({ status: QueueStatus.NOT_IN_QUEUE });

    setInterval(() => {
        setQueueStates
    }, 15000);

    return (
        <></>
    )
}

export default function ClientHome({ inQueue } : { inQueue?: boolean }) {
    return (
        <div className="grow pb-8 justify-center decoration-amber-50 pt-8 px-4">
            { inQueue && <QueueStatusBar /> }

            <h1 className="text-center text-4xl mb-20 text-shadow-xl font-bold">
                Select an Escape Room
            </h1>

            <section className="flex flex-wrap items-center justify-center gap-10">
                {
                    rooms.map((room, index) => (
                        <Card key={index}
                              title={room.title} 
                              description={room.description}
                              imageUrl={room.imageUrl}
                        />
                    ))
                }
            </section>

        </div>
    );
}
