"use client";

import { useEffect, useMemo, useState } from "react";
import { AppShell } from "../components/app-shell";
import { fetchCategories, fetchTransactions } from "@/lib/supabase-data";

export default function ExpensesPage() {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Semua");
  const [date, setDate] = useState("");

  useEffect(() => {
    const loadTransactions = async () => {
      try {
        const [transactionData, categoryData] = await Promise.all([fetchTransactions(), fetchCategories()]);
        setTransactions(transactionData);
        setCategories(categoryData);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadTransactions();
  }, []);

  const filtered = useMemo(() => {
    return transactions.filter((item) => {
      const matchesText = (item.note || "").toLowerCase().includes(query.toLowerCase());
      const matchesCategory = category === "Semua" || item.categories?.name === category;
      const matchesDate = !date || item.transaction_date === date;
      return matchesText && matchesCategory && matchesDate;
    });
  }, [query, category, date, transactions]);

  return (
    <AppShell title="Pengeluaran" subtitle="Kelola seluruh transaksi pengeluaran">
      <section className="space-y-3 rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Cari transaksi"
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 outline-none dark:border-slate-700 dark:bg-slate-800"
        />
        <div className="grid grid-cols-2 gap-3">
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 dark:border-slate-700 dark:bg-slate-800"
          >
            <option>Semua</option>
            {categories.map((item) => (
              <option key={item.id}>{item.name}</option>
            ))}
          </select>
          <input
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 dark:border-slate-700 dark:bg-slate-800"
          />
        </div>
      </section>

      <section className="mt-4 space-y-3">
        {loading ? <p className="rounded-3xl bg-white p-4 text-center text-sm text-slate-500 dark:bg-slate-900">Memuat transaksi...</p> : null}
        {filtered.map((item) => (
          <article key={item.id} className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-semibold">{item.note}</p>
                <p className="text-sm text-slate-500">{item.categories?.name || "-"} • {item.transaction_date}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-rose-600">-{new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(item.amount || 0)}</p>
                <a href={`/add?id=${item.id}`} className="mt-2 block text-xs font-semibold text-emerald-700">Edit</a>
              </div>
            </div>
          </article>
        ))}
        {filtered.length === 0 ? (
          <p className="rounded-3xl bg-white p-4 text-center text-sm text-slate-500 dark:bg-slate-900">
            Tidak ada transaksi sesuai filter.
          </p>
        ) : null}
      </section>
    </AppShell>
  );
}
