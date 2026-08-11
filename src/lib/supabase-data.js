import { isSupabaseConfigured, supabase } from "./supabase-client";

const isPermissionError = (error) => error?.code === "42501" || /permission denied/i.test(error?.message || "");

const getReadableError = (error) => {
  if (isPermissionError(error)) {
    return "Akses ke tabel Supabase ditolak. Jalankan policy RLS untuk transactions, debts, wallets, dan categories di SQL Editor Supabase.";
  }

  return error?.message || "Terjadi kesalahan saat mengakses Supabase.";
};

const getUserId = async () => {
  if (!isSupabaseConfigured || !supabase) {
    return null;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user?.id ?? null;
};

export async function fetchCategories() {
  if (!isSupabaseConfigured || !supabase) {
    return [];
  }

  const { data, error } = await supabase.from("categories").select("id, name, icon");

  if (error) {
    if (error.code === "42P01") {
      return [];
    }
    throw error;
  }

  return data ?? [];
}

export async function fetchWallets() {
  if (!isSupabaseConfigured || !supabase) return [];

  const userId = await getUserId();

  console.log("User ID:", userId);

  const { data, error } = await supabase
    .from("wallets")
    .select("*")
    .eq("user_id", userId);

  console.log("Wallet Data:", data);
  console.log("Wallet Error:", error);

  if (error) throw error;

  return data ?? [];
}

export async function fetchTransactions() {
  if (!isSupabaseConfigured || !supabase) {
    return [];
  }

  const userId = await getUserId();
  if (!userId) {
    return [];
  }

  const { data, error } = await supabase
    .from("transactions")
    .select("*, categories(name, icon), wallets(name)")
    .eq("user_id", userId)
    .order("transaction_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    if (error.code === "42P01") {
      return [];
    }
    if (isPermissionError(error)) {
      return [];
    }
    throw new Error(getReadableError(error));
  }

  return data ?? [];
}

export async function fetchTransactionById(id) {
  if (!isSupabaseConfigured || !supabase || !id) {
    return null;
  }

  const { data, error } = await supabase.from("transactions").select("*, categories(name, icon), wallets(name)").eq("id", id).maybeSingle();

  if (error) {
    if (error.code === "42P01") {
      return null;
    }
    throw error;
  }

  return data;
}

export async function saveTransaction(payload, id = null) {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error("Supabase belum dikonfigurasi");
  }

  const userId = await getUserId();
  if (!userId) {
    throw new Error("Anda perlu login terlebih dahulu.");
  }

  const walletCandidates = await fetchWallets();
  const resolvedWalletId = payload.wallet_id && payload.wallet_id.trim() ? payload.wallet_id : walletCandidates[0]?.id || null;
  const resolvedCategoryId = payload.category_id && payload.category_id.trim() ? payload.category_id : null;

  if (!resolvedWalletId) {
    throw new Error("Pilih atau tambahkan dompet terlebih dahulu sebelum menyimpan transaksi.");
  }
//tambahan
console.log("Payload:", payload);
console.log("Wallet Candidates:", walletCandidates);
console.log("Resolved Wallet:", resolvedWalletId);

const normalizedPayload = {
    user_id: userId,
    wallet_id: resolvedWalletId,
    category_id: resolvedCategoryId,
    note: payload.note,
    amount: Number(payload.amount),
    transaction_date: payload.transaction_date,
  };

  if (id) {
    const { data, error } = await supabase
      .from("transactions")
      .update(normalizedPayload)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  }
//tambahan
console.log("Insert Data:", normalizedPayload);
  const { data, error } = await supabase.from("transactions").insert(normalizedPayload).select().single();

  if (error) {
    throw error;
  }

  return data;
}

export async function fetchDebts() {
  if (!isSupabaseConfigured || !supabase) {
    return [];
  }

  const userId = await getUserId();
  if (!userId) {
    return [];
  }

  const { data, error } = await supabase
    .from("debts")
    .select("*")
    .eq("user_id", userId)
    .order("due_date", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    if (error.code === "42P01") {
      return [];
    }
    throw error;
  }

  return data ?? [];
}

export async function fetchDebtById(id) {
  if (!isSupabaseConfigured || !supabase || !id) {
    return null;
  }

  const { data, error } = await supabase.from("debts").select("*").eq("id", id).maybeSingle();

  if (error) {
    if (error.code === "42P01") {
      return null;
    }
    throw error;
  }

  return data;
}

export async function saveDebt(payload, id = null) {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error("Supabase belum dikonfigurasi");
  }

  const userId = await getUserId();
  if (!userId) {
    throw new Error("Anda perlu login terlebih dahulu.");
  }

  const normalizedPayload = {
    user_id: userId,
    creditor: payload.creditor,
    amount: Number(payload.amount),
    remaining_amount: Number(payload.remaining_amount ?? payload.amount),
    due_date: payload.due_date,
    borrowed_date: payload.borrowed_date ?? new Date().toISOString().slice(0, 10),
    status: payload.status,
    note: payload.note,
  };

  if (id) {
    const { data, error } = await supabase.from("debts").update(normalizedPayload).eq("id", id).select().single();

    if (error) {
      throw error;
    }

    return data;
  }

  const { data, error } = await supabase.from("debts").insert(normalizedPayload).select().single();

  if (error) {
    throw error;
  }

  return data;
}

export async function fetchDashboardSummary() {
  const [transactions, debts] = await Promise.all([fetchTransactions(), fetchDebts()]);

  const monthPrefix = new Date().toISOString().slice(0, 7);
  const monthlyExpenses = transactions
    .filter((item) => item.transaction_date?.startsWith(monthPrefix))
    .reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const totalExpenses = transactions.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const totalDebt = debts
    .filter((item) => (item.status || "").toLowerCase() !== "lunas")
    .reduce((sum, item) => sum + Number(item.amount || 0), 0);

  return {
    totalExpenses,
    monthlyExpenses,
    totalDebt,
    recentTransactions: transactions.slice(0, 5),
  };
}
