"use client";

import React from "react";



export default function Card({
    title, description, imageUrl, queueCount = 0, children,
}: {
    title: string,
    description?: string,
    imageUrl: string,
    queueCount?: number,
    children?: React.ReactNode
}) {
    return (
        <div className="h-100 w-80 mb-4 duration-150 ease-in-out hover:scale-101 brightness-90 hover:brightness-100 group">
            <div className="-z-100 absolute rounded-3xl duration-150 inset-0 opacity-0 group-hover:opacity-50 outline-white-100 -outline-offset-5 outline-10 blur-3xl">
                
            </div>
            <div className="w-full h-full flex flex-col gap-2 overflow-hidden relative rounded-3xl outline-2 outline-white bg-black">
                <div className="basis-full shrink grow-0 relative">
                    <img className="h-full w-full absolute inset-0 blur-2xl contrast-200 brightness-50" src={imageUrl}/>
                    <img className="h-full w-full absolute inset-0 blur-3xl contrast-250 brightness-70" src={imageUrl}/>
                    <img className="h-full w-full absolute inset-0 bottomblur" src={imageUrl}/>
                    <h1 className="z-100 absolute text-white font-bold text-2xl w-full px-4 bottom-0 left-0">
                        {title}
                    </h1>
                </div>
                <div className="basis-full bg-black overflow-hidden flex flex-col">
                    <p className="z-100 text-gray-100 px-4 w-full">
                        {description}
                    </p>
                </div>
                <span className="text-center w-full mb-2 text-gray-500">
                    {queueCount} people in Queue
                </span>
            </div>
        </div>
    )
}
