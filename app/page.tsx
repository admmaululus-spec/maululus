export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-4 text-center dark:bg-zinc-950">
      <div className="space-y-6">
        <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 sm:text-6xl dark:text-zinc-50">
          Maululus.com
        </h1>
        <p className="text-xl font-medium text-zinc-600 sm:text-2xl dark:text-zinc-400">
          Kalau "Mau Lulus" Tunggu Kami
        </p>
        
        <div className="mt-8 flex justify-center space-x-2">
          <div className="h-3 w-3 animate-bounce rounded-full bg-blue-500 [animation-delay:-0.3s]"></div>
          <div className="h-3 w-3 animate-bounce rounded-full bg-blue-500 [animation-delay:-0.15s]"></div>
          <div className="h-3 w-3 animate-bounce rounded-full bg-blue-500"></div>
        </div>
      </div>
    </main>
  );
}