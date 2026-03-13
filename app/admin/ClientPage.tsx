'use client';

import { useRef } from 'react';

export default function AdminClientPage() {

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

    return (
        <div className="flex flex-col">
            <div className="">
                <h1 className="text-center">Admin Panel</h1>
            </div>
            <div className="flex flex-col gap-5">
                <input ref={inputRef} className="input-queue bg-white text-black mx-100 mt-2" placeholder="E.g: 1"></input>
                <div className="flex flex-row justify-center gap-5">
                    <button className="bg-red-500" onClick={callQueue}>Call Queue</button>
                    <button className="bg-red-500" onClick={callQueueNum}>Call Specific Queue Number</button>
                    <button className="bg-red-500" onClick={removeQueueNumber}>Remove Queue Number</button>
                </div>
            </div>
        </div>
    )
}

