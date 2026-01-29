import React, {useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Unlock } from 'lucide-react'
import api from '@/lib/api'
import { toast } from 'react-toastify'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { FaShieldAlt } from "react-icons/fa";
import { TbLockPassword } from "react-icons/tb";
import { GlobalContext } from '@/app/_hooks/global-store'
function SetupEnabled({ userId }: { userId: number }) {
    const [code, setCode] = useState("");
    const [isOpen, setIsOpen] = useState(true);
      const [loading, setLoading] = useState(false);
      const { setUser} = React.useContext(GlobalContext)!;
  
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
        setUser((prev) => prev ? { ...prev, twofa_enabled: true } : prev);
        setIsOpen(false);
      } catch {
        toast.error("Error enabling 2FA");
      } finally {
        setLoadingSetup(false);
      }
     
    };
  return (
    <Dialog>
  <DialogTrigger>
     <div
     role='button'

    className="px-6 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2
                       bg-emerald-600 hover:bg-emerald-700 text-white"
          >
    <Unlock size={16} />
      Enable
    </div>
  </DialogTrigger>
  <DialogContent className="bg-linear-to-r from-slate-700 to-slate-800 py-4 px-6 border-b border-slate-700/50">
    <DialogHeader>
      <DialogTitle className="text-white text-xl">Enable Two-Factor Authentication</DialogTitle>
      <DialogDescription className="text-slate-300">
        Scan the QR code with your authenticator app and enter the code to enable 2FA
      </DialogDescription>
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
    </DialogHeader>
  </DialogContent>
</Dialog>
  )
}

export default SetupEnabled