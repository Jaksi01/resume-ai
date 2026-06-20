"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../../components/navbar";
import Test from "../../components/Test";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch("https://ai-resume-analyzer-gac3h0dmdahmhnbf.indonesiacentral-01.azurewebsites.net/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.detail);
      return;
    }

    localStorage.setItem(
      "user",
      JSON.stringify(data.user)
    );

    router.push("/history");
  };

  return (
    <>
      <Navbar />

      <div className="min-h-screen flex justify-center items-center bg-slate-100 dark:bg-slate-950">
        <form
          onSubmit={handleLogin}
          className="w-[400px] p-8 bg-white dark:bg-slate-800 rounded-2xl shadow-xl"
        >
          <h1 className="text-3xl font-bold mb-6 text-slate-800 dark:text-white">
            Login
          </h1>

          <input
            type="email"
            placeholder="Email"
            className="w-full border p-3 rounded mb-4"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full border p-3 rounded mb-4"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            type="submit"
            className="w-full bg-blue-600 text-white p-3 rounded hover:bg-blue-700"
          >
            Login
          </button>
        </form>
      </div>
    </>
  );
}