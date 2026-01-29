"use client"
import React, { useEffect, useState } from "react";

import { FaRegEye, FaRegEyeSlash, FaTableTennisPaddleBall } from "react-icons/fa6";
import api from "@/lib/api";

import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { DotLottiePlayer } from '@dotlottie/react-player';
import Link from "next/link";
import { deleteCookie } from "@/app/(private)/_components/layout/clearCookies";


function SignUp() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [visiblePassword, setShowPassword] = useState(false);
  const [visibleConfirm, setShowConfirm] = useState(false);
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [confirmp, setConfirmP] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const hasAuthCookie = document.cookie.split(';').some(cookie => 
      cookie.trim().startsWith('access_token=') || 
      cookie.trim().startsWith('refresh_token=') ||
      cookie.trim().startsWith('session=')
    );
    
    if (hasAuthCookie) {
      api.post("/auth/signout").catch(() => {});
    }
    
    deleteCookie("access_token");
    deleteCookie("refresh_token");
  }, []);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 6) {
      toast.error("Password be at least 6 characters.");
      return;
    }
    if (password !== confirmp) {
      setError("Incorrect password");
      return;
    }
    try {
      await api.post("/auth/signup", {
        email,
        password,
        username,
        fullName,

      })
      toast.success("Account created successfully. Please sign in.");
      router.push("/signin");
    }
    catch (error) {
      const err = error as Error & { response?: { status: number; data: { details?: { field: string; message: string }[]; error?: string } } };
      if (err.response?.status === 400 && err.response?.data?.details) {
        err.response.data.details.forEach((detail: { field: string; message: string }) => {
          toast.error(`${detail.field}: ${detail.message}`);
        });
      } else if (err.response?.data?.error) {
        toast.error(String(err.response.data.error));
      } else {
        toast.error("An error has occurred, please try again.");
        setError("An error has occurred, please try again.");
      }
    }
  }

  return (
    <div className="w-full h-screen flex bg-black overflow-hidden relative">

      <div className="hidden lg:flex w-1/2 h-full items-center justify-center p-8 relative z-20">

        <div className="w-[60%] h-[60%] flex items-center justify-center opacity-90">
          <DotLottiePlayer
            src="/xo.lottie"
            loop
            autoplay
            className="w-full h-full"
          />
        </div>
      </div>

      <div className="w-full lg:w-1/2 h-full relative z-30 flex items-center justify-center overflow-y-auto">

        <div className="absolute inset-0 bg-linear-to-tr from-slate-700 to-slate-900 lg:-skew-x-6 lg:origin-bottom w-[120%] h-full -z-10 border-l border-slate-700/50"></div>

        <div className="w-full max-w-[500px] p-8 flex flex-col items-center gap-4 my-auto">

          <FaTableTennisPaddleBall className="text-slate-900 w-16 h-16 drop-shadow-white" />

          <h1 className="text-3xl font-bold text-white tracking-wider">
            Create Account
          </h1>
          <form onSubmit={handleSubmit} className="w-full flex flex-col gap-5 mt-6">
            <div className="flex flex-col w-full group">
              <label className="text-slate-400 mb-2 ml-1 font-medium text-sm group-focus-within:text-white">Username</label>
              <input type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="your  username"
                className="px-4 py-3.5 rounded-xl bg-slate-900 text-slate-200 border border-slate-700
                focus:ring-1  outline-none font-medium placeholder:text-slate-600"
                required
              />
            </div>
            <div className="flex flex-col w-full group">
              <label className="text-slate-400 mb-2 ml-1 font-medium text-sm
                 group-focus-within:text-white ">Full Name</label>
              <input type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="your  full name"
                className="px-4 py-3.5 rounded-xl bg-slate-900 text-slate-200 border
                border-slate-700  focus:ring-1 outline-none font-medium placeholder:text-slate-600"
                required
              />
            </div>
            <div className="flex flex-col w-full group">
              <label className="text-slate-400 mb-2 ml-1 font-medium text-sm
               group-focus-within:text-white ">Email</label>
              <input type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="px-4 py-3.5 rounded-xl bg-slate-900 text-slate-200 border
                border-slate-700  focus:ring-1  outline-none font-medium placeholder:text-slate-600"
                required
              />
            </div>

            <div className="flex flex-col w-full relative group">
              <label className="text-slate-400 mb-2 ml-1 font-medium text-sm group-focus-within:text-white">Password</label>
              <div className="relative w-full">
                <input type={visiblePassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}

                  placeholder="***********"
                  className="w-full pr-10 px-4 py-3.5 rounded-xl bg-slate-900 text-slate-200 border border-slate-700 focus:border-slate-500
         focus:ring-1 outline-none font-medium placeholder:text-slate-600"
                  required />

                <span
                  onClick={() => setShowPassword(!visiblePassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white cursor-pointer flex items-center justify-center "
                >
                  {visiblePassword ? <FaRegEyeSlash size={18} /> : <FaRegEye size={18} />}
                </span>
              </div>
            </div>

            <div className="flex flex-col w-full relative group">
              <label className="text-slate-400 mb-2 ml-1 text-sm group-focus-within:text-white ">Repeat Password</label>
              <div className="relative w-full">
                <input type={visibleConfirm ? "text" : "password"}
                  value={confirmp}
                  onChange={(e) => setConfirmP(e.target.value)}
                  placeholder="***********"
                  className="w-full pr-10 px-4 py-3.5 rounded-xl bg-slate-900 text-slate-200 border border-slate-700 focus:border-slate-500 
          focus:ring-1 outline-none font-medium
         placeholder:text-slate-600 "
                  required
                />
                <span
                  onClick={() => setShowConfirm(!visibleConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white cursor-pointer flex items-center justify-center "
                >
                  {visibleConfirm ? <FaRegEyeSlash size={18} /> : <FaRegEye size={18} />}
                </span>

              </div>
            </div>

            <button type="submit"
              className=" w-full mt-4 py-3.5 bg-slate-950 rounded-xl text-white font-bold tracking-wide
      hover:bg-slate-600 hover:scale-105"
            >
              Sign Up
            </button>

            <div className="flex justify-center mt-2">
              <span className="text-slate-400 text-sm">
                Already have an account?{' '}
                <Link href="/signin" className="text-white hover:text-cyan-400 font-semibold">
                  Sign In
                </Link>
              </span>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}


export default SignUp;