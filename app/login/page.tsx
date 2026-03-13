import Footer from "@/components/Footer"

export default function Login() {
    return (

        <div className="bg-black flex flex-col justify-between min-h-dvh">

            <div className="grow max-h-130 flex flex-col items-center justify-center p-1">
                <h1 className="text-center text-3xl text-white-300 mb-20">Scones Escape Room</h1>
                <form action="/api/login" method="POST" className="mx-auto min-w-72 w-fit p-2 rounded-lg text-center">
                    <div className="my-4 w-full flex flex-col gap-4 items-center">

                        <label className="w-full">
                            <input placeholder="Username" name="username" type="text" className="p-2 w-full bg-zinc-950 outline outline-zinc-800 rounded-lg"/>
                        </label>

                        <label className="w-full">
                            <input placeholder="Password" name="password" type="password" className="p-2 w-full bg-zinc-950 outline outline-zinc-800 rounded-lg"/>
                        </label>

                    </div>

                    <input type="submit" className="my-4 p-1.5 w-40 bg-zinc-900 outline outline-zinc-800 rounded-lg" value="Log in" />
                </form>
            </div>

            <Footer/>

        </div>

    );
}
