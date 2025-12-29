"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";

// Server action to check session
async function checkSession() {
  const response = await fetch('/api/auth/session');
  if (response.ok) {
    return await response.json();
  }
  return null;
}

export default function GoogleRegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAndRedirect = async () => {
      try {
        const session = await checkSession();
        
        if (session?.user) {
          if (session.user.username) {
            // If user already has a username, go to dashboard
            router.push("/dashboard");
          } else {
            // If user is authenticated but doesn't have a username, go to register page
            router.push("/register");
          }
        } else {
          // User is not authenticated, show the page
          setIsLoading(false);
        }
      } catch (error) {
        // If there's an error checking session, assume user is not authenticated
        setIsLoading(false);
      }
    };
    
    checkAndRedirect();
  }, [router]);

  // Show loading state while checking session
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
          <p className="mt-2 text-neutral-400">Checking session...</p>
        </div>
      </div>
    );
  }

  const handleGoogleSignIn = () => {
    signIn('google', { callbackUrl: '/register' });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div 
        className="w-full max-w-md bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-8 shadow-2xl text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Join with Google</h1>
          <p className="text-neutral-400">Sign in with Google to create your account</p>
          <p className="text-sm text-neutral-500 mt-2">After signing in, you&apos;ll set your username and enter an invite code</p>
        </div>

        <div className="space-y-6">
          <motion.button
            type="button"
            onClick={handleGoogleSignIn}
            className="w-full px-6 py-4 rounded-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white transition-all shadow-lg shadow-purple-500/20 flex items-center justify-center gap-3"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.92A10 10 0 0 0 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A9.994 9.994 0 0 0 2 12c0 1.61.39 3.14 1.08 4.47l2.76-2.38z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Sign in with Google
          </motion.button>
        </div>

        <div className="mt-8 text-center text-sm text-neutral-500">
          <p>Already have an account? <Link href="/login" className="text-purple-400 hover:underline">Sign in</Link></p>
          <p className="mt-2">By continuing, you agree to our Terms of Service and Privacy Policy.</p>
        </div>
      </motion.div>
    </div>
  );
}