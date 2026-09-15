import React from "react";
import { useData } from "../../context/DataContext";
import { formatRupiah } from "../../utils/helpers";
import {
  Wallet,
  Eye,
  EyeOff,
  ArrowUpRight,
  ArrowDownLeft,
  Plus,
  Minus,
  Crown,
  Repeat,
  FileSpreadsheet,
  Trash2,
  AlertCircle
} from "lucide-react";

export default function FinanceCard({
  onOpenFinanceModal,
  onOpenGoldModal,
  onOpenSubModal,
  onExportExcel
}) {
  const { transactions, deleteTransaction, goldTransactions, settings, updateSetting } = useData();

  const hideBalance = settings?.hideBalance || false;

  const toggleHideBalance = () => {
    updateSetting("hideBalance", !hideBalance);
  };

  // Calculate totals
  const totalMasuk = transactions
    .filter((t) => t.type === "in")
    .reduce((acc, t) => acc + (Number(t.amount) || 0), 0);

  const totalKeluar = transactions
    .filter((t) => t.type === "out")
    .reduce((acc, t) => acc + (Number(t.amount) || 0), 0);

  const sisaSaldo = totalMasuk - totalKeluar;

  // Monthly Budget limit
  const monthlyLimit = 1000000;
  const budgetUsagePct = Math.min(100, Math.round((totalKeluar / monthlyLimit) * 100));

  // Gold balance calculation
  const totalGoldGrams = goldTransactions.reduce((acc, tx) => {
    return tx.type === "buy" ? acc + Number(tx.weight || 0) : acc - Number(tx.weight || 0);
  }, 0);

  return (
    <div id="finance-section" className="card finance-section fade-in-up">
      {/* Card Header */}
      <div className="card-header">
        <div className="title-with-icon">
          <div className="icon-box green">
            <Wallet size={20} />
          </div>
          <div>
            <h3>Dompet & Keuangan</h3>
            <p className="card-subtitle">Kelola uang saku, belanja, dan tabungan</p>
          </div>
        </div>

        {/* Action Buttons: Pemasukan & Pengeluaran */}
        <div className="finance-header-actions">
          <button
            onClick={() => onOpenFinanceModal("in")}
            className="btn-income-action"
            title="Tambah Pemasukan"
          >
            <Plus size={15} /> Pemasukan
          </button>
          <button
            onClick={() => onOpenFinanceModal("out")}
            className="btn-expense-action"
            title="Catat Pengeluaran"
          >
            <Minus size={15} /> Pengeluaran
          </button>
        </div>
      </div>

      {/* Saldo Hero Banner */}
      <div className="balance-hero-banner">
        <div className="balance-info-col">
          <div className="balance-label-row">
            <span>Sisa Saldo Kas</span>
            <button
              onClick={toggleHideBalance}
              className="btn-icon-mini text-sub"
              title={hideBalance ? "Tampilkan Saldo" : "Sensor Saldo (Mode Privasi)"}
            >
              {hideBalance ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <h2 className="balance-amount">
            {hideBalance ? "Rp ••••••••" : formatRupiah(sisaSaldo)}
          </h2>
        </div>

        <div className="balance-stats-pills">
          <div className="stat-pill pill-income" onClick={() => onOpenFinanceModal("in")} title="Klik untuk tambah pemasukan">
            <ArrowDownLeft size={16} className="text-success" />
            <div>
              <small>Masuk</small>
              <p>{hideBalance ? "••••" : formatRupiah(totalMasuk)}</p>
            </div>
          </div>

          <div className="stat-pill pill-expense" onClick={() => onOpenFinanceModal("out")} title="Klik untuk catat pengeluaran">
            <ArrowUpRight size={16} className="text-danger" />
            <div>
              <small>Keluar</small>
              <p>{hideBalance ? "••••" : formatRupiah(totalKeluar)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Budget Bar */}
      <div className="budget-progress-section">
        <div className="budget-meta-row">
          <span>
            Batas Belanja Bulanan: <strong>{formatRupiah(monthlyLimit)}</strong>
          </span>
          <span className={budgetUsagePct > 85 ? "text-danger font-bold" : ""}>
            {budgetUsagePct}% Terpakai
          </span>
        </div>
        <div className="budget-track">
          <div
            className={`budget-fill ${budgetUsagePct > 90 ? "bg-danger" : budgetUsagePct > 70 ? "bg-warning" : "bg-primary"}`}
            style={{ width: `${budgetUsagePct}%` }}
          />
        </div>
        {budgetUsagePct > 85 && (
          <p className="budget-warning-text">
            <AlertCircle size={13} /> Pengeluaran hampir mencapai batas bulanan! Hemat ya!
          </p>
        )}
      </div>

      {/* Quick Utilities: Gold, Subscriptions, Excel */}
      <div className="finance-sub-features">
        <button onClick={onOpenGoldModal} className="finance-sub-btn gold-btn" title="Kelola Tabungan Emas">
          <Crown size={15} />
          <span>Emas ({totalGoldGrams.toFixed(2)}g)</span>
        </button>
        <button onClick={onOpenSubModal} className="finance-sub-btn sub-btn" title="Lihat Langganan Rutin">
          <Repeat size={15} />
          <span>Langganan</span>
        </button>
        <button onClick={onExportExcel} className="finance-sub-btn excel-btn" title="Unduh File Laporan Excel (.xls)">
          <FileSpreadsheet size={15} />
          <span>Unduh Excel</span>
        </button>
      </div>

      {/* Transactions List */}
      <div className="transactions-list-section">
        <h4>Transaksi Terakhir</h4>
        {transactions.length === 0 ? (
          <div className="empty-state-mini">
            <p>Belum ada transaksi. Klik "+ Pemasukan" atau "- Pengeluaran" di atas!</p>
          </div>
        ) : (
          <div className="tx-list">
            {transactions.slice(0, 5).map((t) => {
              const isIncome = t.type === "in";
              return (
                <div key={t.id} className="tx-item">
                  <div className={`tx-icon-circle ${isIncome ? "income" : "expense"}`}>
                    {isIncome ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                  </div>

                  <div className="tx-details">
                    <p className="tx-desc">{t.desc || "Transaksi"}</p>
                    <small className="tx-meta">
                      {t.category || "Umum"} • {t.wallet || "Cash"} • {t.date}
                    </small>
                  </div>

                  <div className="tx-amount-col">
                    <span className={`tx-amount ${isIncome ? "text-success" : "text-danger"}`}>
                      {isIncome ? "+" : "-"}
                      {hideBalance ? "••••" : formatRupiah(t.amount)}
                    </span>
                    <button
                      onClick={() => deleteTransaction(t.id)}
                      className="tx-delete-btn"
                      title="Hapus Transaksi"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
