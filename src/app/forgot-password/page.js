import Link from "next/link";

export default function ForgotPasswordPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center bg-slate-50 px-5 py-10 dark:bg-slate-950">
      <div className="rounded-[28px] bg-white p-6 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-600">Finance Manager</p>
        <h1 className="mt-3 text-3xl font-bold">Forgot Password</h1>
        <p className="mt-2 text-sm text-slate-500">Masukkan email Anda untuk reset password.</p>

        <form className="mt-6 space-y-3">
          <input type="email" placeholder="Email" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 dark:border-slate-700 dark:bg-slate-800" />
          <button type="button" className="w-full rounded-2xl bg-emerald-600 px-4 py-3 font-bold text-white">Kirim Link Reset</button>
        </form>

        <div className="mt-4 text-center text-sm">
          <Link href="/login" className="text-emerald-700">Kembali ke Login</Link>
        </div>
      </div>
    </main>
  );
}
