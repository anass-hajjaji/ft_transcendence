import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, ChevronLeft, UserCircle } from "lucide-react";
import { User } from "@/app/_hooks/global-store";
import { useTranslation } from "@/lib/i18n";

import { getFullAvatarUrl } from "../settings/ProfileAvatar";
interface SidebarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  user: User | null | undefined;
}

const NAV_ITEMS = [
  {
    id: "dashboard",
    href: "/home",
    match: ["/home", "/dashboard"],
    labelKey: "Sidebar.dashboard",
    icon: "fas fa-tachometer-alt",
  },
  {
    id: "pingpong",
    href: "/ping-pong",
    match: ["/ping-pong", "/pingpong"],
    labelKey: "Sidebar.pingpong",
    icon: "fas fa-table-tennis",
  },
  {
    id: "tictactoe",
    href: "/secGameHome",
    match: ["/tic-secGameHome-toe", "/TicTacToe"],
    labelKey: "Sidebar.tictactoe",
    icon: "fas fa-gamepad",
  },
  {
    id: "tournament",
    href: "/tournament1",
    match: ["/tournament", "/tournament1", "/map-selection"],
    labelKey: "Sidebar.tournament",
    icon: "fas fa-trophy",
  },
  {
    id: "chat",
    href: "/chat",
    match: ["/chat"],
    labelKey: "Sidebar.chat",
    icon: "fas fa-comments",
  },
  { divider: true, href: "#" },
  {
    id: "leaderboard",
    href: "/leaderboard",
    match: ["/leaderboard"],
    labelKey: "Leaderboard.title",
    icon: "fas fa-medal",
  },

  {
    id: "about",
    href: "/about",
    match: ["/about"],
    labelKey: "Sidebar.about",
    icon: "fas fa-info-circle",
  },
  
];

export default function LeftSidebar({ open, setOpen, user }: SidebarProps) {
  const pathname = usePathname();
  const { t } = useTranslation();

  const isActive = (match?: string[]) => {
    if (!match || !pathname) return false;
    return match.some((m) => pathname.startsWith(m));
  };

  return (
    <aside
      className={`fixed left-4 top-4 h-[calc(100%-50px)] text-white bg-linear-to-br
                from-gray-900 via-gray-800 to-gray-900 border-l border-gray-700
                rounded-2xl shadow-xl flex flex-col transition-all duration-300 overflow-hidden z-50 ${open ? "w-64" : "w-20"
        }`}
    >
      {/* HEADER */}
      <div className="flex items-center h-20 px-4 relative">
        <div
          className={`text-xl font-bold transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
        >
          {t("Sidebar.brand")}
        </div>
        <button
          onClick={() => setOpen(!open)}
          type="button"
          aria-label="Toggle sidebar"
          className="absolute right-6 z-50 w-9 h-9 flex items-center justify-center rounded-lg text-gray-300 hover:text-white hover:bg-zinc-800 transition"
        >
          {open ? <ChevronLeft size={22} /> : <Menu size={22} />}
        </button>
      </div>

      <hr className="border-t border-[#2c3e50] mx-4 my-2" />

      {/* NAV CONTENT */}
      <nav className="flex-1 px-2 space-y-1 relative">
        {NAV_ITEMS.map((item, i) =>
          item.divider ? (
            <hr key={i} className="border-t border-[#2c3e50] mx-4 my-2" />
          ) : (
            <div key={i} className="relative group">
              <Link
                href={item.href}
                className={`flex items-center h-14 rounded-xl cursor-pointer transition-all px-5.5 ${isActive(item.match)
                  ? "bg-emerald-600 text-white"
                  : "text-[#8392a5] hover:text-amber-50 hover:bg-black"
                  }`}
              >
                <i
                  className={`${item.icon} text-xl min-w-3rem text-center`}
                ></i>
                <span
                  className={`text-sm font-medium whitespace-nowrap transition-opacity px-3 ${open ? "opacity-100" : "opacity-0 pointer-events-none"
                    }`}
                >
                  {item.labelKey ? t(item.labelKey) : ""}
                </span>
              </Link>
              {!open && (
                <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 bg-black text-white px-2 py-1 text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap">
                  {item.labelKey ? t(item.labelKey) : ""}
                </div>
              )}
            </div>
          )
        )}
      </nav>

      {/* FOOTER */}
      <Link
        href="/profile"
        className={`bg-zinc-900 h-14 flex items-center px-4 transition-all duration-300 cursor-pointer hover:bg-[#34495e] ${open ? "rounded-2xl" : "rounded-2xl"
          }`}
      >
        {user?.avatar ? (
          <img
            src={getFullAvatarUrl(user.avatar)}
            className={`w-8 h-8 rounded-full transition-all duration-300 ${open ? "mr-3" : "mx-auto"
              }`}
            alt="avatar"
          />
        ) : (
          <div
            className={`w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center transition-all duration-300 ${open ? "mr-3" : "mx-auto"
              }`}
          >
            <UserCircle className="w-6 h-6 text-zinc-400" />
          </div>
        )}
        <div
          className={`flex flex-col transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
        >
          <span className="text-sm">{user?.username || "User"}</span>
          <span className="text-xs text-[#8392a5]">{t("Sidebar.playerRole")}</span>
        </div>
      </Link>
    </aside>
  );
}