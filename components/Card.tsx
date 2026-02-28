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
        <div className="h-150 w-100 mb-20 duration-150 ease-in-out hover:scale-101 brightness-90 hover:brightness-100 group">
            <div className="-z-100 absolute rounded-3xl duration-150 inset-0 opacity-0 group-hover:opacity-50 outline-white-100 -outline-offset-5 outline-10 blur-3xl">
                
            </div>
            <div className="w-full h-full flex flex-col overflow-hidden relative rounded-3xl outline-4 outline-white -outline-offset-1 bg-black">
                <div className="absolute top-0 left-0 right-0 h-5/13">
                    <img className="h-full w-full absolute inset-0 blur-3xl" src={imageUrl}/>
                </div>
                <div className="h-5/13 basis-full relative">
                    <img className="h-full w-full absolute inset-0 bottomblur" src={imageUrl}/>
                    <h1 className="z-100 absolute text-white font-bold text-center text-3xl w-full px-1 bottom-0 left-0 truncate">
                        {title}
                    </h1>
                </div>
                <div className="basis-full bg-black overflow-hidden flex flex-col">
                    <h1 className="text-4xl mt-auto mb-auto text-gray-100 font-bold  text-center justify-center capitalize">
                        {description}
                    </h1>
                </div>
                <span className="text-center w-full mb-2 text-gray-500">
                    {queueCount} people in Queue
                </span>
            </div>
        </div>
    )
}