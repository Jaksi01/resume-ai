"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../../components/navbar";

export default function RegisterPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    // VALIDASI FRONTEND
    if (!username.trim()) {
      alert("Username is required");
      return;
    }

    if (!email.trim()) {
      alert("Email is required");
      return;
    }

    if (!password.trim()) {
      alert("Password is required");
      return;
    }

    try {
      const res = await fetch(
        "http://127.0.0.1:8000/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username,
            email,
            password,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.detail);
        return;
      }

      alert("Register success");
      router.push("/login");
    } catch (error) {
      console.error(error);
      alert("Failed to connect backend");
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950">
      <Navbar />

      <div className="min-h-[85vh] flex justify-center items-center">
        <form
          onSubmit={handleRegister}
          className="w-[400px] p-8 bg-white dark:bg-slate-900 rounded-2xl shadow-xl"
        >
          <h1 className="text-3xl font-bold mb-6 text-slate-800 dark:text-white">
            Register
          </h1>

          <input
            type="text"
            placeholder="Username"
            className="w-full border p-3 rounded mb-4 text-black"
            value={username}
            onChange={(e) =>
              setUsername(e.target.value)
            }
          />

          <input
            type="email"
            placeholder="Email"
            className="w-full border p-3 rounded mb-4 text-black"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full border p-3 rounded mb-4 text-black"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
          />

          <button
            type="submit"
            className="w-full bg-green-600 text-white p-3 rounded hover:bg-green-700"
          >
            Register
          </button>
        </form>
      </div>
    </div>
  );
}