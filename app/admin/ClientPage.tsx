'use client';


import { QueueEntry, QueueStatus } from '@/server/queue';
import { useRef, useEffect, useState, ReactNode } from 'react';
import LogoutIcon from '@/components/LogoutIcon';
import Modal from "@/components/Modal";

type Room = {
	title: string,
	imageUrl: string
}

const rooms: Room[] = [
	{
		title: "Museum Heist 🎨", 
		imageUrl: "/images/placeholder.png"
	},
	{
		title: "Amongst Us in Space 🚀", 
		imageUrl: "/images/placeholder.png"
	},
	{
		title: "Who Cracked Dumpty? 🥚",
		imageUrl: "/images/placeholder.png"
	},
]

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

	const enqueueButtonAction = async () => {
		const result = await fetch(`/api/queue/${room}/enqueue`, {
			method: "POST",
		});

		const json: { success: boolean, message?: string, data?: QueueEntry } = await result.json();
		
		if (json.success) {
			setQueueLength(n => n + 1);
		}

		alert(JSON.stringify(json, undefined, 4));
		
		if (json.data != undefined) // Redirect to queue qr code for customers to scan
			window.location.href = window.location.href.substring(0, -5) + `queue/${json.data?.uuid}?roomName=${rooms[room].title}`;
	};

	const dequeueButtonAction = async () => {
		const result = await fetch(`/api/queue/${room}/dequeue`, {
			method: "POST",
		});

		const json: { success: boolean, message?: string, data?: QueueStatus } = await result.json();
		
		if (json.success) {
			setQueueLength(n => n - 1);
		}

		alert(JSON.stringify(json, undefined, 4));
	};



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
						{rooms[room].title}
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
				<span className="w-full font-extralight text-zinc-500 text-sm text-left">{queueLength} in queue</span>
			</div>
		</div>
	);
}

export default function AdminClientPage({ numRooms, initialQueueLengths }: { numRooms: number, initialQueueLengths: number[] }) {
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
							initialQueueLength={initialQueueLengths[index]}
						/>
					 ), numRooms)}
				</section>

			</div>
		</div>
	)
}
