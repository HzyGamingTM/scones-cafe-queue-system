import Image from "next/image";
import localFont from "next/font/local";
import Card from "@/components/Card";
import Footer from "@/components/Footer";


export const Pusab = localFont({
  variable: "--my-pusab",
  src: "../public/fonts/PUSAB.otf"
});

const bgUrl : string = "https://media1.tenor.com/m/7Wr359XtEtEAAAAd/uma-musume-meep.gif"; 

type Room = {
  title: string,
  description: string,
  imageUrl: string
}

const rooms: Room[] = [
  {
    title: "Museum Heist", 
    description: "sex with lim qi ",
    imageUrl: "/images/placeholder.png"
  },
  {
    title: "Amongst Us in Space", 
    description: "oral with fih",
    imageUrl: "/images/placeholder.png"
  },
  {
    title: "Who Cracked Dumpty?",
    description: "backshots with biembambom",
    imageUrl: "/images/placeholder.png"
  }, // TODO: Ask lim for escape room image
]

export default function Home() {
  return( 
    <div className="min-h-screen content-center justify-center decoration-amber-50 bg-radial from-sky-950 to-black">
      <h1 className={`text-center text-6xl mb-20 text-shadow-xl font-bold`}>Select an Escape Room</h1>
      <section className="flex flex-wrap items-center justify-center gap-10">
        {
          rooms.map((room, index) => (
            <Card key={index} title={room.title} description={room.description} imageUrl={room.imageUrl}></Card>
          ))
        }
      </section>
      <Footer/>
    </div>
  );
}


//   return (
//     <div className="flex min-h-screen items-center justify-center bg-zinc-50 pusab">
//       <main className="flex min-h-screen w-max flex-col items-center justify-between bg-white dark:bg-black sm:items-start">
//         <div className="flex flex-col w-max h-max">
//           <h1 className={`mt-20 ml-auto mr-auto text-3xl mb-20 text-white ${Pusab.className}`}>🚀 Scones Room Queue Registration 🚀</h1>
//           <button className={`ml-auto mr-auto w-50 h-10 mt-20 text-black rounded-2xl bg-yellow-100 ${Pusab.className}`}>Get Queue Number</button>
//         </div>
//       </main>
//     </div>
//   );
// }