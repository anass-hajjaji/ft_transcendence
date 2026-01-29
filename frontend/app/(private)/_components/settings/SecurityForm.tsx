"use client";
import React from "react";
import { Shield, Lock } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

interface SecurityFormData {
  currentPassword?: string;
  newPassword?: string;
  confirmNewPassword?: string;
}

interface SecurityFormProps {
  data: SecurityFormData;
  setData: React.Dispatch<React.SetStateAction<any>>;
}

interface PasswordFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export default function SecurityForm({ setData, data }: SecurityFormProps) {
  const { t } = useTranslation();

  return (
    <section className="p-8 bg-linear-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl border border-white/5 shadow-xl">
      <div className="flex items-center gap-4 mb-4 border-b border-zinc-800 pb-6">
        <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
          <Shield size={24} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">{t("Settings.security")}</h2>
          <p className="text-slate-400 text-sm">{t("Settings.managePasswordAuthentication")}</p>
        </div>
      </div>

      <div className="space-y-6 max-w-2xl">
        <PasswordField
          label={t("Settings.currentPassword")}
          value={data?.currentPassword || ""}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData((prev: any) => ({
            ...prev,
            security: {
              ...prev.security || {},
              currentPassword: e.target.value
            }
          }))}
          name="current"
          placeholder={t("Settings.enterCurrentPassword")}
        />
        <PasswordField
          label={t("Settings.newPassword")}
          value={data?.newPassword || ""}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData((prev: any) => ({
            ...prev,
            security: {
              ...prev.security || {},
              newPassword: e.target.value
            }
          }))}
          name="new"
          placeholder={t("Settings.enterNewPassword")}
        />
        <PasswordField
          label={t("Settings.confirmPassword")}
          value={data?.confirmNewPassword || ""}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData((prev: any) => ({
            ...prev,
            security: {
              ...prev.security || {},
              confirmNewPassword: e.target.value
            }
          }))}
          name="confirm"
          placeholder={t("Settings.reenterNewPassword")}
        />

      </div>
    </section>
  );
}

function PasswordField({ label, ...props }: PasswordFieldProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-300 mb-2 ml-1">{label}</label>
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-500 group-focus-within:text-emerald-500 transition-colors">
          <Lock size={18} />
        </div>
        <input
          type="password"
          {...props}
          className="w-full bg-black/40 border border-zinc-700 rounded-xl py-3.5 pl-11 pr-4 text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
        />
      </div>
    </div>
  );
}