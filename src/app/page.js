import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center bg-gradient-to-br from-emerald-50 to-white px-5 py-10 dark:from-slate-950 dark:to-slate-900">
      <section className="rounded-[28px] bg-white p-6 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-600">Finance Manager</p>
        <h1 className="mt-3 text-4xl font-bold leading-tight">Kelola uang dengan cepat.</h1>
        <p className="mt-3 text-sm text-slate-500">
          Catat pengeluaran, pendapatan, dan hutang dari satu dashboard yang sederhana dan mobile-first.
        </p>

        <div className="mt-6 grid gap-3">
          <Link href="/login" className="rounded-2xl bg-emerald-600 px-4 py-3 text-center font-bold text-white">
            Login
          </Link>
          <Link href="/dashboard" className="rounded-2xl border border-slate-200 px-4 py-3 text-center font-bold text-slate-700 dark:border-slate-700 dark:text-slate-200">
            Explore Demo
          </Link>
        </div>
      </section>
    </main>
  );
}
