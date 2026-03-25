import type { Metadata } from "next";
import { Geist, Geist_Mono, Google_Sans, Google_Sans_Code } from "next/font/google";
import "./globals.css";
import Providers from "./providers";


const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
    adjustFontFallback: false
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
    adjustFontFallback: false
});

export const metadata: Metadata = {
    title: "Escape Room Queue",
    description: "Scones Escape Room Queue Website",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {



    return (
        <html lang="en">
            <body
                className={`${geistSans.className} ${geistMono.variable} antialiased`}
            >
                <Providers>
                    {children}
                </Providers>
            </body>
        </html>
    );
}

