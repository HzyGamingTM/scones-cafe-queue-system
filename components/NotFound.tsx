"use client";
import GlassSurface from "./GlassSurface";

export default function NotFound() {
    return ( 
        <div className="flex flex-col min-h-screen justify-around z-100">
            <h1 className="text-center text-5xl">Page Not Found</h1>
            <GlassSurface
                displace={0.5}
                distortionScale={-180}
                redOffset={0}
                greenOffset={10}
                blueOffset={20}
                brightness={50}
                opacity={0.93}
                mixBlendMode="screen"
                className="mb-20 mx-auto border-purple-500 border-0.5 rounded-8xl p-2 px-12 text-2xl"
            >
                <a href="/">Back</a>  
            </GlassSurface>
        </div>
    );
}