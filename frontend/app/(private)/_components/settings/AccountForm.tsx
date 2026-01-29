"use client"

import React from "react";
import { User, Mail, FileText } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

interface AccountFormData {
  username?: string;
  fullName?: string;
  email?: string;
}

interface AccountFormProps {
  data: AccountFormData;
  setData: React.Dispatch<React.SetStateAction<any>>;
}

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon: React.ReactNode;
}

export default function AccountForm({ setData, data }: AccountFormProps) {
  const { t } = useTranslation();
  return (
    <section className="p-8 bg-linear-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl border border-white/5 shadow-xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-4 border-b border-zinc-800 pb-6">
        <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
          <User size={24} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">{t("Settings.accountInformation")}</h2>
          <p className="text-slate-400 text-sm">{t("Settings.updateProfileDetails")}</p>
        </div>
      </div>

      <div className="space-y-6 max-w-2xl">
        <InputField
          label={t("Settings.username")}
          name="username"
          icon={<User size={18} />}
          placeholder="e.g. PongMaster99"
          value={data?.username || ""}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData((prev: any) => ({
            ...prev,
            account: {
              ...prev.account || {},
              username: e.target.value
            }
          }))}
        />
        <InputField
          label={t("Settings.fullName")}
          name="fullName"
          icon={<FileText size={18} />}
          placeholder="e.g. John Doe"
          value={data?.fullName || ""}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData((prev: any) => ({
            ...prev,
            account: {
              ...prev.account || {},
              fullName: e.target.value
            }
          }))}
        />

        <InputField
          label={t("Settings.emailAddress")}
          name="email"
          type="email"
          icon={<Mail size={18} />}
          placeholder="john@example.com"
          value={data?.email || ""}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData((prev: any) => ({
            ...prev,
            account: {
              ...prev.account || {},
              email: e.target.value
            }
          }))}
        />

      </div>
    </section>
  );
}


function InputField({ label, icon, ...props }: InputFieldProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-300 mb-2 ml-1">{label}</label>
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-500 group-focus-within:text-emerald-500 transition-colors">
          {icon}
        </div>
        <input
          {...props}
          className="w-full bg-black/40 border border-zinc-700 rounded-xl py-3.5 pl-11 pr-4 text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
        />
      </div>
    </div>
  );
}