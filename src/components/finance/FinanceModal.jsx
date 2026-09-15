import React, { useState } from "react";
import { X, ArrowDownLeft, ArrowUpRight } from "lucide-react";

export default function FinanceModal({ isOpen, onClose, onSave, defaultType = "out" }) {
  const [type, setType] = useState(defaultType); // 'in' | 'out'
  const [amount, setAmount] = useState("");
  const [desc, setDesc] = useState("");
  const [category, setCategory] = useState("Makan & Minum");
  const [wallet, setWallet] = useState("Cash");

  React.useEffect(() => {
    if (isOpen) {
      setType(defaultType || "out");
      setAmount("");
      setDesc("");
    }
  }, [isOpen, defaultType]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const num = parseFloat(amount.replace(/[^0-9]/g, ""));
    if (isNaN(num) || num <= 0) return;

    onSave({
      type,
      amount: num,
      desc: desc.trim() || (type === "in" ? "Pemasukan" : "Pengeluaran"),
      category,
      wallet
    });

    setAmount("");
    setDesc("");
    onClose();
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content fade-in-up" style={{ maxWidth: 420 }}>
        <div className="modal-head">
          <h3>💰 Catat Transaksi Baru</h3>
          <button className="close-icon" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Tipe Selector Tab */}
            <div className="tx-type-toggle">
              <button
                type="button"
                className={`type-btn ${type === "out" ? "active-expense" : ""}`}
                onClick={() => setType("out")}
              >
                <ArrowUpRight size={16} /> Pengeluaran
              </button>
              <button
                type="button"
                className={`type-btn ${type === "in" ? "active-income" : ""}`}
                onClick={() => setType("in")}
              >
                <ArrowDownLeft size={16} /> Pemasukan
              </button>
            </div>

            {/* Nominal Input */}
            <div className="form-group">
              <label>Nominal (Rp)</label>
              <input
                type="number"
                placeholder="Contoh: 25000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                autoFocus
              />
            </div>

            {/* Keterangan */}
            <div className="form-group">
              <label>Keterangan</label>
              <input
                type="text"
                placeholder="Contoh: Makan siang di kantin"
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
              />
            </div>

            {/* Kategori */}
            <div className="form-group">
              <label>Kategori</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {type === "out" ? (
                  <>
                    <option value="Makan & Minum">🍜 Makan & Minum</option>
                    <option value="Transport">🚌 Transport</option>
                    <option value="Alat Tulis & Buku">📚 Alat Tulis & Buku</option>
                    <option value="Jajan & Nongkrong">☕ Jajan & Nongkrong</option>
                    <option value="Pulsa & Kuota">📶 Pulsa & Kuota</option>
                    <option value="Hiburan">🎮 Hiburan</option>
                    <option value="Lainnya">📦 Lainnya</option>
                  </>
                ) : (
                  <>
                    <option value="Uang Saku">💵 Uang Saku</option>
                    <option value="Gaji / Hasil Kerja">💼 Gaji / Hasil Kerja</option>
                    <option value="Hadiah / Bonus">🎁 Hadiah / Bonus</option>
                    <option value="Tabungan">🏦 Tabungan</option>
                    <option value="Lainnya">📦 Lainnya</option>
                  </>
                )}
              </select>
            </div>

            {/* Dompet / Sumber Dana */}
            <div className="form-group">
              <label>Dompet / Akun</label>
              <select
                value={wallet}
                onChange={(e) => setWallet(e.target.value)}
              >
                <option value="Cash">💵 Uang Tunai (Cash)</option>
                <option value="Dana">💙 DANA</option>
                <option value="Gopay">💚 GoPay</option>
                <option value="OVO">💜 OVO</option>
                <option value="Bank">🏦 Rekening Bank</option>
              </select>
            </div>
          </div>

          <div className="modal-foot">
            <button type="button" onClick={onClose} className="btn-secondary">
              Batal
            </button>
            <button type="submit" className="btn-primary glow">
              Simpan Transaksi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
