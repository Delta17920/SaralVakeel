"use client";

import React, { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Loader2, Mail, Lock, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AuthForm({ isDarkMode = false }: { isDarkMode?: boolean }) {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setMessage(null);
        console.log("Clicked handle submit");

        try {
            if (isLogin) {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
                router.push("/");
                router.refresh();
            } else {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || window.location.origin}/auth/callback`,
                    },
                });
                if (error) throw error;
                setMessage("Check your email for the confirmation link.");
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const inputClasses = `w-full pl-10 pr-4 py-3 rounded-lg border outline-none transition-all duration-200 
    ${isDarkMode
            ? "bg-[#2B2E35] border-[#3B3E45] text-white focus:border-blue-500 focus:bg-[#32363F]"
            : "bg-white border-gray-200 text-gray-900 focus:border-blue-500 focus:bg-gray-50"
        }`;

    const labelClasses = `block text-sm font-medium mb-1.5 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`;

    return (
        <div className={`w-full max-w-md p-8 rounded-2xl shadow-xl backdrop-blur-sm border 
      ${isDarkMode
                ? "bg-[#1A1C20]/90 border-[#2B2E35]"
                : "bg-white/90 border-[#E2E2E8]"
            }`}
        >
            <div className="text-center mb-8">
                <h2 className={`text-2xl font-bold font-[family-name:var(--font-playfair)] mb-2 
          ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                    {isLogin ? "Welcome Back" : "Create Account"}
                </h2>
                <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                    {isLogin ? "Sign in to access your dashboard" : "Get started with Saral Vakeel"}
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                <AnimatePresence mode="wait">
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-2 text-red-500 text-sm"
                        >
                            <AlertCircle className="w-4 h-4" />
                            <span>{error}</span>
                        </motion.div>
                    )}
                    {message && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center gap-2 text-green-500 text-sm"
                        >
                            <AlertCircle className="w-4 h-4" />
                            <span>{message}</span>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div>
                    <label className={labelClasses}>Email Address</label>
                    <div className="relative">
                        <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDarkMode ? "text-gray-500" : "text-gray-400"}`} />
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={inputClasses}
                            placeholder="you@example.com"
                            required
                        />
                    </div>
                </div>

                <div>
                    <label className={labelClasses}>Password</label>
                    <div className="relative">
                        <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDarkMode ? "text-gray-500" : "text-gray-400"}`} />
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className={inputClasses}
                            placeholder="••••••••"
                            required
                            minLength={6}
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-3 rounded-lg font-medium text-white transition-all duration-200 flex items-center justify-center gap-2
            ${isDarkMode
                            ? "bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50"
                            : "bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50"
                        }`}
                >
                    {loading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        isLogin ? "Sign In" : "Create Account"
                    )}
                </button>
            </form>

            <div className="mt-6 text-center">
                <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                    <button
                        onClick={() => setIsLogin(!isLogin)}
                        className={`font-medium hover:underline transition-colors ${isDarkMode ? "text-blue-400" : "text-blue-600"}`}
                    >
                        {isLogin ? "Sign up" : "Sign in"}
                    </button>
                </p>
            </div>
        </div>
    );
}
