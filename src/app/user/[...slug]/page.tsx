'use client'

import React from 'react';
import Image from 'next/image';
import { Transition } from '@headlessui/react';

export default function AppDownloadView() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-black p-10">
        <div className="bg-gray-700 p-10 rounded-lg shadow-md text-white">
            <a
                className="flex items-center gap-2 mb-6"
                href="#"
                rel="noopener noreferrer"
            >
                <Image
                src="/trimry-white.svg"
                alt="Trimry Logo"
                width={100}
                height={24}
                />
            </a>
            {/* Animated subtitle */}
            <Transition
                as="p"
                show={true}
                enter="transform transition duration-[400ms]"
                enterFrom="opacity-0 translate-y-[-1em]"
                enterTo="opacity-100 translate-y-0"
                className="text-lg italic mb-6"
            >
                Questions with answers.
            </Transition>
            <h1 className="text-2xl font-bold mb-2">Welcome!</h1>
            <p className="mb-6">Experience the best features and seamless functionalities by downloading our mobile app.</p>
            <a href="https://apps.apple.com/app/idYOUR_APP_ID" target="_blank" rel="noopener noreferrer">
                <button className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
                    Download on the App Store
                </button>
            </a>
        </div>
    </main>
  )
}