import Link from "next/link";
import { AppShell } from "../components/app-shell";

export default function SettingsPage() {
  return (
    <AppShell title="Settings" subtitle="Pengaturan dan profil">
      <section className="space-y-3 rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
        <Link href="/login" className="block rounded-2xl bg-slate-100 p-3 font-medium dark:bg-slate-800">Login</Link>
        <Link href="/register" className="block rounded-2xl bg-slate-100 p-3 font-medium dark:bg-slate-800">Register</Link>
        <Link href="/forgot-password" className="block rounded-2xl bg-slate-100 p-3 font-medium dark:bg-slate-800">Forgot Password</Link>
      </section>
    </AppShell>
  );
}
