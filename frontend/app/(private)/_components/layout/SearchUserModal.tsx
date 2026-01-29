import React, { useEffect, useState } from "react";
import { UserProfile } from "./types";
import api from "@/lib/api";
import { useTranslation } from "@/lib/i18n";

interface Props {
  onClose: () => void;
  onSelectUser: (user: UserProfile) => void;
}

export default function SearchUserModal({ onClose, onSelectUser }: Props) {
  const { t } = useTranslation();
  const [q, setQ] = useState("");
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!q.trim()) {
      setUsers([]);
      return;
    }

    const timeout = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await api.get(`/users/search?q=${q}`);
        setUsers(res.data);
      } catch (error) {
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [q]);

  return (
    <div className="fixed inset-0 bg-black/80 flex items-start justify-center backdrop-blur-sm pt-20">
      <div className="bg-[#111] w-200 rounded-2xl p-6 space-y-4 relative border border-emerald-500/20">

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-emerald-500 transition-colors p-1"
        >
          <i className="fas fa-times text-xl"></i>
        </button>

        <h2 className="text-white text-lg font-bold flex items-center gap-2">
          <i className="fas fa-search text-emerald-500"></i>
          {t("SearchUserModal.title")}
        </h2>

        <div className="relative">
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t("SearchUserModal.placeholder")}
            className="w-full px-4 py-3 rounded-xl bg-gray-800/50 text-white border border-gray-700 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
          />
        </div>

        <div className="max-h-72 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
          {loading && (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-500"></div>
            </div>
          )}

          {users.map((user) => (
            <div
              key={user.id_user}
              onClick={() => onSelectUser(user)}
              className="flex items-center justify-between p-3 rounded-xl cursor-pointer hover:bg-emerald-500/10 border border-transparent hover:border-emerald-500/30 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center border border-gray-700 ">
                  <i className="fas fa-user text-emerald-500"></i>
                </div>
                <span className="text-gray-200 font-medium group-hover:text-white">
                  {user.username}
                </span>
              </div>
              <i className="fas fa-chevron-right text-gray-600 group-hover:text-emerald-500 text-xs"></i>
            </div>
          ))}

          {!loading && q && users.length === 0 && (
            <div className="text-center py-6">
              <p className="text-sm text-gray-500">{t("SearchUserModal.noUsersFound", { q })}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}