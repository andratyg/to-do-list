import React from "react";
import { useData } from "../../context/DataContext";
import { formatRupiah } from "../../utils/helpers";
import { X, CheckCircle2, Clock, Wallet, Flame, Printer } from "lucide-react";

export default function MonthlyRecapModal({ isOpen, onClose }) {
  const { tasks, transactions, streak } = useData();

  if (!isOpen) return null;

  const currentMonthName = new Date().toLocaleDateString("id-ID", {
    month: "long",
    year: "numeric"
  });

  const completedTasksCount = tasks.filter((t) => t.completed).length;

  const totalIncome = transactions
    .filter((t) => t.type === "in")
    .reduce((acc, t) => acc + (Number(t.amount) || 0), 0);

  const totalExpense = transactions
    .filter((t) => t.type === "out")
    .reduce((acc, t) => acc + (Number(t.amount) || 0), 0);

  const netSaved = Math.max(0, totalIncome - totalExpense);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content fade-in-up print-area" style={{ maxWidth: 480 }}>
        <div className="modal-head">
          <h3 style={{ margin: 0 }}>📊 Rekap Aktivitas Siswa</h3>
          <button className="close-icon no-print" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <div className="recap-header-center">
            <h2 className="text-primary">{currentMonthName}</h2>
            <p className="text-sub">Ringkasan kemajuan belajar dan produktivitas</p>
          </div>

          <div className="recap-stats-grid">
            <div className="recap-stat-card card-blue">
              <CheckCircle2 size={28} className="text-primary" />
              <h3>{completedTasksCount}</h3>
              <small>Tugas Selesai</small>
            </div>

            <div className="recap-stat-card card-red">
              <Clock size={28} className="text-danger" />
              <h3>{completedTasksCount * 25} Mnt</h3>
              <small>Estimasi Fokus</small>
            </div>

            <div className="recap-stat-card card-green">
              <Wallet size={28} className="text-success" />
              <h3>{formatRupiah(netSaved)}</h3>
              <small>Sisa Tabungan</small>
            </div>

            <div className="recap-stat-card card-orange">
              <Flame size={28} color="#f97316" />
              <h3>{streak?.count || 0} Hari</h3>
              <small>Streak Terjaga</small>
            </div>
          </div>

          <div className="recap-quote-box">
            <p>"Konsistensi kecil setiap hari akan membuahkan kesuksesan besar di masa depan. Pertahankan prestasimu!"</p>
          </div>
        </div>

        <div className="modal-foot no-print">
          <button onClick={handlePrint} className="btn-primary glow btn-block">
            <Printer size={16} /> Cetak / Simpan Laporan PDF
          </button>
        </div>
      </div>
    </div>
  );
}
