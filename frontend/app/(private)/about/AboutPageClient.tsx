"use client";

import React from "react";
import { User } from "@/app/_hooks/global-store";
import { UserCircle, Mail, Trophy, Target, Gamepad2 } from "lucide-react";

interface AboutPageClientProps {
  user: User;
}

function getFullAvatarUrl(avatar: string | undefined) {
  if (!avatar) return "";
  if (avatar.startsWith("http")) return avatar;
  return `${process.env.NEXT_PUBLIC_API_URL || "https://localhost:8443"}/uploads/avatars/${avatar}`;
}

export default function AboutPageClient({ user }: AboutPageClientProps) {

  return (
    <div className="min-h-screen text-white py-8 overflow-y-auto">
      <main className="flex flex-col w-full max-w-[1920px] mx-auto px-8 gap-8">
        {/* Hero Section with User Greeting */}
        <div className="relative shrink-0">
          <div className="bg-linear-to-br from-gray-900 via-gray-800 to-gray-900 border border-gray-700 rounded-2xl p-8 md:p-12 shadow-xl">
            <div className="flex flex-col md:flex-row items-center gap-8">
              {/* User Avatar */}
              <div className="relative group">
                {user?.avatar ? (
                  <img
                    src={getFullAvatarUrl(user.avatar)}
                    className="w-32 h-32 rounded-full border-4 border-emerald-500 shadow-lg group-hover:scale-105 transition-transform duration-300"
                    alt="User avatar"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full border-4 border-emerald-500 bg-zinc-800 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                    <UserCircle className="w-20 h-20 text-emerald-400" />
                  </div>
                )}
                <div className="absolute -bottom-2 -right-2 bg-emerald-600 rounded-full p-3 shadow-lg">
                  <Trophy className="w-6 h-6 text-white" />
                </div>
              </div>

              {/* User Info */}
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-5xl md:text-6xl font-black tracking-tight leading-tight text-white mb-3">
                  Hello,{" "}
                  <span className="text-emerald-400">
                    {user.username}
                  </span>
                </h1>
                <p className="text-xl text-gray-400 mb-6">
                  Welcome to your personalized gaming hub!
                </p>
                <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                  <div className="flex items-center gap-2 bg-zinc-900/80 px-4 py-2 rounded-lg border border-gray-700">
                    <Mail className="w-4 h-4 text-emerald-400" />
                    <span className="text-sm text-gray-300">{user.email}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-zinc-900/80 px-4 py-2 rounded-lg border border-gray-700">
                    <UserCircle className="w-4 h-4 text-emerald-400" />
                    <span className="text-sm text-gray-300">{user.fullName}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* About Application Section */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* What is This? */}
          <div className="bg-linear-to-br from-gray-900 via-gray-800 to-gray-900 border border-gray-700 rounded-2xl p-8 shadow-xl hover:border-emerald-500/50 transition-all duration-300">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-emerald-600 rounded-xl p-3">
                <Target className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white">What is This?</h2>
            </div>
            <p className="text-gray-400 leading-relaxed text-base">
              This is a modern multiplayer gaming platform where you can compete in Ping-Pong and Tic-Tac-Toe, chat with friends, join tournaments, and track your performance. Built with cutting-edge web technologies, it delivers a seamless real-time gaming experience.
            </p>
          </div>

          {/* Features */}
          <div className="bg-linear-to-br from-gray-900 via-gray-800 to-gray-900 border border-gray-700 rounded-2xl p-8 shadow-xl hover:border-emerald-500/50 transition-all duration-300">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-emerald-600 rounded-xl p-3">
                <Gamepad2 className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white">Key Features</h2>
            </div>
            <ul className="space-y-3 text-gray-400">
              <li className="flex items-start gap-3">
                <div className="bg-emerald-600 rounded-full p-1.5 mt-0.5 shrink-0">
                  <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                </div>
                <span className="text-base">Real-time multiplayer gameplay with Socket.IO</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="bg-emerald-600 rounded-full p-1.5 mt-0.5 shrink-0">
                  <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                </div>
                <span className="text-base">Comprehensive tournament system with bracket management</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="bg-emerald-600 rounded-full p-1.5 mt-0.5 shrink-0">
                  <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                </div>
                <span className="text-base">Live chat with friends and game invitations</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="bg-emerald-600 rounded-full p-1.5 mt-0.5 shrink-0">
                  <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                </div>
                <span className="text-base">Detailed statistics and leaderboards</span>
              </li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}