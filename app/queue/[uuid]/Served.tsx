"use client";

import { useEffect, useState } from "react";

export default function Served({ uuid, roomName, isAdmin = false } : { uuid: string, roomName: string, isAdmin?: boolean }) {
    return (
        <div className="max-h-200 h-full flex justify-center items-center">
            <div className="h-full flex-col flex bg-transparent backdrop-brightness-90 backdrop-contrast-110 backdrop-blur-2xl justify-center items-center gap-3 mx-auto w-2xs border border-white/15 rounded-2xl py-5 px-2">
                <h1 className="text-center font-bold text-3xl">{roomName}</h1>
                <hr className="bg-white"></hr>
                <h1 className="text-center font-bold text-2xl">Queue ID:</h1>
                <h1 className="text-center font-bold text-xs">{uuid}</h1>
                <div className="flex flex-row gap-5 justify-center">
                    <div className="flex flex-col">
                        <h2 className="text-center text-green-500 font-bold text-xl">Now Serving</h2>
                        <h2 className="text-center text-neutral-500 font-bold text-xs">Queue Status</h2>
                    </div>
                </div>
            </div>
        </div>
    );
}