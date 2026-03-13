'use client';

import Card from '@/components/Card';
import { useRef, useEffect, useState, ReactNode } from 'react';

type Room = {
    title: string,
    imageUrl: string
}


const rooms: Room[] = [
    {
        title: "Museum Heist", 
        imageUrl: "/images/placeholder.png"
    },
    {
        title: "Amongst Us in Space", 
        imageUrl: "/images/placeholder.png"
    },
    {
        title: "Who Cracked Dumpty?",
        imageUrl: "/images/placeholder.png"
    }, // TODO: Ask lim for escape room image
]

export default function AdminClientPage() {
    const [numRooms, setNumRooms] = useState(-1);
    
    const inputRef = useRef(null);

    const callQueue: () => void = () => {

    }

    const callQueueNum: () => void = () => {
        if (confirm("Are you sure you want to call this queue number?")) {
            fetch("/api/admin", {
                method: "POST",
                headers: {
                    "Content-Type": "Application/JSON",
                },
                body: JSON.stringify({
                    method: "call_queue_num",
                    queueNum: inputRef.current.value
                }),
            });
        }
    }

    const removeQueueNumber: () => void = () => {
        if (confirm("Are you sure you want to remove this queue number?")) {
            fetch("/api/admin", {
                method: "POST",
                headers: {
                    "Content-Type": "Application/JSON",
                },
                body: JSON.stringify({
                    method: "remove_queue_num",
                    queueNum: 0
                }),
            });
        }
    }

    useEffect(() => {
        (async () => {
            const response = await fetch("/api/admin?resource=num_queues");
            const responseJson = await response.json();
            
            if (responseJson.success == true)
                setNumRooms(responseJson.data);
        })();
    }, []);

    return (
        <div className="flex flex-col">
            <div className="">
                <h1 className="text-center">Admin Panel</h1>
            </div>
            <div className="flex flex-col gap-5">
                <input ref={inputRef} className="input-queue bg-white text-black mx-100 mt-2" placeholder="E.g: 1"></input>
                <div className="flex flex-row justify-center gap-5">
                    <section className="flex flex-wrap items-center justify-center gap-10">
                        {(() => {
                            let elements: ReactNode[] = []
                            for (let i = 0; i < numRooms; i++) {
                                const room = rooms[i];
                                elements.push(
                                    <Card key={i}
                                        title={room.title} 
                                        imageUrl={room.imageUrl}
                                    />
                                )
                            }
                            return elements;
                        })()}
                    </section>
                    {/*
                    <button className="bg-red-500" onClick={callQueue}>Call Queue</button>
                    <button className="bg-red-500" onClick={callQueueNum}>Call Specific Queue Number</button>
                    <button className="bg-red-500" onClick={removeQueueNumber}>Remove Queue Number</button>
                    {(() => {
                        const result: React.ReactNode[] = [];
                        for (let i = 0; i < numRooms; i++) {
                            result.push(
                                <div className="bg-green-500 w-12 h-2 m-2">
                                </div>
                            )
                        }
                        return result;
                    })()}
                        */}
                </div>
            </div>
        </div>
    )
}



/*
                            rooms.map((room, index) => (
                                <Card key={index}
                                    title={room.title} 
                                    description={room.description}
                                    imageUrl={room.imageUrl}
                                />
                            ))
                                */