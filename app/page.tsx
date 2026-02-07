import Image from "next/image";
import localFont from "next/font/local";

export const Pusab = localFont({
  variable: "--my-pusab",
  src: "../public/fonts/PUSAB.otf"
});

export default function Home() {
  

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black pusab">
      <main className="flex min-h-screen w-max flex-col items-center justify-between bg-white dark:bg-black sm:items-start">
        <div className="flex flex-col w-max h-max">
          <h1 className={`mt-20 ml-auto mr-auto text-3xl mb-20 text-white ${Pusab.className}`}>🚀 Scones Cafe Queue Registration 🚀</h1>
          <button className={`ml-auto mr-auto w-50 h-10 mt-20 text-black rounded-2xl bg-yellow-100 ${Pusab.className}`}>Get Queue Number</button>
        </div>
      </main>
    </div>
  );
}