"use client"
import api from '@/lib/api';
import { account } from '@/lib/appwrite';
import { Loader2 } from 'lucide-react';
import  { useEffect } from 'react'

function page() {
  useEffect(() => {
    const checkGoogleAuth = async () => {
      try {

        const session = await account.getSession('current');
        
        if (session) {

          const appwriteUser = await account.get();
          
          const res = await api.post("/auth/google-signin", {
            email: appwriteUser.email,
            name: appwriteUser.name,
            avatar: appwriteUser.prefs?.avatar || null,
          });

          if (res.data.message === "2FA required") {
            window.location.href = `twofa-gpage?userId=${res.data.userId}`;
            return;
          }
          else if (res.data.token) {
            window.location.href = "/home";
          }
        }
      } catch (error) {
      }
    };

    checkGoogleAuth();
  }, []);

  return (
    <div className='bg-black w-full h-screen flex items-center justify-center'>
      <Loader2 className='animate-spin text-green-500' size={100} />
    </div>
  )
}

export default page;