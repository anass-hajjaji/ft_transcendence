
"use client"
import React, {useState} from "react";
import Link from "next/link";
import api from "@/lib/api";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
const sendforgotpassword = async (email : string) => {
   try{
    await api.post("/auth/declareforgotpassword", {email: email});
   }catch(error){
     throw error;
   }
}

function Forgot() {
    const [email, setEmail] = useState<string>("");
    const router = useRouter();
    return (
     <div className="w-full h-screen flex items-center justify-center bg-black overflow-hidden">
     <div className="w-full max-w-[600px] p-8 bg-slate-900 flex flex-col items-center gap-4 rounded-xl  z-10">
        <h1 className="text-3xl md:text-3xl font-semibold text-white tracking-wider"> Forgot your password</h1>
        <p className= "text-slate-400 mb-3 text-center">Provide your email to receive a password reset link.</p>
        <div className="flex flex-col w-full relative group">
            <label className="text-slate-400 mb-3 ml-1 text-s">
              Email address
            </label>
            <input type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="px-4 py-3.5 rounded-xl text-slate-200 border border-slate-500 focus:ring-0.5 placeholder:text-slate-600"
              required />
          </div>

          <button type="button"
          onClick={() => sendforgotpassword(email).then(() => {
             toast.success("Reset code sent to your email.");
             setTimeout(() => {
              router.push("/reset");
             }, 500);
          }).catch((error) => {
            toast.error("Error sending reset code. Please try again.");
          })}
          className="w-full mt-4 py-3.5 rounded-xl bg-slate-950 rouneded-xl text-white font-bold tracking-wide
           hover:bg-slate-700  transition transform">
          Send Reset Password </button>
           <div className="flex justify-center mt-2">
            <span className="text-slate-400 text-sm">
              Remember your password ?{' '}
              <Link href="/signin" className=" w-full mt-4 py-3.5text-white hover:text-cyan-400 font-semibold hover:bg-slate-700 hover:scale-105">
                Sign In
              </Link>
            </span>
          </div>

          </div>
          </div>
    );
}


export default Forgot;