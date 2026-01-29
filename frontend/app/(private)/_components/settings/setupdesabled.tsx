

import React from 'react'

import { useState } from "react";
import { TbLockPassword } from "react-icons/tb";
import { toast } from "react-toastify";
import { Lock } from "lucide-react";
import api from "@/lib/api";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { GlobalContext } from '@/app/_hooks/global-store';



function Setupdesabled({}) {
      const [code, setCode] = useState("");
      const [loading, setLoading] = useState(false);
      const {setUser, user} = React.useContext(GlobalContext)!;
    
  
    
      const handleDisable2FA = async () => {
        if (code.length !== 6) {
          toast.error("Code must be 6 digits");
          return;
        }
    
        setLoading(true);
        try {
          await api.post("/2fa/disabled", { code , userId: user?.id_user });
          toast.success("2FA disabled successfully");
          setUser((prev) => prev ? { ...prev, twofa_enabled: false } : prev);
          setCode("");
        } catch  {
          toast.error("Invalid code. Please try again.");
        } finally {
          setLoading(false);
        }
      };
    
  return (
    <Dialog>
  <DialogTrigger>
     <div
      role='button'
            className="px-6 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2
                       bg-red-600 hover:bg-red-700 text-white"
          >
            <Lock size={16} />
            Disable
          </div>
  </DialogTrigger>
  <DialogContent className="">
    <DialogHeader>
      <DialogTitle>
        <p className="text-red-300 text-sm text-center">
              Disabling 2FA will make your account less secure. Enter your
              authenticator code to confirm.
            </p>
      </DialogTitle>
      <DialogDescription className="sr-only">
        Enter your authenticator code to disable two-factor authentication
      </DialogDescription>

      <div className="relative w-full mb-6">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-red-400">
              <TbLockPassword size={20} />
            </div>
            <input
              type="text"
              value={code}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "");
                if (value.length <= 6) {
                  setCode(value);
                }
              }}
              placeholder="Enter 6-digit code"
              maxLength={6}
              className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-slate-900 text-slate-200 
                         border border-slate-700 focus:border-red-500 focus:ring-1 
                         focus:ring-red-500 outline-none text-center tracking-widest
                         text-lg font-mono"
            />
          </div>

          <div className="w-full flex gap-3">
            <button
              onClick={() => {}}
              className="flex-1 py-3 bg-slate-700 rounded-xl text-white font-medium
                         hover:bg-slate-600 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleDisable2FA}
              disabled={loading || code.length !== 6}
              className={cn(
                "flex-1 py-3 bg-red-600 rounded-xl text-white font-bold",
                "hover:bg-red-500 transition-all",
                "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-red-600"
              )}
            >
              {loading ? "Disabling..." : "Disable 2FA"}
            </button>
          </div>

    </DialogHeader>
  </DialogContent>
</Dialog>
    
  )

}

export default Setupdesabled