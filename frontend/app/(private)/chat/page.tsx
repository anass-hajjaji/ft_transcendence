"use client";
import React from "react";
import Image from "next/image";
import { useTranslation } from "@/lib/i18n";

export default function ChatWelcomePage() {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col min-w-[400px] items-center justify-center h-full gap-4">
      <h2 className="text-2xl font-bold text-white">{t("ChatWelcomePage.title")}</h2>
      <Image
        src="/icons/icons8-message-96.png"
        alt="Messages"
        width={50} 
        height={50}
      />
      <p className="text-gray-950 text-xl"
      >{t("ChatWelcomePage.description")}</p>
    </div>
  );
}
