"use client";

import { useState, useEffect } from "react";
import { IoClose } from "react-icons/io5";
import { FaShieldAlt } from "react-icons/fa";
import { TbLockPassword } from "react-icons/tb";
import { toast } from "react-toastify";
import api from "@/lib/api";
import Image from "next/image";
import { cn } from "@/lib/utils";


export default function Page( { userId }: { userId: number } ) {
  const [code, setCode] = useState("");
  const [isOpen, setIsOpen] = useState(true);
    const [loading, setLoading] = useState(false);

    const [loadingSetup, setLoadingSetup] = useState(false);

    const [qrcode, setQrcode] = useState("");


    useEffect(() => {
      const Qrcode2fa = async () => {
        setLoading(true);
        try {
          const result = await api.post("/2fa/setup", { userId});
          setQrcode(result.data.qrcode);

        } catch (error) {
          toast.error("Error fetching QR code");
        
        } finally {
          setLoading(false);
        }
      };
      Qrcode2fa();
    }, [userId]);

    
  if (!isOpen) return null;
  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-black/70 backdrop-blur-sm" >
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }


  const handleEnable2FA = async () => {

    if (code.length !== 6) {
      toast.error("Code must be 6 digits");
      return;
    }

   setLoadingSetup(true);
    try {
       await api.post("/2fa/enabled", { code });
      toast.success("2FA enabled successfully");
      setIsOpen(false);
    } catch{
      toast.error("Error enabling 2FA");
    } finally {
      setLoadingSetup(false);
    }
   
  };

  return (
    <div className="w-full h-screen flex items-center justify-center bg-black/70 backdrop-blur-sm" >
      <div className="relative w-[90%] max-w-[500px] rounded-xl overflow-hidden
                      bg-linear-to-br from-slate-800 to-slate-900 
                      border border-slate-700/50 shadow-2xl">
        
  <div className="relative bg-linear-to-r from-slate-700 to-slate-800 py-4 px-6 border-b border-slate-700/50">
          <h2 className="text-white text-xl">
           Two-Factor Authentication (2FA)
          </h2>

          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-1/2 -translate-y-1/2 right-4 text-slate-400 
             hover:text-cyan-400 transition-colors"
          >
            <IoClose size={24}  />
          </button>
        </div>



        <div className="p-8 flex flex-col items-center">

          <div className="mb-6 p-4 bg-white rounded-lg">
            {qrcode && (
              <Image 
                src={qrcode}
                alt="2FA QR Code" 
                width={200} 
                height={200} 
              />
            )}
          </div>

           <p className="text-gray-300 text-center mb-6 text-semibold">
          Enter generated code by your chosen<br />authenticator app
      </p>

          <div className="relative w-full mb-6">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-400">
                <TbLockPassword size={18} />
            </div>
            <input 
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Enter code "
              maxLength={6}
              className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-slate-900 text-slate-200 
             border border-slate-700 focus:ring-1 outline-none"
            />
          </div>
          <button
            onClick={() => handleEnable2FA()}
            disabled={loading} 
            className={cn("cursor-pointer w-full py-3.5 bg-slate-950 rounded-xl  text-white font-bold tracking-wide hover:bg-slate-600 hover:scale-105 transition-all flex items-center justify-center gap-2", loadingSetup && "opacity-50 cursor-not-allowed") }
          >
            <FaShieldAlt size={16} />
            {loadingSetup ? "Enabling..." : "Enable 2FA"}
          </button>
        </div>
      </div>
    </div>
  );
}