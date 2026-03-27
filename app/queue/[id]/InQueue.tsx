"use client";
import { REALTIME_SUBSCRIBE_STATES } from "@supabase/supabase-js";

export default function InQueue({
    roomName, id, peopleAhead, waitTimeMins, waitTimeColour, isAdmin, subscriptionStatus
}: {
    roomName: string, id: string, peopleAhead: number, waitTimeMins: number, waitTimeColour: string, isAdmin: boolean, subscriptionStatus: REALTIME_SUBSCRIBE_STATES
}) {

    let subscriptionMessage: string = "";

    if (subscriptionStatus === REALTIME_SUBSCRIBE_STATES.CLOSED) {
        subscriptionMessage = "You are currently not receiving real-time updates on your queue position."
    } else if (subscriptionStatus === REALTIME_SUBSCRIBE_STATES.TIMED_OUT) {
        subscriptionMessage = "You are currently not receiving real-time updates on your queue position."
    } else if (subscriptionStatus === REALTIME_SUBSCRIBE_STATES.SUBSCRIBED) {
        subscriptionMessage = "You are receiving real-time updates on your queue position."
    } else if (subscriptionStatus === REALTIME_SUBSCRIBE_STATES.CHANNEL_ERROR) {
        subscriptionMessage = "An error occurred and you are not receiving real-time updates on your queue position.";
    }

    return (
        <div className="max-h-200 h-full flex w-full justify-center items-center">
            <div className={`h-full flex-col flex bg-transparent backdrop-brightness-90 backdrop-contrast-110 backdrop-blur-2xl justify-center items-center gap-3 mx-auto min-w-2xs max-w-xs border border-white/15 rounded-2xl py-5 px-2`} style={{opacity: 1 - 0.01 * (peopleAhead % 2)}}>
                <h1 className="text-center font-bold text-3xl">{roomName}</h1>
                <hr className="bg-white"></hr>
                <h1 className="text-center font-bold text-2xl">Queue Number:</h1>
                <h1 className="text-center font-bold text-2xl">{id}</h1>
                <div className="flex flex-row gap-5 justify-center">
                    <div className="basis-full flex flex-col">
                        <h2 className={`text-center ${waitTimeColour} font-bold text-xl`}>{peopleAhead}</h2>
                        <h2 className="text-center text-neutral-500 font-bold text-xs">People Ahead In Queue</h2>
                    </div>
                    <hr className="bg-neutral-500 w-[0.2] h-10"></hr>    
                    <div className="basis-full flex flex-col">
                        <h3 className={`text-center ${waitTimeColour} font-bold text-xl`}>
                            {
                                peopleAhead <= 1
                                    ? "Soon"
                                    : `${waitTimeMins} mins`
                            }
                        </h3>
                        <h3 className="text-center text-neutral-500 font-bold text-xs">Wait Time</h3>
                    </div>
                </div>
                
                { isAdmin &&
                    <canvas id="qrcode-canvas" className="mx-auto"></canvas>
                }

                <div className="text-center px-6">
                    <p className="w-full text-zinc-400 text-xs">
                        Please refresh the website if your queue number is not updating.
                    </p>
                </div>
            </div>
        </div>
    );
}
