'use client';


import { QueueEntry } from '@/server/queue';
import { useEffect, useRef, useState } from 'react';
import { clientSupabase } from '@/server/client-supabase';
import LogoutIcon from '@/components/LogoutIcon';
import Modal from "@/components/Modal";
import { rooms } from "@/server/rooms.json";

function multiple(generator: (index: number) => React.ReactNode, count: number) {
    let ret: React.ReactNode[] = []
    for (let i = 0; i < count; i++)
        ret.push(generator(i));
    return ret;
}

function AdminCard({ room, initialQueueLength }: { room: number, initialQueueLength?: number }) {
    const [queueLength, setQueueLength] = useState(initialQueueLength ?? -1);
    const [qrCodeUrl, setQrCodeUrl] = useState("");
    const [showEnqueueConfirm, setShowEnqueueConfirm] = useState(false);
    const [showDequeueConfirm, setShowDequeueConfirm] = useState(false);

    const enqueueButtonAction = async () => {
        const result = await fetch(`/api/queue/${room}/enqueue`, {
            method: "POST",
        });

        const json: { success: boolean, message?: string, data?: QueueEntry } = await result.json();
        
        if (json.data != undefined) // Redirect to queue qr code for customers to scan
            window.location.href = window.location.href.substring(0, -5) + `queue/${json.data?.id}`;
    };

    const dequeueButtonAction = async () => {
        const result = await fetch(`/api/queue/${room}/dequeue`, {
            method: "POST",
        });
    };

    useEffect(() => {
        if (queueLength == -1) {
            fetch(`/api/queue/${room}/length`).then(async v => {
                const { success, data } : { success: boolean, data?: number } = await v.json();
                if (success == true) {
                    if (data == undefined)
                        console.warn(`Received no data from fetching queue length for queue ${room}`);
                        
                    setQueueLength(data ?? 0);
                } else {
                    console.error(`Unsuccessful GET /api/queue/${room}/length`);
                }
            });
        }
    }, []);

    const addedEventListeners = useRef(false);
    useEffect(() => {
        console.log("Registering realtime");
        (async () => {

            await clientSupabase.realtime.setAuth();
            const channel = clientSupabase.realtime.channel("topic:queues", { config: { private: true } })

            console.log(addedEventListeners);
            if (!addedEventListeners.current) {
                channel
                    .on("broadcast", { event: "INSERT" }, event => {
                        console.log(event);
                        if (event.payload.record.queue == room) {
                            console.log("Handled event");
                            setQueueLength(l => l + 1);
                        }
                    })
                    .on("broadcast", { event: "UPDATE" }, event => {
                        console.log(event);
                        const OLD = event.payload.old_record;
                        const NEW = event.payload.record;
                        if (OLD.queue == room && NEW.queue == room && OLD.served == false && NEW.served == true)
                            setQueueLength(l => l - 1);
                    })
                    .on("broadcast", { event: "DELETE" }, event => {
                        console.log(event);
                        const OLD = event.payload.old_record;

                        if (OLD.queue == room && OLD.served == false)
                            setQueueLength(l => l - 1);
                     });
                addedEventListeners.current = true;
            }

            channel.subscribe(async status => {
                    console.log(status);

                    if (status === "SUBSCRIBED") {
                        const { count, error } = await clientSupabase.from("public_queues").select("*", { count: "exact", head: true }).eq("served", false).eq("queue", room);
                        if (error) {
                            console.error(error);
                        } else if (count !== null) {
                            setQueueLength(count);
                        }
                    }
                })

        })();

        return () => {
            console.log("Unsubscribing");
            const channel = clientSupabase.realtime.channel("topic:queues", { config: { private: true } });
            channel.state === 'joined' && channel.unsubscribe();
        }
    }, []);

    return (
        <div className="w-full flex justify-center">
            <Modal
                actionText="add person to queue"
                state={[showEnqueueConfirm, setShowEnqueueConfirm]}
                callback={enqueueButtonAction}
            />
            <Modal
                actionText="call person from queue"
                state={[showDequeueConfirm, setShowDequeueConfirm]}
                callback={dequeueButtonAction}
            />
            <div className="grow flex flex-col gap-2 p-3 max-w-150 outline outline-zinc-800 rounded-lg">
                <div className="w-full flex items-center justify-between gap-4">
                    
                    <h1 className="basis-0 grow font-bold text-2xl leading-none">
                        {rooms[room].name}
                    </h1>
                    
                    <div className="flex gap-4 max-w-max">
                        <button className="basis-full px-2 py-2 max-w-max rounded-lg outline outline-zinc-800 bg-green-500/30 hover:bg-green-500/35 ease-in-out" onClick={() => setShowEnqueueConfirm(true)}>
                            Add Person
                        </button>
                    
                        <button className="basis-full px-2 py-2 max-w-max rounded-lg outline outline-zinc-800 bg-red-500/30 hover:bg-red-500/35 ease-in-out" onClick={() => setShowDequeueConfirm(true)}>
                            Call Person
                        </button>
                    </div>
                </div>
                <span className="w-full font-extralight text-zinc-500 text-sm text-left">
                    {queueLength} in queue
                    <span className="mx-2">•</span>
                    {rooms[room].wait_time_min * queueLength} minutes for next person
                </span>
            </div>
        </div>
    );
}

export default function AdminClientPage() {
    const [showResetModal, setShowResetModal] = useState(false);
    return (
        <div className="flex flex-col gap-2 m-2">
            <div className='flex flex-row justify-between'>
                <h1 className="text-center text-2xl font-bold ml-2">Admin Panel 💻</h1>
                <a className="border-2 w-30 p-2 rounded-4xl flex flex-row bg-zinc-950 border-zinc-900" href="/api/signout?next=/login">
                    <LogoutIcon className="ml-1 w-6"></LogoutIcon>
                    <h1 className='my-auto text-center ml-1'>Sign Out</h1>
                </a>
            </div>
            <div className="flex flex-row justify-center justify-items-stretch gap-5">
                <section className="grow flex flex-col items-center justify-center gap-3">
                    {multiple((index) => (
                        <AdminCard
                            key={index}
                            room={index}
                        />
                     ), rooms.length)}

                     <button className="absolute bottom-2 right-2 rounded-lg p-2 outline outline-zinc-900 bg-zinc-950" onClick={() => { setShowResetModal(true); }}>
                        Reset
                     </button>
                     { showResetModal &&
                         <div className="fixed inset-0 bg-black/50 flex flex-col items-center justify-center">
                            <div className="grow basis-0 w-full" onClick={() => setShowResetModal(false)}></div>
                            <div className="w-full flex justify-center">
                                <div className="h-full min-w-4 grow" onClick={() => setShowResetModal(false)}></div>
                                <form action="/api/queues/reset" method="POST" className="grow bg-zinc-950 outline outline-zinc-900 rounded-2xl min-w-72 max-w-136 p-4">
                                    <h1 className="text-2xl text-center mb-4">Are you sure you want to reset one or all queues?</h1>
                                    <p className="mb-2">You need to enter a password to perform this action.</p>
                                    <label>
                                        <input name="password" type="password" placeholder="Password" className="w-full px-4 py-2 rounded-2xl outline outline-zinc-800 mb-4" />
                                    </label>

                                    <span className="mr-2">
                                        Select queue:
                                    </span>
                                    <label>
                                        <select name="queue" className="rounded-2xl py-1 px-3 outline outline-zinc-800">
                                            <option value="all">All queues</option>
                                            {rooms.map((room, index) => (
                                                <option key={index} value={index}>
                                                    {room.name}
                                                </option>
                                            ))}
                                        </select>
                                    </label>

                                    <div className="w-full flex justify-center">
                                        <div className="grow flex gap-2 mt-8 max-w-100">
                                            <button className="grow px-8 py-2 rounded-xl outline outline-zinc-800 bg-green-500/30 hover:bg-green-500/35 ease-in-out" onClick={() => {
                                            }}>
                                                Confirm
                                            </button>
                                            <input type="submit" value="Cancel" className="grow px-8 py-2 rounded-xl outline outline-zinc-800 bg-red-500/30 hover:bg-red-500/35 ease-in-out" onClick={() => setShowResetModal(false)} />
                                        </div>
                                    </div>
                                </form>
                                <div className="h-full min-w-4 grow" onClick={() => setShowResetModal(false)}></div>
                            </div>
                            <div className="grow basis-0 w-full" onClick={() => setShowResetModal(false)}></div>
                         </div>
                     }
                </section>

            </div>
        </div>
    )
}
