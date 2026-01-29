"use client"
import api from '@/lib/api';
import { Loader2 } from 'lucide-react';
import { useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation';

function AuthContent() {
  const urlParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const checkIntraAuth = async () => {
      try {
        const code = urlParams.get('code');

        if (code) {
          const res = await api.post("/auth/intra-signin", { code });

          if (res.data.message === "2FA required") {
            router.push(`/twofa-intrapage?userId=${res.data.userId}`);
          } else if (res.data.token) {
            router.push("/home");
          }
        }
      } catch (error) {
      }
    };

    checkIntraAuth();
  }, [urlParams, router]);

  return (
    <div className='bg-black w-full h-screen flex items-center justify-center'>
      <Loader2 className='animate-spin text-green-500' size={100} />
    </div>
  )
}

function Page() {
  return (
    <Suspense fallback={
      <div className='bg-black w-full h-screen flex items-center justify-center'>
        <Loader2 className='animate-spin text-green-500' size={100} />
      </div>
    }>
      <AuthContent />
    </Suspense>
  )
}

export default Page;