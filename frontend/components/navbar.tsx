"use client";

import Link from "next/link";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function Navbar() {
  const { theme, setTheme } = useTheme();

  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    setMounted(true);

    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  if (!mounted) return null;

  return (
    <div className="w-full bg-white dark:bg-slate-900 border-b border-slate-300 dark:border-slate-700 shadow-sm">
      <div className="px-6 py-4 flex items-center justify-between">

        <div className="flex flex-col items-start">
          <Link href="/">
            <button className="text-left hover:opacity-80 transition">
              <h1 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">
                AI Resume Analyzer
              </h1>
            </button>
          </Link>
        </div>

        <div className="flex items-center gap-3">

          <Link href="/">
            <button className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-700">
              Home
            </button>
          </Link>

          <Link href="/resume-review">
            <button className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-700">
              Resume Review
            </button>
          </Link>

          <Link href="/job-analysis">
            <button className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-700">
              Job Analysis
            </button>
          </Link>

          {user ? (
            <>
              <span className="text-slate-700 dark:text-white font-medium">
                Hi, {user.username}
              </span>

              <Link href="/history">
                <button className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-700">
                  History
                </button>
              </Link>

              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login">
                <button className="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700">
                  Login
                </button>
              </Link>

              <Link href="/register">
                <button className="px-4 py-2 rounded-xl bg-green-600 text-white hover:bg-green-700">
                  Register
                </button>
              </Link>
            </>
          )}

          <button
            onClick={() =>
              setTheme(theme === "dark" ? "light" : "dark")
            }
            className="p-4 rounded-2xl bg-white dark:bg-slate-800 shadow-xl transition hover:scale-110"
          >
            {theme === "dark" ? (
              <Sun className="text-yellow-400" />
            ) : (
              <Moon className="text-slate-700" />
            )}
          </button>

        </div>
      </div>
    </div>
  );
}