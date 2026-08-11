"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AppShell } from "../components/app-shell";
import { fetchDashboardSummary } from "@/lib/supabase-data";

const formatCurrency = (value) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value || 0);

export default function DashboardPage() {
  const [summary, setSummary] = useState({ totalExpenses: 0, monthlyExpenses: 0, totalDebt: 0, recentTransactions: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSummary = async () => {
      try {
        const nextSummary = await fetchDashboardSummary();
        setSummary(nextSummary);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadSummary();
  }, []);

  return (
    <AppShell title="Dashboard" subtitle="Ringkasan pengeluaran Anda">
      <section className="grid gap-3">
        <article className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
          <p className="text-sm text-slate-500">Total Pengeluaran</p>
          <h2 className="mt-2 text-2xl font-bold">{loading ? "Memuat..." : formatCurrency(summary.totalExpenses)}</h2>
        </article>
        <article className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
          <p className="text-sm text-slate-500">Pengeluaran Bulan Ini</p>
          <h2 className="mt-2 text-2xl font-bold">{loading ? "Memuat..." : formatCurrency(summary.monthlyExpenses)}</h2>
        </article>
        <article className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
          <p className="text-sm text-slate-500">Total Hutang</p>
          <h2 className="mt-2 text-2xl font-bold">{loading ? "Memuat..." : formatCurrency(summary.totalDebt)}</h2>
        </article>
      </section>

      <section className="mt-5 rounded-3xl bg-rose-500 p-4 text-white shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-rose-100">Pengeluaran Bulan Ini</p>
            <h3 className="text-2xl font-bold">{loading ? "Memuat..." : formatCurrency(summary.monthlyExpenses)}</h3>
          </div>
          <div className="rounded-2xl bg-white/20 px-3 py-2 text-sm font-semibold">-12%</div>
        </div>
      </section>

      <section className="mt-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold">Quick Action</h2>
          <Link href="/add" className="text-sm font-semibold text-emerald-700">
            Tambah transaksi
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Link href="/add" className="rounded-2xl bg-rose-50 px-3 py-4 text-center text-sm font-semibold text-rose-700">
            Tambah Pengeluaran
          </Link>
          <Link href="/debts" className="rounded-2xl bg-amber-50 px-3 py-4 text-center text-sm font-semibold text-amber-700">
            Tambah Hutang
          </Link>
        </div>
      </section>

      <section className="mt-5 rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold">5 Transaksi Terbaru</h2>
          <Link href="/expenses" className="text-sm font-semibold text-emerald-700">
            Lihat Semua
          </Link>
        </div>
        <div className="space-y-3">
          {summary.recentTransactions.length > 0 ? (
            summary.recentTransactions.map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-2xl bg-slate-50 px-3 py-3 dark:bg-slate-800">
                <div>
                  <p className="font-semibold">{item.note}</p>
                  <p className="text-xs text-slate-500">{item.category} • {item.date}</p>
                </div>
                <span className="font-bold text-slate-900 dark:text-white">-{formatCurrency(item.amount)}</span>
              </div>
            ))
          ) : (
            <p className="rounded-2xl bg-slate-50 p-3 text-sm text-slate-500 dark:bg-slate-800">Belum ada transaksi.</p>
          )}
        </div>
      </section>
    </AppShell>
  );
}
