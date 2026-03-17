import type { Metadata } from "next";
import { Geist, Geist_Mono, Google_Sans, Google_Sans_Code } from "next/font/google";
import "./globals.css";


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

const googleSans = Google_Sans({
    variable: "--font-google-sans",
    adjustFontFallback: false
});

const googleSansCode = Google_Sans_Code({
    variable: "--font-google-sans-code",
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
                className={`${googleSans.className} ${googleSans.variable} ${geistSans.variable} ${geistMono.variable} antialiased`}
            >
                {children}
            </body>
        </html>
    );
}

