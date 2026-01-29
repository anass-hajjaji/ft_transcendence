
"use client"
import React, {useState} from "react";
import {FaRegEye ,FaRegEyeSlash} from "react-icons/fa6";
import { toast } from "react-toastify";
import api from "@/lib/api";  
import { useRouter } from "next/navigation";


const sendresetpassword = async (data : {token:string, password:string, confirmPassword:string}) => {
   try{
    await api.post("/auth/resetpassword", data);
    }catch(error){
        throw error;
    }
}

function Reset() {
       const [password, setPassword] = useState("");
       const [visiblePassword ,setShowPassword] = useState(false);
       const [visibleShowConfirm, setShowConfirm] = useState(false);
       const [confirmPassword, setConfirmPassword] = useState("");
       const [code, setCode] = useState("");
        const router = useRouter();
       
    return(
     <div className="w-full h-screen flex items-center justify-center bg-black overflow-hidden">
     <div className="w-full max-w-[600px] p-8 bg-slate-900 flex flex-col items-center gap-4 rounded-xl  z-10"> 
      <h1 className="text-3xl md:text-3xl font-semibold text-white tracking-wider"> Reset your password</h1>
      
         <form className="w-full flex flex-col gap-4" onSubmit={(e) => {
          e.preventDefault();
          sendresetpassword({token: code, password, confirmPassword}).then(() => {
              toast.success("Password changed successfully.");
              setTimeout(() => {
                router.push("/signin");
               }, 500);
          }).catch((error) => {
              toast.error("Error changing password. Please try again.");
          })
         }}>

      <div className="flex flex-col w-full relative">
          <label className="text-slate-400 mb-2 ml-1 text-sm"> Code</label>
          <input type= {"text"}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Enter code"
            className=" w-full px-4 py-3.5 rounded-xl text-slate-200 border border-slate-500 focus:ring-1 placeholder:text-slate-600"
                  required />

        </div>

        <div className="flex flex-col w-full relative">
          <label className="text-slate-400 mb-2 ml-1 text-sm"> Password</label>
          <div className="relative w-full">
          <input type= {visiblePassword ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter new password"
          className="w-full  px-4 py-3.5 rounded-xl text-slate-200 border border-slate-500 focus:ring-1 placeholder:text-slate-600" 
          required />
    
        <span 
        onClick={() => setShowPassword(!visiblePassword)}
         className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400  flex items-center justify-center ">
                  {visiblePassword ? <FaRegEyeSlash size={18}/> : <FaRegEye size={18}/>}
          </span>
        </div>
        </div>
    
          <div className="flex flex-col w-full relative">
          <label className="text-slate-400 mb-2 ml-1 text-sm"> Confirm your  Password</label>
          <div className="relative w-full">
          <input type= {visibleShowConfirm ? "text" : "password"}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="***********"
             className="w-full pr-10 px-4 py-3.5 rounded-xl bg-slate-900 text-slate-200 border border-slate-500
               focus:ring-white  placeholder:text-slate-600 "
                  required />
           <span 
        onClick={() => setShowConfirm(!visibleShowConfirm)}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400  flex items-center justify-center ">
                  {visibleShowConfirm ? <FaRegEyeSlash size={18}/> : <FaRegEye size={18}/>}
          </span>
      </div>
      </div>
      <button type="submit"
      className="w-full mt-4 py-3.5 bg-slate-950 rounded-xl text-white font-bold tracking-wide hover:bg-slate-700 hover:scale-105 "
            > Change Password</button>
        </form>  
      </div>
      </div>
    );
}

export default Reset;