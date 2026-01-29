
import React, { useContext, useState } from "react";
import { GlobalContext } from '@/app/_hooks/global-store';
import { Shield } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import Setupdesabled from "./setupdesabled";
import SetupEnabled from "./setupenabled";

export default function TwoFactorAuth() {
  const { t } = useTranslation();
  const [isEnabled] = useState(false);

  const { user, } = useContext(GlobalContext)!;
  if (!user) {
    return null;
  }
  return (
    <section className="p-8 bg-linear-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl border border-white/5 shadow-xl">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6">

        <div className="flex items-center gap-4">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${isEnabled
                ? "bg-emerald-500/20 text-emerald-500"
                : "bg-zinc-800 text-zinc-500"
              }`}
          >
            <Shield size={24} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">
              {t("Settings.twoFactorAuth")}
            </h2>
            <p className="text-zinc-500 text-sm">
              {t("Settings.addExtraLayerSecurity")}
            </p>
          </div>
        </div>

        {user.twofa_enabled ? (
          // 
          <Setupdesabled />

        ) : (
          <SetupEnabled userId={user.id as number} />
        )}
      </div>
    </section>
  );
}
