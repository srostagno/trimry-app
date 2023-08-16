import Image from 'next/image'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <a
            className="pointer-events-none flex place-items-center gap-2 p-8 lg:pointer-events-auto lg:p-0"
            href="#"
            rel="noopener noreferrer"
          >
            By{' '}
            <Image
              src="/trimry-white.svg"
              alt="Trimry Logo"
              width={100}
              height={24}
            />
        </a>
      </div>
    </main>
  )
}
