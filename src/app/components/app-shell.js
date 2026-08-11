import Link from "next/link";

const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: "🏠" },
    { href: "/expenses", label: "Pengeluaran", icon: "💸" },
    { href: "/add", label: "Tambah", icon: "➕" },
    { href: "/analytics", label: "Analytics", icon: "📊" },
    { href: "/debts", label: "Hutang", icon: "🤝" },
];

export function AppShell({ title, subtitle, children }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50">
      <div className="mx-auto flex min-h-screen max-w-md flex-col pb-24">
        <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 px-4 py-4 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">
                Finance Manager
              </p>
              <h1 className="text-xl font-bold">{title}</h1>
              {subtitle ? <p className="text-sm text-slate-500">{subtitle}</p> : null}
            </div>
            <Link
              href="/settings"
              className="rounded-full border border-slate-200 px-3 py-2 text-sm font-medium dark:border-slate-700"
            >
              ⚙️
            </Link>
          </div>
        </header>

        <main className="flex-1 px-4 py-4">{children}</main>

        <nav className="fixed bottom-0 left-0 right-0 mx-auto max-w-md border-t border-slate-200 bg-white/95 px-2 py-2 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95">
          <div className="grid grid-cols-5 gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center gap-1 rounded-2xl px-2 py-2 text-[11px] font-medium text-slate-600 transition hover:bg-emerald-50 hover:text-emerald-700 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-emerald-300"
              >
                <span className="text-base">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        </nav>
      </div>
    </div>
  );
}
