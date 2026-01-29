"use client"


import React, { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { Si42 } from "react-icons/si";
import Link from "next/link";

import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

import { FaRegEye, FaRegEyeSlash, FaTableTennisPaddleBall } from "react-icons/fa6";
import useSWR from "swr";

import { DotLottiePlayer } from '@dotlottie/react-player';
import '@dotlottie/react-player/dist/index.css';
import api from "@/lib/api";
import { cn } from "@/lib/utils";

import { account } from "@/lib/appwrite";


const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL!;
const INTRA_CLIENT_ID = process.env.NEXT_PUBLIC_INTRA_CLIENT_ID || '';



import { OAuthProvider } from "appwrite";

const handleLoginWithGoogle = async () => {
  try {
    console.log("Initiating Google OAuth...");
    const res = await account.createOAuth2Session(
      OAuthProvider.Google,
      `${SITE_URL}/google-auth`,
      `${SITE_URL}/signin`
    );
  } catch (err) {
  }
};


function SignIn() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [visiblePassword, setShowPassword] = useState(false);
  const [loadingSignIn, setLoadingSignIn] = useState(false);
  const router = useRouter();

  const hasAuthCookie = () => {
    if (typeof document === 'undefined') return false;
    return document.cookie.split(';').some(cookie => 
      cookie.trim().startsWith('access_token=') || 
      cookie.trim().startsWith('refresh_token=') ||
      cookie.trim().startsWith('session=')
    );
  };

  const { isLoading, isValidating } = useSWR(
    hasAuthCookie() ? "/auth/me" : null,
    async () => {
      const res = await api.get("/auth/me");
      return res.data;
    }, {
      onSuccess(data) {
        if (data) {
          setTimeout(() => {
            router.push("/home");
          }, 500);
        }
      }
    }
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 6) {
      toast.error("Password be at least 6 characters long.");
      return;
    }

    try {
      setLoadingSignIn(true);
      const res = await api.post("/auth/signin", {
        email,
        password
      })
      setTimeout(() => {
        if (res.data.message === "2FA required") {
          router.push("/twofa-gpage?userId=" + res.data.userId);

          return;
        }
        else {
          router.push("/home");
        }
      }, 300);

      toast.success("Account created successfully. Please sign in.");
    }
    catch (err) {
      toast.error("An error has occurred, please try again.");
    }
    finally {
      setLoadingSignIn(false);
    }
  }
  if (isLoading || isValidating) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <p>Checking authentication...</p>
      </div>
    );
  }
  return (
    <div className="w-full h-screen flex bg-black overflow-hidden relative">
      {/* LEFT SIDE (Animation) */}
      <div className="hidden lg:flex w-1/2 h-full items-center justify-center p-8 relative z-0">
        <div className="w-[90%] h-[90%] flex items-center justify-center">
          <DotLottiePlayer
            src="/bl.lottie"
            loop
            autoplay
            className="w-full h-full"
          />
        </div>
      </div>

      <div className="w-full lg:w-1/2 h-full relative z-10 flex items-center justify-center">

        <div className="absolute inset-0 bg-linear-to-tr from-slate-700 to-slate-900 lg:-skew-x-6 lg:origin-bottom lg:-translate-x-16 w-[150%] h-full -z-10 border-l border-slate-700/50"></div>

        <div className="w-full max-w-[450px] p-8 flex flex-col items-center gap-4">

          <FaTableTennisPaddleBall className="text-slate-900 w-16 h-16 drop-shadow-white" />

          <h1 className="text-3xl font-bold text-white tracking-wider">
            Welcome Back
          </h1>

          <form onSubmit={handleSubmit} className="w-full flex flex-col gap-5 mt-6">

            <div className="flex flex-col w-full group">
              <label className="text-slate-400 mb-2 ml-1 font-medium text-sm group-focus-within:text-white">Email</label>
              <input type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="px-4 py-3.5 rounded-xl bg-slate-900 text-slate-200 border border-slate-700
                 focus:ring-1  outline-none font-medium placeholder:text-slate-600"
                required
              />
            </div>

            <div className="flex flex-col w-full relative group">
              <label className="text-slate-400 mb-2 ml-1 font-medium text-sm group-focus-within:text-white "> Password</label>
              <div className="relative w-full">
                <input type={visiblePassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="***********"
                  className="w-full pr-10 px-4 py-3.5 rounded-xl bg-slate-900 text-slate-200 border border-slate-700
         focus:ring-1  outline-none font-medium placeholder:text-slate-600"
                  required
                />
                <span
                  onClick={() => setShowPassword(!visiblePassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-cyan-400 cursor-pointer 
   flex items-center justify-center h-full "
                >
                  {visiblePassword ? <FaRegEyeSlash size={18} /> : <FaRegEye size={18} />}
                </span>
              </div>


              <div className="flex justify-end w-full mt-2">
                <Link href="password"
                  className="text-xs text-slate-500 hover:text-slate-400 font-medium ">
                  Forgot Password ?
                </Link>
              </div>
            </div>
            <button type="submit"
              className={cn("cursor-pointer w-full mt-4 py-3.5 bg-slate-950 rounded-xl text-white font-bold tracking-wide hover:bg-slate-600 hover:scale-105 ",
                loadingSignIn && "opacity-70 cursor-not-allowed")}
            >
              {
                loadingSignIn ? "Signing In..." :
                  "Sign In"
              }
            </button>

            <div className="flex justify-center mt-2">
              <span className="text-slate-400 text-sm font-medium">
                Don&apos;t have an account?{' '}
                <Link href="/signup" className="text-white font-bold hover:text-cyan-400  ml-1">
                  Sign Up
                </Link>
              </span>
            </div>

          </form>
          <div className="flex items-center gap-4 mt-4 w-full opacity-50">
            <div className="flex-1 h-px bg-slate-600"></div>
            <span className="text-slate-500 font-semibold text-xs tracking-widest uppercase">
              Or continue with
            </span>
            <div className="flex-1 h-px bg-slate-600"></div>
          </div>

          <div className="flex justify-center gap-6 mt-2 w-full">
            <div onClick={() => {
              handleLoginWithGoogle();
            }}
              className="cursor-pointer p-3.5 bg-slate-900 border border-slate-700 rounded-xl
              hover:bg-slate-700  transition hover:-translate-y-1 "
            >
              <FcGoogle className="w-6 h-6 group-hover:scale-110 " />
            </div>
            <div onClick={() => {
              const redirectUri = process.env.NEXT_PUBLIC_REDIRECT_URI_42!;
              window.location.href = `${redirectUri}`;
            }}

              className="cursor-pointer p-3.5 bg-slate-900 border border-slate-700 rounded-xl
            hover:bg-slate-700  transition hover:-translate-y-1 "
            >
              <Si42 className="w-6 h-6 text-white group-hover:scale-110 " />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default SignIn;