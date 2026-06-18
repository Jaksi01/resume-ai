"use client";

import Link from "next/link";
import {
  FileSearch,
  Briefcase,
  Moon,
  Sun,
} from "lucide-react";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function HomePage() {
  const { theme, setTheme } = useTheme();

  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    setMounted(true);

    const savedUser = localStorage.getItem("user");

    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.reload();
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-950 dark:to-slate-900 transition-all duration-500">

      {/* NAVBAR */}
      <div className="w-full bg-white dark:bg-slate-900 border-b border-slate-300 dark:border-slate-700 shadow-sm">
        <div className="px-6 py-4 flex items-center justify-between">

          {/* LEFT */}
          <div className="flex flex-col items-start">
            <Link href="/">
              <button className="text-left hover:opacity-80 transition">
                <h1 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">
                  AI Resume Analyzer
                </h1>
              </button>
            </Link>
          </div>

          {/* RIGHT */}
          <div className="flex items-center gap-3">

            {user ? (
              <>
                <span className="text-slate-700 dark:text-white font-medium">
                  Hi, {user.username}
                </span>

                <Link href="/history">
                  <button className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-white hover:opacity-90">
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

      {/* MAIN CONTENT */}
      <div className="max-w-6xl mx-auto flex flex-col items-center justify-center min-h-[85vh] px-6 py-12">

        {/* HERO */}
        <div className="text-center mb-20">
          <h1 className="text-6xl md:text-7xl font-bold text-slate-800 dark:text-white mb-6">
            AI Resume Analyzer
          </h1>

          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed">
            Analyze resumes with ATS insights and AI-powered
            job matching technology
          </p>
        </div>

        {/* CARDS */}
        <div className="grid md:grid-cols-2 gap-10 w-full">

          {/* Resume Review */}
          <Link href="/resume-review">
            <div className="bg-white dark:bg-slate-800 p-10 rounded-3xl shadow-2xl hover:scale-105 hover:-translate-y-2 transition-all duration-300 cursor-pointer h-full border border-slate-200 dark:border-slate-700">

              <div className="flex items-center gap-4 mb-6">
                <div className="bg-blue-100 dark:bg-blue-900/30 p-4 rounded-2xl">
                  <FileSearch
                    className="text-blue-600"
                    size={40}
                  />
                </div>

                <h2 className="text-3xl font-bold text-slate-800 dark:text-white">
                  Resume Review
                </h2>
              </div>

              <p className="text-slate-600 dark:text-slate-300 text-lg leading-relaxed">
                Review your resume with ATS scoring,
                strengths, weaknesses, recommendations,
                and detailed skill analysis.
              </p>

            </div>
          </Link>

          {/* Job Analysis */}
          <Link href="/job-analysis">
            <div className="bg-white dark:bg-slate-800 p-10 rounded-3xl shadow-2xl hover:scale-105 hover:-translate-y-2 transition-all duration-300 cursor-pointer h-full border border-slate-200 dark:border-slate-700">

              <div className="flex items-center gap-4 mb-6">
                <div className="bg-purple-100 dark:bg-purple-900/30 p-4 rounded-2xl">
                  <Briefcase
                    className="text-purple-600"
                    size={40}
                  />
                </div>

                <h2 className="text-3xl font-bold text-slate-800 dark:text-white">
                  Job Analysis
                </h2>
              </div>

              <p className="text-slate-600 dark:text-slate-300 text-lg leading-relaxed">
                Match your resume against target job roles
                with AI-powered career recommendations
                and missing skill analysis.
              </p>

            </div>
          </Link>

        </div>
      </div>
    </div>
  );
}