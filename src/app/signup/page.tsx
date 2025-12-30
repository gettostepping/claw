"use client";

import { useActionState } from "react";
import { signUp } from "@/actions/auth";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";

import { CherryBlossomEffect } from "@/components/effects/background-effects";

export default function SignupPage() {
    const [state, formAction, isPending] = useActionState(signUp, null);
    const router = useRouter();

    useEffect(() => {
        if (state?.success) {
            // Redirect to login after a short delay
            setTimeout(() => {
                router.push("/login?newuser=true");
            }, 2000);
        }
    }, [state, router]);

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-black relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(168,85,247,0.1),transparent_50%)]" />
            <CherryBlossomEffect />

            <motion.div
                className="w-full max-w-md relative z-10 bg-neutral-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-white to-neutral-400 bg-clip-text text-transparent">
                        Join clawsome.beauty
                    </h1>
                    <p className="text-neutral-400">Create your digital sanctuary</p>
                </div>

                <form action={formAction} className="space-y-4">
                    {state?.error && (
                        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                            {state.error}
                        </div>
                    )}

                    {state?.success && (
                        <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 text-sm text-center">
                            Account created! Redirecting to login...
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-xs font-medium text-neutral-400 uppercase tracking-widest">
                            Email Address
                        </label>
                        <input
                            name="email"
                            type="email"
                            required
                            placeholder="you@example.com"
                            className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white placeholder:text-neutral-600 focus:outline-none focus:border-purple-500/50 transition-all"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-medium text-neutral-400 uppercase tracking-widest">
                            Username
                        </label>
                        <input
                            name="username"
                            type="text"
                            required
                            placeholder="clawsome_user"
                            className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white placeholder:text-neutral-600 focus:outline-none focus:border-purple-500/50 transition-all"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-medium text-neutral-400 uppercase tracking-widest">
                            Password
                        </label>
                        <input
                            name="password"
                            type="password"
                            required
                            placeholder="••••••••"
                            className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white placeholder:text-neutral-600 focus:outline-none focus:border-purple-500/50 transition-all"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-medium text-neutral-400 uppercase tracking-widest">
                            Invite Code
                        </label>
                        <input
                            name="inviteCode"
                            type="text"
                            required
                            placeholder="CLAW-XXXXX"
                            className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white placeholder:text-neutral-600 focus:outline-none focus:border-purple-500/50 transition-all font-mono"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isPending || state?.success}
                        className="w-full py-3 mt-4 rounded-lg font-bold bg-white text-black hover:bg-neutral-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isPending ? "Setting things up..." : "Create Account"}
                    </button>
                </form>

                <div className="mt-8 text-center text-sm text-neutral-500">
                    <p>
                        Already have an account?{" "}
                        <Link href="/login" className="text-white hover:underline">
                            Sign in
                        </Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
