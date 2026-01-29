"use client";

import React, { useState, useRef, useEffect } from "react";
import { Settings } from "lucide-react";
import Link from "next/link";


import api from "@/lib/api";
import { toast } from "react-toastify";
import { deleteCookie } from "./clearCookies";
import { useTranslation } from "@/lib/i18n";


export default function TopBar() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-20 h-16 flex items-center justify-end gap-4 px-6 z-40">
      <Link href="/settings" className="flex items-center justify-center text-gray-400 hover:text-gray-100 transition-colors">
        <Settings size={22} />
      </Link>
      <button
        onClick={async () => {
          try {

            deleteCookie("access_token");
            deleteCookie("refresh_token");
            
            await api.post("/auth/signout").catch(() => {});
            
            toast.success(t("TopBar.logoutSuccess"));
            
            window.location.href = "/signin";
          } catch (error) {

            deleteCookie("access_token");
            deleteCookie("refresh_token");
            window.location.href = "/signin";
          }
        }}
        className="px-4 py-2 rounded-lg text-gray-400 hover:text-gray-100 hover:bg-zinc-800 transition-colors">
        <i className="fas fa-sign-out-alt"></i> {t("TopBar.logout")}
      </button>
    </header>
  );
}
