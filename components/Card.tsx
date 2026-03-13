"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";

function Card({
    title, description, imageUrl, imageAlt = "", urlTo, queueCount = 0,
}: {
    title: string,
    description?: string,
    imageUrl?: string,
    imageAlt?: string
    urlTo?: string,
    queueCount?: number,
}) {

    // TODO: add logic here to set imageAlt to a sensible value if empty
    return (
        <div className="h-104 w-76 mb-4 duration-150 ease-in-out hover:scale-101 brightness-90 hover:brightness-100 group">
            <div className="w-full h-full flex flex-col gap-2 overflow-hidden relative rounded-2xl outline-2 outline-slate-700 hover:outline-gray-400 duration-300 bg-black">
                
                <div className="relative h-57">
                    
                    {imageUrl && 
                        <>
                            <Image fill alt={imageAlt} className="w-full blur-2xl contrast-200 brightness-50" src={imageUrl}/>
                            <Image fill alt={imageAlt} className="w-full absolute top-0 inset-x-0 blur-3xl contrast-250 brightness-70" src={imageUrl}/>
                            <Image fill alt={imageAlt} className="w-full absolute top-0 inset-x-0 bottomblur" src={imageUrl}/>
                        </> 
                    }

                    <h1 className="z-100 absolute text-white font-bold text-2xl w-full px-4 bottom-0 left-0">
                        {title}
                    </h1>

                </div>

                <p className="z-100 text-gray-100 px-4 w-full grow overflow-hidden line-clamp-6">
                    {description}
                </p>

                <span className="text-center w-full mb-2 text-gray-500">
                    {queueCount} people in Queue
                </span>

            </div>
        </div>

    );
}

export default function CardWrapper({
    title, description, imageUrl, imageAlt = "", urlTo, queueCount = 0
}: {
    title: string,
    description?: string,
    imageUrl?: string,
    imageAlt?: string
    urlTo?: string,
    queueCount?: number,
}) {
    if (urlTo) {
        return (
            <Link href={urlTo}>
                <Card
                    title={title}
                    description={description}
                    imageUrl={imageUrl}
                    imageAlt={imageAlt}
                    urlTo={urlTo}
                    queueCount={queueCount}
                />
            </Link>
        );
    } else {
        return (
            <div>
                <Card
                    title={title}
                    description={description}
                    imageUrl={imageUrl}
                    imageAlt={imageAlt}
                    urlTo={urlTo}
                    queueCount={queueCount}
                />
            </div>
        );
    }
}
