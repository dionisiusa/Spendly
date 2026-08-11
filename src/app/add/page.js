"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AppShell } from "../components/app-shell";
import { fetchCategories, fetchDebtById, fetchTransactionById, fetchWallets, saveDebt, saveTransaction } from "@/lib/supabase-data";

const fallbackCategories = [];
const fallbackWallets = [];

function AddPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("id");
  const type = searchParams.get("type") || "transaction";
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [categories, setCategories] = useState([]);
  const [wallets, setWallets] = useState([]);

  const [formData, setFormData] = useState({
    amount: "",
    category_id: "",
    wallet_id: "",
    transaction_date: new Date().toISOString().slice(0, 10),
    note: "",
    creditor: "",
    due_date: new Date().toISOString().slice(0, 10),
    status: "active",
  });
  
  const handleInputChange = (event) => {
  const { name, value } = event.target;

  setFormData((current) => ({
    ...current,
    [name]: value,
  }));
};

  useEffect(() => {
    const loadFormData = async () => {
      try {
        const [categoryData, walletData] = await Promise.all([fetchCategories(), fetchWallets()]);
        const nextCategories = categoryData ?? [];
        const orderedCategories = [...nextCategories];
        const nextWallets = walletData ?? [];
        setCategories(orderedCategories);
        setWallets(nextWallets);
        setFormData((value) => ({
          ...value,
          wallet_id: nextWallets[0]?.id ?? "",
          category_id: orderedCategories[0]?.id ?? "",
        }));
      } catch (error) {
        console.error(error);
      }
    };

    loadFormData();
  }, []);

  useEffect(() => {
    const loadEditData = async () => {
      if (!editId) {
        return;
      }

      try {
        if (type === "debt") {
          const debt = await fetchDebtById(editId);
          if (debt) {
            setFormData((value) => ({
              ...value,
              creditor: debt.creditor || "",
              note: debt.note || "",
              amount: debt.amount || "",
              due_date: debt.due_date || value.due_date,
              status: debt.status || "active",
            }));
          }
        } else {
          const transaction = await fetchTransactionById(editId);
          if (transaction) {
            setFormData((value) => ({ ...value, amount: transaction.amount || "", category_id: transaction.category_id || value.category_id, wallet_id: transaction.wallet_id || value.wallet_id, transaction_date: transaction.transaction_date || value.transaction_date, note: transaction.note || "" }));
          }
        }
      } catch (error) {
        console.error(error);
      }
    };

    loadEditData();
  }, [editId, type]);

  const formatAmountInput = (value) => {
    if (!value) {
      return "";
    }

    const cleaned = `${value}`.replace(/[^\d]/g, "");
    return Number(cleaned).toLocaleString("id-ID");
  };

  const handleAmountChange = (event) => {
    const rawValue = event.target.value.replace(/[^\d]/g, "");
    setFormData((value) => ({ ...value, amount: rawValue }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      if (type === "debt") {
        await saveDebt(
          {
            creditor: formData.creditor,
            note: formData.note,
            amount: formData.amount,
            due_date: formData.due_date,
            status: formData.status,
          },
          editId,
        );
      } else {
        const resolvedWalletId = formData.wallet_id || wallets[0]?.id;
        const resolvedCategoryId = formData.category_id || categories[0]?.id;
        if (!resolvedWalletId) {
          throw new Error("Dompet tidak ditemukan.");
        }
        if (!resolvedCategoryId) {
          throw new Error("Kategori tidak ditemukan.");
        }
        await saveTransaction(
          {
            amount: formData.amount,
            category_id: resolvedCategoryId,
            wallet_id: resolvedWalletId,
            transaction_date: formData.transaction_date,
            note: formData.note,
          },
          editId,
        );
      }

      setMessage(editId ? "Data berhasil diperbarui." : "Data berhasil disimpan.");
      if (!editId) {
        setFormData((value) => ({ ...value, amount: "", category_id: categories[0]?.id || "", wallet_id: wallets[0]?.id || "", transaction_date: new Date().toISOString().slice(0, 10), note: "", creditor: "", due_date: new Date().toISOString().slice(0, 10), status: "active" }));
      }
      router.push(type === "debt" ? "/debts" : "/expenses");
    } catch (error) {
      setMessage(error.message || "Gagal menyimpan data.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell title={type === "debt" ? "Tambah Hutang" : "Tambah"} subtitle={type === "debt" ? "Simpan data hutang dan cicilan" : "Simpan transaksi baru dengan cepat"}>
      <section className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
        <div className="mb-4 rounded-2xl bg-rose-50 px-4 py-3 text-center font-semibold text-rose-700">
          Mode: {type === "debt" ? "Hutang" : "Pengeluaran"}
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {type === "debt" ? (
            <>
              <label className="block text-sm font-medium">
                Nama Pemberi Pinjaman
                <input
                  value={formData.creditor}
                  onChange={(event) =>
                    setFormData((value) => ({
                      ...value,
                      creditor: event.target.value,
                    }))
                  }
                  placeholder="Budi"
                  className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 dark:border-slate-700 dark:bg-slate-800"
                  required
                />
              </label>

              <label className="block text-sm font-medium">
                Deskripsi Hutang
                <textarea
                  name="note"
                  value={formData.note}
                  onChange={handleInputChange}
                  placeholder="Contoh: Pinjam untuk beli laptop"
                  rows={3}
                  className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 dark:border-slate-700 dark:bg-slate-800"
                />
              </label>
              <label className="block text-sm font-medium">
                Nominal
                <input type="number" value={formData.amount} onChange={(event) => setFormData((value) => ({ ...value, amount: event.target.value }))} placeholder="1200000" className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 dark:border-slate-700 dark:bg-slate-800" required />
              </label>
              <label className="block text-sm font-medium">
                Tanggal Jatuh Tempo
                <input type="date" value={formData.due_date} onChange={(event) => setFormData((value) => ({ ...value, due_date: event.target.value }))} className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 dark:border-slate-700 dark:bg-slate-800" required />
              </label>
              <label className="block text-sm font-medium">
                Status
                <select name="status" value={formData.status} onChange={(e) => setFormData((prev) => ({...prev, status: e.target.value,}))}>
                  <option value="active">Aktif</option>
                  <option value="paid">Lunas</option>
                </select>
              </label>
            </>
          ) : (
            <>
              <label className="block text-sm font-medium">
                Nominal
                <div className="mt-1">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={formatAmountInput(formData.amount)}
                    onChange={handleAmountChange}
                    placeholder="250.000"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 dark:border-slate-700 dark:bg-slate-800"
                    required
                  />
                </div>
              </label>

              <label className="block text-sm font-medium">
                Kategori
                <select value={formData.category_id} onChange={(event) => setFormData((value) => ({ ...value, category_id: event.target.value }))} className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 dark:border-slate-700 dark:bg-slate-800">
                  {categories.map((item) => (
                    <option key={item.id} value={item.id}>{item.icon} {item.name}</option>
                  ))}
                </select>
              </label>

              <label className="block text-sm font-medium">
                Dompet
                <select value={formData.wallet_id} onChange={(event) => setFormData((value) => ({ ...value, wallet_id: event.target.value }))} className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 dark:border-slate-700 dark:bg-slate-800">
                  {wallets.map((wallet) => (
                    <option key={wallet.id} value={wallet.id}>{wallet.name}</option>
                  ))}
                </select>
              </label>

              <label className="block text-sm font-medium">
                Tanggal
                <input type="date" value={formData.transaction_date} onChange={(event) => setFormData((value) => ({ ...value, transaction_date: event.target.value }))} className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 dark:border-slate-700 dark:bg-slate-800" required />
              </label>

              <label className="block text-sm font-medium">
                Catatan
                <textarea rows="3" value={formData.note} onChange={(event) => setFormData((value) => ({ ...value, note: event.target.value }))} className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 dark:border-slate-700 dark:bg-slate-800" />
              </label>
            </>
          )}

          {message ? <p className="text-sm text-slate-600">{message}</p> : null}

          <button type="submit" disabled={loading} className="w-full rounded-2xl bg-emerald-600 px-4 py-3 font-bold text-white disabled:cursor-not-allowed disabled:opacity-70">
            {loading ? "Menyimpan..." : editId ? "Perbarui" : "Simpan"}
          </button>
        </form>
      </section>
    </AppShell>
  );
}

export default function AddPage() {
  return (
    <Suspense fallback={<div className="p-4 text-center">Memuat...</div>}>
      <AddPageContent />
    </Suspense>
  );
}
