"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "../components/app-shell";
import { fetchDebts } from "@/lib/supabase-data";
import { supabase } from "@/lib/supabase-client";

export default function DebtsPage() {
  const [debts, setDebts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDebts = async () => {
      try {
        const data = await fetchDebts();
        setDebts(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadDebts();
  }, []);

  const handleDelete = async (debtId) => {
    const confirmed = window.confirm(
      "Apakah Anda yakin ingin menghapus hutang ini?"
    );

    if (!confirmed) {
      return;
    }

    try {
      const { error } = await supabase
        .from("debts")
        .delete()
        .eq("id", debtId);

      if (error) {
        throw error;
      }

      setDebts((currentDebts) =>
        currentDebts.filter((debt) => debt.id !== debtId)
      );
    } catch (error) {
      console.error("Gagal menghapus hutang:", error);
      window.alert("Gagal menghapus hutang.");
    }
  };

  return (
    <AppShell title="Hutang" subtitle="Catat pinjaman dan cicilan">
      <section className="space-y-3">
        <div className="flex justify-end">
          <Link href="/add?type=debt" className="rounded-2xl bg-amber-500 px-3 py-2 text-sm font-semibold text-white">
            Tambah Hutang
          </Link>
        </div>
        {loading ? <p className="rounded-3xl bg-white p-4 text-center text-sm text-slate-500 dark:bg-slate-900">Memuat data hutang...</p> : null}
        {debts.map((debt) => (
          <article
            key={debt.id}
            className="rounded-3xl bg-slate-950 p-4 shadow-sm ring-1 ring-slate-800"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-white">
                  {debt.creditor}
                </p>

                {debt.note ? (
                  <p className="mt-1 text-sm text-slate-400">
                    {debt.note}
                  </p>
                ) : null}

                <p className="mt-1 text-sm text-slate-500">
                  Jatuh tempo: {debt.due_date || "-"}
                </p>

                <button
                  type="button"
                  onClick={() => handleDelete(debt.id)}
                  className="mt-2 rounded-full bg-red-600 px-3 py-1 text-xs font-semibold text-white transition hover:bg-red-700"
                >
                  Hapus
                </button>
              </div>

              <div className="flex shrink-0 flex-col items-end gap-2">
                <p className="text-lg font-bold text-white">
                  Rp {Number(debt.remaining_amount ?? debt.amount).toLocaleString("id-ID")}
                </p>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    debt.status === "paid"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {debt.status === "paid" ? "Lunas" : "Aktif"}
                </span>

                <a
                  href={`/add?type=debt&edit=${debt.id}`}
                  className="rounded-full bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-700"
                >
                  Edit
                </a>
              </div>
            </div>
          </article>
        ))}
      </section>
    </AppShell>
  );
}
