"use client";

import React, { useState } from "react";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { GlobalContext } from "@/app/_hooks/global-store";
import { I18nProvider } from "@/lib/i18n";

import LeftSidebar from "./_components/layout/LeftSidebar";
import RightSidebar from "./_components/layout/RightSidebar";
import TopBar from "./_components/layout/TopBar";
import { useLayoutData } from "./_components/layout/useLayoutData";
import { NotificationProvider } from "./_components/layout/NotificationContext";

export default function LayoutPrivate({ children }: Readonly<{ children: React.ReactNode }>) {
  const { user, setUser, isLoading, error } = useLayoutData();

  const [open, setOpen] = useState(true);

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen bg-black text-white">Loading...</div>;
  }

  if (error) {
    return <div className="flex items-center justify-center min-h-screen bg-black text-white">Error loading user data.</div>;
  }

  if (!user) {
    return <div className="flex items-center justify-center min-h-screen bg-black text-white">User not authenticated.</div>;
  }
  return (
    <GlobalContext.Provider value={{ user, setUser }}>
      <I18nProvider>
        <NotificationProvider user={user}>
          <div className="relative">
            <TopBar />

            <LeftSidebar
              open={open}
              setOpen={setOpen}
              user={user}
            />

            <RightSidebar
              currentUserId={user.id_user}
            />

            <div 
              className="relative min-h-screen"
              style={{
                backgroundImage: 'url(/background.jpg)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                backgroundAttachment: 'fixed',
              }}
            >
              <div className="absolute inset-0 bg-black/80 z-0"></div>
              
              <div className={`relative z-10 transition-all duration-300 ${open ? "ml-75" : "ml-29"} mr-26`}>
                {children}
              </div>
            </div>
          </div>
        </NotificationProvider>
      </I18nProvider>
    </GlobalContext.Provider>
  );
}
