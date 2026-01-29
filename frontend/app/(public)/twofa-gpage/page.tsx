"use client";
import { useState } from "react";
import { TbLockPassword } from "react-icons/tb";
import { IoAlertCircleOutline } from "react-icons/io5";
import { Monitor, Smartphone } from "lucide-react";
import api from "@/lib/api";
import { useRouter, useSearchParams } from "next/navigation";



import { Suspense } from "react";

function TwofaGContent() {
  const searchParams = useSearchParams();
  const userId = Number(searchParams.get("userId"));
  const [loading, setLoading] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const navigate = useRouter();

  const handlesubmit = async () => {
    if (code.length !== 6) {
      setError("Code must be 6 digits");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await api.post("/auth/sign2fa", { userId, code });
      navigate.push("/home");
    } catch {
      setError("An error occurred during verification.");
    }
    finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center bg-linear-to-br from-slate-800 to-slate-900 px-4 py-8">

      <div className="relative mb-12 flex items-center gap-6">
        <div className="relative">
          <div className="w-40 h-32 bg-linear-to-br from-slate-700 to-slate-900 rounded-lg border-2 border-slate-600 flex items-center justify-center">
            <Monitor className="w-12 h-12 text-slate-400" />
          </div>

          <div className="w-20 h-2 bg-slate-700 mx-auto mt-2 rounded-t-lg"></div>
          <div className="w-28 h-1 bg-slate-600 mx-auto rounded"></div>
        </div>

        <div className="flex flex-col items-center gap-1">
          <div className="w-8 h-0.5 bg-slate-500"></div>
          <div className="w-0 h-0 border-t-4 border-t-transparent border-l-8 border-l-slate-500 border-b-4 border-b-transparent"></div>
        </div>

        <div className="relative">
          <div className="w-24 h-40 bg-linear-to-br from-slate-700 to-slate-900 rounded-2xl border-2 border-slate-600 p-3 flex flex-col items-center justify-between">
            <div className="w-8 h-1 bg-slate-600 rounded-full"></div>
            <div className="flex-1 flex items-center justify-center">
              <Smartphone className="w-8 h-8 text-slate-400" />
            </div>
            <div className="bg-slate-800 px-3 py-2 rounded-lg">
              <span className="text-white text-sm font-bold">968321</span>
            </div>
          </div>
        </div>
      </div>

      <h1 className="text-4xl font-bold text-white mb-6 text-center tracking-wide whitespace-nowrap">
        Two-Factor Authentication
      </h1>


      <p className="text-slate-400 text-center mb-10 font-semibold text-base max-w-lg leading-relaxed px-4">
        Sign in requires your device's security code to verify your identity.
      </p>


      {error && (
        <div className="flex items-center justify-center gap-2 text-red-400 text-sm mb-4 bg-red-500/10 px-4 py-2 rounded-lg border border-red-500/30 max-w-md mx-auto">
          <IoAlertCircleOutline size={16} />
          <span>{error}</span>
        </div>
      )}


      <div className="relative w-full max-w-md mb-8 group">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-white transition-colors">
          <TbLockPassword size={24} />
        </div>
        <input
          type="text"
          value={code}
          onChange={(e) => {
            const value = e.target.value.replace(/\D/g, "");
            if (value.length <= 6) {
              setCode(value);
              setError("");
            } else {
              setError("Maximum 6 digits allowed");
            }
          }}
          maxLength={6}
          className="w-full pl-14 pr-4 py-4 bg-slate-900/50 text-slate-200 rounded-xl 
                     border-2 border-slate-700 focus:border-slate-500 outline-none
                     text-center tracking-[0.5em] text-xl font-medium
                     placeholder:text-slate-600 placeholder:tracking-normal
                     transition-all"
          placeholder="Enter your digit code"
        />
      </div>
      <button
        onClick={handlesubmit}
        disabled={loading || code.length !== 6}
        className="w-full max-w-md py-4 px-6 bg-slate-950 text-white rounded-xl font-bold text-lg tracking-wide
                   hover:bg-slate-600 hover:scale-[1.02] transition-all
                   disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
      >
        {loading ? "Verifying..." : "Submit"}
      </button>
    </div>
  );
}

function TwofaGPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">Loading...</div>}>
      <TwofaGContent />
    </Suspense>
  );
}

export default TwofaGPage;