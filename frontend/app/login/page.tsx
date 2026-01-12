"use client";

import React, { useState } from "react";
import AuthForm from "@/components/AuthForm";
import ParticlesBackground from "@/components/ParticlesBackground";
import { Sun, Moon } from "lucide-react";

export default function LoginPage() {
    const [isDarkMode, setIsDarkMode] = useState(false);

    return (
        <div className={`min-h-screen relative flex flex-col transition-colors duration-300 ${isDarkMode ? "bg-[#101114]" : "bg-stone-100"}`}>
            {/* Background */}
            <div className="absolute inset-0 z-0">
                <ParticlesBackground isDarkMode={isDarkMode} />
            </div>

            {/* Navbar (Simplified for Login Page) */}
            <nav className={`relative z-10 px-6 py-4 flex justify-between items-center ${isDarkMode ? "bg-transparent" : "bg-transparent"}`}>
                <div className="flex items-center gap-2">
                    <span className={`font-bold text-xl tracking-tight font-[family-name:var(--font-playfair)] ${isDarkMode ? "text-[#ECEDEE]" : "text-[#1C1F26]"}`}>
                        Saral Vakeel
                    </span>
                </div>
                <button
                    onClick={() => setIsDarkMode(!isDarkMode)}
                    className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'bg-[#2B2E35] text-yellow-400' : 'bg-[#E2E2E8] text-slate-700'}`}
                >
                    {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>
            </nav>

            <main className="flex-1 flex items-center justify-center px-4 py-12 relative z-10">
                <AuthForm isDarkMode={isDarkMode} />
            </main>

            <footer className={`relative z-10 py-6 text-center text-sm ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>
                &copy; {new Date().getFullYear()} Saral Vakeel. All rights reserved.
            </footer>
        </div>
    );
}
