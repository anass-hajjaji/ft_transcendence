"use client";

import React, { useState, useEffect, useRef, useContext } from "react";
import { Camera, UserCircle, CheckCircle2, X, Upload, Trash2, Loader2 } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import {
  uploadAvatar,
  setAvatar,
  deleteAvatar,
  getAvatarList,
  getCurrentAvatar,
  Avatar
} from "@/lib/api";
import { GlobalContext } from "@/app/_hooks/global-store";

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

export const getFullAvatarUrl = (url: string) => {
  if (!url) return "";
  if (url.startsWith('http')) return url;


  const baseUrl = API_URL.replace(/\/$/, "");
  const path = url.startsWith('/') ? url : `/${url}`;

  return `${baseUrl}${path}`;
};

export default function ProfileAvatar() {
  const { t } = useTranslation();
  const { setUser, user } = useContext(GlobalContext)!;
  const [mounted, setMounted] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState<string>("");
  const [showSelector, setShowSelector] = useState(false);
  const [defaultAvatars, setDefaultAvatars] = useState<Avatar[]>([]);
  const [customAvatars, setCustomAvatars] = useState<Avatar[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
    loadAvatars();
  }, []);

  const loadAvatars = async () => {
    setIsLoading(true);
    try {
      const [avatarList, currentAvatar] = await Promise.all([
        getAvatarList(),
        getCurrentAvatar()
      ]);

      setDefaultAvatars(avatarList.defaults);
      setCustomAvatars(avatarList.custom);
      setSelectedAvatar(currentAvatar || "");
    } catch (err) {
      setError("Failed to load avatars");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectAvatar = async (avatarUrl: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await setAvatar(avatarUrl);
      setSelectedAvatar(avatarUrl);
      setShowSelector(false);
      setUser({ ...(user! || {}), avatar: avatarUrl });
    } catch {
      setError("Failed to set avatar");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;


    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError(t("Settings.invalidFileType"));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError(t("Settings.fileTooLarge"));
      return;
    }

    setIsUploading(true);
    setError(null);
    try {
      const result = await uploadAvatar(file);
      setSelectedAvatar(result.avatar);

      await loadAvatars();
      setShowSelector(false);
      setUser({ ...(user! || {}), avatar: result.avatar });
    } catch {
      setError(t("Settings.failedToUploadAvatar"));
    } finally {
      setIsUploading(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDeleteAvatar = async (avatarUrl: string, e: React.MouseEvent) => {
    e.stopPropagation();

    if (!confirm(t("Settings.confirmDeleteAvatar"))) return;

    setIsLoading(true);
    setError(null);
    try {
      await deleteAvatar(avatarUrl);

      await loadAvatars();
      setUser({ ...(user! || {}), avatar: "" });
    } catch {
      setError(t("Settings.failedToDeleteAvatar"));
    } finally {
      setIsLoading(false);
    }
  };

  if (!mounted) {
    return (
      <section className="p-8 bg-[#0a0a0a] rounded-2xl border border-emerald-500/10 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center gap-8">
          <div className="w-32 h-32 rounded-full bg-zinc-800 animate-pulse" />
          <div className="space-y-2">
            <div className="h-8 w-40 bg-zinc-800 rounded animate-pulse" />
            <div className="h-4 w-64 bg-zinc-800 rounded animate-pulse" />
            <div className="h-10 w-32 bg-zinc-800 rounded animate-pulse" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="p-8 bg-[#0a0a0a] rounded-2xl border border-emerald-500/10 shadow-xl relative overflow-hidden">

      {error && (
        <div className="absolute top-4 left-4 right-4 bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-2 rounded-lg text-sm flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="hover:text-white">
            <X size={14} />
          </button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-center gap-8 mt-6">
        <div className="relative group shrink-0">
          <div className="w-32 h-32 rounded-full border-4 border-emerald-500 shadow-lg bg-zinc-800 flex items-center justify-center">
            {isLoading ? (
              <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
            ) : selectedAvatar ? (
              <img
                width={128}
                height={128}
                src={getFullAvatarUrl(selectedAvatar)}
                alt="Avatar"
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              <UserCircle className="w-full h-full text-zinc-400" />
            )}
          </div>

          <button
            onClick={() => setShowSelector(!showSelector)}
            disabled={isLoading}
            className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer disabled:cursor-not-allowed"
          >
            <Camera className="w-8 h-8 text-white" />
          </button>
        </div>

        <div className="text-center sm:text-left space-y-2">
          <h2 className="text-2xl font-bold text-white tracking-tight">{t("Settings.profilePicture")}</h2>
          <p className="text-zinc-500 text-sm max-w-xs">
            {t("Settings.profileAvatarDescription")}
          </p>
          <div className="flex gap-2 flex-wrap justify-center sm:justify-start">
            <button
              onClick={() => setShowSelector(!showSelector)}
              disabled={isLoading}
              className="px-6 py-2 bg-emerald-500 text-black hover:bg-emerald-400 rounded-lg text-sm font-bold transition-all shadow-lg shadow-emerald-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {showSelector ? t("ChatConversation.Close") : t("Settings.changeAvatar")}
            </button>
            <label className="px-6 py-2 bg-zinc-800 text-white hover:bg-zinc-700 rounded-lg text-sm font-bold transition-all cursor-pointer flex items-center gap-2">
              <Upload size={16} />
              {t("Settings.upload")}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={handleFileUpload}
                className="hidden"
                disabled={isUploading}
              />
            </label>
          </div>
          {isUploading && (
            <div className="flex items-center gap-2 text-emerald-500 text-sm">
              <Loader2 className="w-4 h-4 animate-spin" />
              {t("Settings.uploading")}
            </div>
          )}
        </div>
      </div>

      {showSelector && (
        <div className="mt-8 pt-8 border-t border-zinc-800/50 animate-in fade-in slide-in-from-top-2">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-zinc-400 text-xs font-bold uppercase tracking-widest">{t("Settings.chooseCharacter")}</h3>
            <button onClick={() => setShowSelector(false)} className="text-zinc-600 hover:text-white transition-colors">
              <X size={16} />
            </button>
          </div>

          <div className="mb-6">
            <p className="text-zinc-500 text-xs mb-3">{t("Settings.defaultAvatars")}</p>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-4">
              {defaultAvatars.map((av) => (
                <button
                  key={av.id}
                  onClick={() => handleSelectAvatar(av.url)}
                  disabled={isLoading}
                  className={`relative w-14 h-14 rounded-xl overflow-hidden border-2 transition-all hover:scale-110 active:scale-90 disabled:hover:scale-100 ${selectedAvatar === av.url
                    ? "border-emerald-500 shadow-lg shadow-emerald-500/20"
                    : "border-zinc-800 grayscale hover:grayscale-0"
                    }`}
                  title={av.name}
                >
                  <img
                    src={getFullAvatarUrl(av.url)}
                    alt={av.name}
                    className="w-full h-full object-cover"
                  />
                  {selectedAvatar === av.url && (
                    <div className="absolute inset-0 bg-emerald-500/20 flex items-center justify-center">
                      <CheckCircle2 size={16} className="text-emerald-500 bg-black rounded-full" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

  
          {customAvatars.length > 0 && (
            <div>
              <p className="text-zinc-500 text-xs mb-3">{t("Settings.yourUploads")}</p>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-4">
                {customAvatars.map((av) => (
                  <div key={av.id} className="relative group">
                    <button
                      onClick={() => handleSelectAvatar(av.url)}
                      disabled={isLoading}
                      className={`relative w-14 h-14 rounded-xl overflow-hidden border-2 transition-all hover:scale-110 active:scale-90 disabled:hover:scale-100 ${selectedAvatar === av.url
                        ? "border-emerald-500 shadow-lg shadow-emerald-500/20"
                        : "border-zinc-800 hover:border-zinc-600"
                        }`}
                      title={av.name}
                    >
                      <img
                        src={getFullAvatarUrl(av.url)}
                        alt={av.name}
                        className="w-full h-full object-cover"
                      />
                      {selectedAvatar === av.url && (
                        <div className="absolute inset-0 bg-emerald-500/20 flex items-center justify-center">
                          <CheckCircle2 size={16} className="text-emerald-500 bg-black rounded-full" />
                        </div>
                      )}
                    </button>

                    <button
                      onClick={(e) => handleDeleteAvatar(av.url, e)}
                      disabled={isLoading}
                      className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 hover:bg-red-400 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-lg disabled:opacity-50"
                      title="Delete avatar"
                    >
                      <Trash2 size={10} className="text-white" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 p-4 bg-zinc-900/50 rounded-lg border border-zinc-800/50">
            <p className="text-zinc-500 text-xs">
              {t("Settings.uploadAvatarTip")}
            </p>
          </div>
        </div>
      )}
    </section>
  );
}