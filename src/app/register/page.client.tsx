"use client";

import { signOut, useSession } from "next-auth/react";

import { motion } from "framer-motion";
import { useActionState } from "react";
import { completeRegistration } from "@/actions/auth";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPageClient() {
  const [state, formAction] = useActionState(completeRegistration, null);
  const router = useRouter();
  const { update } = useSession();

  useEffect(() => {
    if (state?.success) {
      // Force a session update to get the new username into the token
      const refreshAndRedirect = async () => {
        await update();
        // Redirect to dashboard after a short delay to show success message
        setTimeout(() => {
          router.push("/dashboard");
        }, 1500);
      };

      refreshAndRedirect();
    }
  }, [state, router, update]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        className="w-full max-w-md bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-8 shadow-2xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Complete Registration</h1>
          <p className="text-neutral-400">Welcome! Please enter your username and invite code.</p>
        </div>

        <form action={formAction} className="space-y-6">
          {state?.error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
              {state.error}
            </div>
          )}

          {state?.success && (
            <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 text-sm">
              Registration completed! Redirecting to dashboard...
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-300 uppercase tracking-wider">
              Username
            </label>
            <input
              name="username"
              type="text"
              required
              placeholder="Enter your username"
              className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white placeholder:text-neutral-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-all"
            />
            <p className="text-xs text-neutral-500">3-30 characters, letters, numbers, and underscores only</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-300 uppercase tracking-wider">
              Invite Code
            </label>
            <input
              name="inviteCode"
              type="text"
              required
              placeholder="Enter your invite code"
              className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white placeholder:text-neutral-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-all"
            />
            <p className="text-xs text-neutral-500">You need an invite code to register</p>
          </div>

          <motion.button
            type="submit"
            className="w-full px-6 py-3 rounded-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white transition-all shadow-lg shadow-purple-500/20"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Complete Registration
          </motion.button>
        </form>

        <div className="mt-6 text-center text-sm text-neutral-500">
          <p>
            Wrong account?{" "}
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="text-purple-400 hover:underline"
            >
              Sign out
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}