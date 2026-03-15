"use client";

import QrCode from "qrcode";
import { useEffect } from "react";

export default function QRCodeWindow(params: {qrCodeUrl: string}) {
    if (params.qrCodeUrl === "") {
        return (<></>);
    }

    useEffect(() => {
        let canvas: HTMLElement | null = document.getElementById('qrcode-canvas');
        QrCode.toCanvas(canvas, canvas!.innerHTML, () => {
            console.log("Error loading QR Code");
        });
    });


    return (<>
        <canvas id="qrcode-canvas" className="mx-auto">{params.qrCodeUrl}</canvas>
    </>)
}