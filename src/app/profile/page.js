import Link from "next/link";
import { AppShell } from "../components/app-shell";

export default function ProfilePage() {
  return (
    <AppShell title="Profile" subtitle="Informasi akun Anda">
      <section className="space-y-3 rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
        <div className="rounded-2xl bg-emerald-50 p-4 text-center dark:bg-emerald-950/30">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-600 text-2xl text-white">
            👤
          </div>
          <h2 className="mt-3 text-xl font-bold">Rina Suryani</h2>
          <p className="text-sm text-slate-500">rina@example.com</p>
        </div>

        <div className="grid gap-2">
          <Link href="/settings" className="rounded-2xl bg-slate-100 p-3 font-medium dark:bg-slate-800">Pengaturan Akun</Link>
          <Link href="/login" className="rounded-2xl bg-rose-50 p-3 font-medium text-rose-700 dark:bg-rose-950/30 dark:text-rose-300">Logout</Link>
        </div>
      </section>
    </AppShell>
  );
}
