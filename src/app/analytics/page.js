"use client";

import { useEffect, useState } from "react";
import { AppShell } from "../components/app-shell";
import {
  fetchDashboardSummary,
  fetchTransactions,
} from "@/lib/supabase-data";

export default function AnalyticsPage() {
  const [summary, setSummary] = useState({
  totalExpenses: 0,
  monthlyExpenses: 0,
  totalDebt: 0,
});

const [monthly, setMonthly] = useState([]);
const [categories, setCategories] = useState([]);

useEffect(() => {
  loadAnalytics();
}, []);

async function loadAnalytics() {
  const dashboard = await fetchDashboardSummary();
  const transactions = await fetchTransactions();

  setSummary(dashboard);

  // ======================
  // Data Bulanan
  // ======================
  const monthMap = {};

  transactions.forEach((item) => {
    const month = new Date(item.transaction_date).toLocaleString("id-ID", {
      month: "short",
    });

    monthMap[month] = (monthMap[month] || 0) + Number(item.amount);
  });

  setMonthly(
    Object.entries(monthMap).map(([month, value]) => ({
      month,
      value,
    }))
  );

  // ======================
  // Data Kategori
  // ======================
  const categoryMap = {};

  transactions.forEach((item) => {
    const name = item.categories?.name || "Lainnya";

    categoryMap[name] =
      (categoryMap[name] || 0) + Number(item.amount);
  });

  const total = Object.values(categoryMap).reduce(
    (a, b) => a + b,
    0
  );

  setCategories(
    Object.entries(categoryMap).map(([name, amount]) => ({
      name,
      percent: total === 0 ? 0 : Math.round((amount / total) * 100),
      color: "bg-blue-600",
    }))
  );
}

  return (
    <AppShell title="Analytics" subtitle="Insight pengeluaran harian dan bulanan">
      <section className="grid grid-cols-2 gap-3">
        <article className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
          <p className="text-sm text-slate-500">Total Pengeluaran</p>
          <div className="mt-3 space-y-2">
            <div className="h-3 rounded-full bg-rose-100">
              <div className="h-3 w-3/4 rounded-full bg-rose-500" />
            </div>
            <div className="text-sm font-semibold text-slate-700">Rp {summary.totalExpenses.toLocaleString("id-ID")}</div>
          </div>
        </article>
        <article className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
          <p className="text-sm text-slate-500">Cash Flow Bulanan</p>
          <div className="mt-3 flex items-end gap-2">
            {monthly.map((item) => (
              <div key={item.month} className="flex flex-1 flex-col items-center gap-1">
                <div className="w-full rounded-t-xl bg-emerald-500" style={{ height: `${(item.value / Math.max(...monthly.map((m) => m.value), 1)) * 120}px` }}/>
                <span className="text-[10px] text-slate-500">{item.month}</span>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="mt-4 rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
        <h2 className="text-lg font-bold">Pengeluaran per Kategori</h2>
        <div className="mt-4 space-y-3">
          {categories.map((item) => (
            <div key={item.name}>
              <div className="mb-1 flex justify-between text-sm">
                <span>{item.name}</span>
                <span>{item.percent}%</span>
              </div>
              <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800">
                <div className={`h-2 rounded-full ${item.color}`} style={{ width: `${item.percent}%` }} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-4 rounded-3xl bg-emerald-50 p-4 text-sm text-emerald-900">
        Insight: Pengeluaran terbesar bulan ini berasal dari kategori <strong>Makanan (35%)</strong>.
      </section>
    </AppShell>
  );
}
