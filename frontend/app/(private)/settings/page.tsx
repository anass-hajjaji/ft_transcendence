"use client";

import React, {useState, useContext } from "react";

import { Loader, Save } from "lucide-react";
import ProfileAvatar from "../_components/settings/ProfileAvatar"
import AccountForm from "../_components/settings/AccountForm"
import SecurityForm from "../_components/settings/SecurityForm"
import api from "@/lib/api";
import { toast } from "react-toastify";
import { cn } from "@/lib/utils";

import { GlobalContext } from "@/app/_hooks/global-store";
import TwoFactorAuth from "../_components/settings/TwoFactorAuth";
import LanguageSettings from "../_components/settings/LanguageSettings";
import { useTranslation } from "@/lib/i18n";


export default function SettingsPage() {
  const { user } = useContext(GlobalContext)!;
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<{
    account?: {
      username: string;
      fullName: string;
      email: string;
    };
    security?: {
      currentPassword: string;
      newPassword: string;
      confirmNewPassword: string;
    };
  }>({
    account: {
      username: "",
      fullName: "",
      email: ""
    },
  });

  const handleSave = async () => {
    setLoading(true);
    try {
      const accountPayload: any = {};
      let hasAccountChanges = false;

      if (data.account?.username?.trim()) {
        accountPayload.username = data.account.username.trim();
        hasAccountChanges = true;
      } else if (user?.username) {
        accountPayload.username = user.username;
      }

      if (data.account?.fullName?.trim()) {
        accountPayload.fullName = data.account.fullName.trim();
        hasAccountChanges = true;
      } else if (user?.fullName) {
        accountPayload.fullName = user.fullName;
      }

      if (data.account?.email?.trim()) {
        accountPayload.email = data.account.email.trim();
        hasAccountChanges = true;
      } else if (user?.email) {
        accountPayload.email = user.email;
      }

      if (data.security) {
        if (
          !data.security.currentPassword ||
          !data.security.newPassword ||
          !data.security.confirmNewPassword
        ) {
          toast.error("Please fill in all password fields.");
          setLoading(false);
          return;
        }
      }

      const apiCalls = [];

      if (hasAccountChanges) {
        console.log('Sending account update:', accountPayload);
        apiCalls.push(
          api.post("/auth/account", accountPayload)
        );
      }

      if (data.security) {
        apiCalls.push(
          api.post("/auth/change-password", {
            ...data.security
          })
        );
      }

      if (apiCalls.length === 0) {
        toast.info("No changes to save.");
        setLoading(false);
        return;
      }

      const results = await Promise.allSettled(apiCalls);

      const failed = results.find(r => r.status === 'rejected');
      if (failed && failed.status === 'rejected') {
        const error = failed.reason?.response?.data?.error || failed.reason?.message || "Failed to save settings";
        toast.error(error);
        setData((prev: typeof data) => ({ ...prev, security: undefined }));
        setLoading(false);
        return;
      }

      setData((prev: typeof data) => ({ ...prev, security: undefined }));
      toast.success("Settings saved successfully!");
    } catch (error: any) {
      const errorMessage = error?.response?.data?.error || error?.message || "Failed to save settings. Please try again.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }

  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <p>Loading...</p>
      </div>
    );
  }

  const { t } = useTranslation();
  return (
    <div className="min-h-screen  text-white p-6 md:p-12 pb-24">
      <div className="max-w-5xl mx-auto space-y-4">
        {/* Page Header */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-zinc-800">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">
              Settings
            </h1>
            <p className="text-slate-400 text-lg">
              {t("Settings.subtitle")}
            </p>
          </div>
          <button
            onClick={handleSave}
            disabled={loading}
            className={cn("flex items-center gap-2  hover:text-emerald-500 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-emerald-900/20 transition-all hover:scale-105",
              loading && "opacity-50 cursor-not-allowed"
            )}
          >
            {loading && <Loader className="animate-spin" size={20} />}
            <Save size={25} />

          </button>
        </header>

        <ProfileAvatar />
        <AccountForm setData={setData} data={data.account ?? {}} />
        <SecurityForm setData={setData} data={data.security ?? {}} />
        <TwoFactorAuth />
        <LanguageSettings />

      </div>
    </div>
  );
}