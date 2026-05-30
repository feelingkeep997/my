"use client";

import { useState, createContext, useContext } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Menu, X, BookOpen, FileText } from "lucide-react";

type AppMode = "vocabulary" | "exam";

interface ModeContextType {
  mode: AppMode;
  setMode: (mode: AppMode) => void;
}

const ModeContext = createContext<ModeContextType>({
  mode: "vocabulary",
  setMode: () => {},
});

export function useMode() {
  return useContext(ModeContext);
}

export function ModeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<AppMode>("vocabulary");
  return (
    <ModeContext.Provider value={{ mode, setMode }}>
      {children}
    </ModeContext.Provider>
  );
}

type MenuItem = {
  id: number;
  title: string;
  url: string;
  dropdown?: boolean;
  items?: MenuItem[];
  isModeSwitch?: boolean;
};

const menuData: MenuItem[] = [
  { id: 1, title: "模式切换", url: "#", isModeSwitch: true },
  { id: 2, title: "Dashboard", url: "/dashboard" },
  {
    id: 6,
    title: "更多",
    url: "#",
    dropdown: true,
    items: [
      { id: 61, title: "设置", url: "#" },
      { id: 62, title: "帮助", url: "#" },
      { id: 63, title: "关于", url: "#" },
    ],
  },
];

function ModeSwitcher() {
  const { mode, setMode } = useMode();

  return (
    <div className="flex items-center gap-0.5 p-1 rounded-xl bg-white/[0.04] border border-white/[0.06]">
      <button
        onClick={() => setMode("vocabulary")}
        className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg transition-all duration-300 ease-out ${
          mode === "vocabulary"
            ? "bg-white/10 text-white shadow-sm shadow-white/5"
            : "text-white/40 hover:text-white/60"
        }`}
      >
        <BookOpen className="size-3.5" />
        背单词
      </button>
      <button
        onClick={() => setMode("exam")}
        className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg transition-all duration-300 ease-out ${
          mode === "exam"
            ? "bg-white/10 text-white shadow-sm shadow-white/5"
            : "text-white/40 hover:text-white/60"
        }`}
      >
        <FileText className="size-3.5" />
        六级试卷
      </button>
    </div>
  );
}

function DropdownMenu({ item }: { item: MenuItem }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        className="flex items-center gap-1 px-3 py-2 text-sm text-white/50 hover:text-white/80 transition-colors duration-200"
        onClick={() => setOpen(!open)}
      >
        {item.title}
        <ChevronDown
          className={`size-3.5 transition-transform duration-300 ease-out ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      <div
        className={`absolute top-full left-0 mt-2 w-44 rounded-xl overflow-hidden transition-all duration-300 ease-out ${
          open
            ? "opacity-100 translate-y-0 scale-100 pointer-events-auto"
            : "opacity-0 -translate-y-2 scale-95 pointer-events-none"
        }`}
        style={{
          background:
            "linear-gradient(135deg, rgba(20,20,30,0.95) 0%, rgba(15,15,25,0.95) 100%)",
          backdropFilter: "blur(24px) saturate(1.3)",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow:
            "0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)",
        }}
      >
        <div className="py-1.5">
          {item.items?.map((subItem) => (
            <Link
              key={subItem.id}
              href={subItem.url}
              className="block px-4 py-2.5 text-sm text-white/50 hover:text-white hover:bg-white/[0.06] transition-all duration-200 mx-1.5 rounded-lg"
              onClick={() => setOpen(false)}
            >
              {subItem.title}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

interface NavbarProps {
  variant?: "dark" | "light" | "auto";
}

export default function Navbar({ variant = "auto" }: NavbarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (pathname === "/") return null;

  const isActive = (url: string) => {
    if (url === "/") return pathname === "/";
    return pathname.startsWith(url);
  };

  const bgStyle =
    variant === "dark"
      ? {
          background:
            "linear-gradient(180deg, rgba(10,10,18,0.92) 0%, rgba(10,10,18,0.85) 100%)",
          borderBottomColor: "rgba(255,255,255,0.05)",
        }
      : variant === "light"
        ? {
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.92) 0%, rgba(255,255,255,0.85) 100%)",
            borderBottomColor: "rgba(0,0,0,0.06)",
          }
        : {
            background:
              "linear-gradient(180deg, rgba(20,20,30,0.88) 0%, rgba(20,20,30,0.82) 100%)",
            borderBottomColor: "rgba(255,255,255,0.05)",
          };

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-[100] border-b transition-all duration-300"
      style={{
        ...bgStyle,
        backdropFilter: "blur(24px) saturate(1.4)",
        WebkitBackdropFilter: "blur(24px) saturate(1.4)",
      }}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          <Link
            href="/"
            className="text-lg font-semibold text-white tracking-tight hover:text-white/90 transition-colors duration-200"
          >
            玄域
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {menuData.map((item) =>
              item.isModeSwitch ? (
                <ModeSwitcher key={item.id} />
              ) : item.dropdown ? (
                <DropdownMenu key={item.id} item={item} />
              ) : (
                <Link
                  key={item.id}
                  href={item.url}
                  className={`relative px-3 py-2 text-sm rounded-lg transition-all duration-300 ease-out ${
                    isActive(item.url)
                      ? "text-white bg-white/[0.08]"
                      : "text-white/40 hover:text-white/70 hover:bg-white/[0.04]"
                  }`}
                >
                  {item.title}
                  {isActive(item.url) && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-cyan-400/60 rounded-full" />
                  )}
                </Link>
              )
            )}
          </div>

          <button
            className="md:hidden p-2 text-white/40 hover:text-white/70 transition-colors duration-200"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>

        <div
          className={`md:hidden overflow-hidden transition-all duration-400 ease-out ${
            mobileOpen ? "max-h-96 opacity-100 pb-4" : "max-h-0 opacity-0"
          }`}
        >
          <div className="py-2">
            <ModeSwitcher />
          </div>
          {menuData
            .filter((item) => !item.isModeSwitch)
            .map((item, i) => (
              <div
                key={item.id}
                className="transition-all duration-300"
                style={{ transitionDelay: `${i * 40}ms` }}
              >
                {item.dropdown ? (
                  <div className="py-2">
                    <div className="px-3 py-2 text-xs text-white/25 uppercase tracking-wider">
                      {item.title}
                    </div>
                    {item.items?.map((subItem) => (
                      <Link
                        key={subItem.id}
                        href={subItem.url}
                        className="block px-6 py-2.5 text-sm text-white/40 hover:text-white/70 hover:bg-white/[0.04] transition-all duration-200 rounded-lg mx-1"
                        onClick={() => setMobileOpen(false)}
                      >
                        {subItem.title}
                      </Link>
                    ))}
                  </div>
                ) : (
                  <Link
                    href={item.url}
                    className={`block px-3 py-2.5 text-sm rounded-lg transition-all duration-200 mx-1 ${
                      isActive(item.url)
                        ? "text-white bg-white/[0.08]"
                        : "text-white/40 hover:text-white/70 hover:bg-white/[0.04]"
                    }`}
                    onClick={() => setMobileOpen(false)}
                  >
                    {item.title}
                  </Link>
                )}
              </div>
            ))}
        </div>
      </div>
    </nav>
  );
}
