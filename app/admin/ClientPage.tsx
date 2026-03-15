'use client';

import Card from '@/components/Card';
import QRCodeWindow from '@/components/QRCodeWindow';
import { QueueEntry, QueueStatus } from '@/server/queue';
import { redirect } from 'next/dist/server/api-utils';
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

function multiple(generator: (index: number) => React.ReactNode, count: number) {
	let ret: React.ReactNode[] = []
	for (let i = 0; i < count; i++)
		ret.push(generator(i));
	return ret;
}

function AdminCard({ room, initialQueueLength }: { room: number, initialQueueLength?: number }) {
	const [queueLength, setQueueLength] = useState(initialQueueLength ?? -1);
	const [qrcode_url, setQrCodeUrl] = useState("");

	if (queueLength == -1) {
		fetch(`/api/admin?resource=queue_length&room=${room}`).then(async v => {
			const { success, data } : { success: boolean, data?: number } = await v.json();
			if (success == true) {
				if (data == undefined)
					console.warn(`Received no data from fetching queue length for queue ${room}`);
					
				setQueueLength(data ?? 0);
			} else {
				console.error(`Unsuccessful GET /api/admin?resource=queue_length&room=${room}`);
			}
		});
	}

	const enqueueButtonAction = async () => {
		if (confirm(`Are you sure you want to enqueue for room ${room}?`)) {
			const result = await fetch("/api/admin", {
				method: "POST",
				body: JSON.stringify({
					method: "enqueue",
					room: room
				})
			});

			const json: { success: boolean, message?: string, data?: QueueEntry } = await result.json();
			
			if (json.success) {
				setQueueLength(n => n + 1);
			}

			alert(JSON.stringify(json, undefined, 4));
			
			if (json.data != undefined) // Redirect to queue qr code for customers to scan
				window.location.href = window.location.href.substring(0, -5) + `queue/${json.data?.uuid}?roomName=${rooms[room].title}`;
		}
	};

	const dequeueButtonAction = async () => {
		if (confirm(`Are you sure you want to dequeue for room ${room}?`)) {
			const result = await fetch("/api/admin", {
				method: "POST",
				body: JSON.stringify({
					method: "dequeue",
					room: room
				})
			});

			const json: { success: boolean, message?: string, data?: QueueStatus } = await result.json();
			
			if (json.success) {
				setQueueLength(n => n - 1);
			}

			alert(JSON.stringify(json, undefined, 4));
		}
	};



	return (
		<div className="flex flex-col gap-2 p-3 max-w-120 outline outline-zinc-800 rounded-lg">
			<div className="w-full flex items-center justify-between gap-4">
				<h1 className="font-bold text-2xl leading-none">
					Room {room}
				</h1>
				
				<div className="flex gap-4">
					<button className="px-2 py-1 rounded-lg outline outline-zinc-800 bg-green-500/30" onClick={enqueueButtonAction}>
						Enqueue
					</button>
				
					<button className="px-2 py-1 rounded-lg outline outline-zinc-800 bg-red-500/30" onClick={dequeueButtonAction}>
						Dequeue
					</button>
				</div>
			</div>
			<span className="w-full font-extralight text-zinc-500 text-sm text-left">{queueLength} in queue</span>
		</div>
	);
}

export default function AdminClientPage({ numRooms, initialQueueLengths }: { numRooms: number, initialQueueLengths: number[] }) {
	return (
		<div className="flex flex-col gap-2 m-2">
			<h1 className="text-center text-2xl font-bold">Admin Panel</h1>
			<div className="flex flex-row justify-center gap-5">
				<section className="flex flex-col items-center justify-center gap-3">
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
