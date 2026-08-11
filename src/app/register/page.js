"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { isSupabaseConfigured, supabase } from "@/lib/supabase-client";

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [cooldownSeconds, setCooldownSeconds] = useState(0);

  useEffect(() => {
    if (cooldownSeconds <= 0) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setCooldownSeconds((value) => value - 1);
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [cooldownSeconds]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    const normalizedEmail = formData.email.trim().toLowerCase();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (cooldownSeconds > 0) {
      setMessage(`Tunggu ${cooldownSeconds} detik sebelum mencoba kembali.`);
      setLoading(false);
      return;
    }

    if (!emailPattern.test(normalizedEmail)) {
      setMessage("Format email tidak valid. Gunakan contoh: nama@domain.com");
      setLoading(false);
      return;
    }

    if (!isSupabaseConfigured || !supabase) {
      setMessage("Konfigurasi Supabase belum lengkap. Tambahkan NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_ANON_KEY di file .env.local.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signUp({
      email: normalizedEmail,
      password: formData.password,
      options: { data: { full_name: formData.name } },
    });

    if (error) {
      const lowerMessage = (error.message || "").toLowerCase();

      if (lowerMessage.includes("rate limit") || lowerMessage.includes("too many requests")) {
        setMessage("Terlalu banyak percobaan pendaftaran. Tunggu beberapa menit lalu coba lagi.");
        setCooldownSeconds(60);
      } else {
        setMessage(error.message || "Pendaftaran gagal.");
      }
    } else {
      setMessage("Akun berhasil dibuat. Cek email Anda untuk verifikasi sebelum masuk.");
      setFormData({ name: "", email: "", password: "" });
    }

    setLoading(false);
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center bg-slate-50 px-5 py-10 dark:bg-slate-950">
      <div className="rounded-[28px] bg-white p-6 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-600">Finance Manager</p>
        <h1 className="mt-3 text-3xl font-bold">Register</h1>
        <p className="mt-2 text-sm text-slate-500">Buat akun baru dan mulai kontrol keuangan.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-3">
          <input
            type="text"
            value={formData.name}
            onChange={(event) => setFormData((value) => ({ ...value, name: event.target.value }))}
            placeholder="Nama"
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 dark:border-slate-700 dark:bg-slate-800"
            required
          />
          <input
            type="email"
            value={formData.email}
            onChange={(event) => setFormData((value) => ({ ...value, email: event.target.value }))}
            placeholder="Email"
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 dark:border-slate-700 dark:bg-slate-800"
            autoComplete="email"
            inputMode="email"
            required
          />
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={(event) => setFormData((value) => ({ ...value, password: event.target.value }))}
              placeholder="Password"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 pr-11 dark:border-slate-700 dark:bg-slate-800"
              required
              minLength="6"
            />
            <button
              type="button"
              aria-label={showPassword ? "Sembunyikan password" : "Lihat password"}
              onClick={() => setShowPassword((value) => !value)}
              className="absolute inset-y-0 right-3 flex items-center text-slate-500"
            >
              {showPassword ? (
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M3 3l18 18" strokeLinecap="round" />
                  <path d="M10.58 10.58a2 2 0 0 0 2.84 2.84" strokeLinecap="round" />
                  <path d="M9.88 5.08A10.94 10.94 0 0 1 12 5c5 0 8.5 4 10 7-1.03 1.67-2.29 3.08-3.72 4.18" strokeLinecap="round" />
                  <path d="M6.61 6.61C4.45 7.95 2.8 10.02 2 12c1.5 3 5 7 10 7a12.04 12.04 0 0 0 4.1-.74" strokeLinecap="round" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Z" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>
          <button
            type="submit"
            disabled={loading || cooldownSeconds > 0}
            className="w-full rounded-2xl bg-emerald-600 px-4 py-3 font-bold text-white transition-colors duration-200 hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "Mendaftar..." : cooldownSeconds > 0 ? `Tunggu ${cooldownSeconds}s` : "Daftar"}
          </button>
        </form>

        {message ? <p className="mt-3 text-sm text-slate-600">{message}</p> : null}

        <div className="mt-4 text-center text-sm">
          <Link href="/login" className="text-emerald-700 transition-colors hover:text-emerald-800">
            Sudah punya akun? Masuk
          </Link>
        </div>
      </div>
    </main>
  );
}
