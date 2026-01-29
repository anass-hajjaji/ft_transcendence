"use client";

import React, { useContext } from "react";
import { GlobalContext } from "@/app/_hooks/global-store";
import AboutPageClient from "./AboutPageClient";

export default function AboutPageWrapper() {
  const context = useContext(GlobalContext);

  if (!context || !context.user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return <AboutPageClient user={context.user} />;
}