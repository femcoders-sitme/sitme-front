import Link from "next/link";

export default function Home() {
  return (
    <div className="font-sans flex flex-col items-center justify-center min-h-screen p-8 gap-10 text-center">
      <main className="flex flex-col gap-6 max-w-2xl">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white">
          Don’t fight for a seat — your <span style={{color:"#E20074"}}>Room</span> or <span style={{color:"#E20074"}}>Table</span> is just one click away.
        </h1>
        <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
          SitMe is a simple app to book spaces for meetings, study sessions, or
          teamwork. Find the spot that fits your needs and make it yours in
          seconds.
        </p>
        <div className="flex gap-4 justify-center flex-col sm:flex-row mt-6">
          <Link
            href="/spaces"
            className="rounded-full border border-transparent transition-colors flex items-center justify-center font-medium text-base h-12 px-6"
            style={{
              backgroundColor: "#E20074",
              color: "white",
            }}
          >
            View Spaces
          </Link>
          <Link
            href="/login"
            className="rounded-full border border-gray-300 dark:border-gray-700 transition-colors flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 font-medium text-base h-12 px-6"
          >
            Login
          </Link>
        </div>
      </main>
    </div>
  );
}