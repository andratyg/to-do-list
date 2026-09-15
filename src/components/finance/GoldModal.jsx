import React, { useState } from "react";
import { X, Crown, Plus } from "lucide-react";

export default function GoldModal({ isOpen, onClose, goldTransactions, onAddGoldTx }) {
  const [txType, setTxType] = useState("buy"); // 'buy' | 'sell'
  const [weight, setWeight] = useState("");
  const [pricePerGram, setPricePerGram] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const w = parseFloat(weight);
    const p = parseFloat(pricePerGram);
    if (isNaN(w) || w <= 0) return;

    onAddGoldTx({
      type: txType,
      weight: w,
      pricePerGram: isNaN(p) ? 0 : p,
      total: (isNaN(p) ? 0 : p) * w
    });

    setWeight("");
    setPricePerGram("");
  };

  const totalGrams = goldTransactions.reduce((acc, tx) => {
    return tx.type === "buy" ? acc + Number(tx.weight || 0) : acc - Number(tx.weight || 0);
  }, 0);

  return (
    <div className="modal-backdrop">
      <div className="modal-content fade-in-up" style={{ maxWidth: 420 }}>
        <div className="modal-head">
          <div className="title-with-icon">
            <Crown size={20} color="#eab308" />
            <h3 style={{ margin: 0 }}>Tabungan & Transaksi Emas</h3>
          </div>
          <button className="close-icon" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {/* Gold Balance Banner */}
          <div className="gold-balance-card">
            <small>Total Kepemilikan Emas</small>
            <h2>{totalGrams.toFixed(2)} Gram</h2>
          </div>

          <form onSubmit={handleSubmit} className="gold-form">
            <div className="form-group">
              <label>Jenis Transaksi</label>
              <select value={txType} onChange={(e) => setTxType(e.target.value)}>
                <option value="buy">🟢 Beli (Tambah Emas)</option>
                <option value="sell">🔴 Jual (Kurangi Emas)</option>
              </select>
            </div>

            <div className="form-row-grid">
              <div className="form-group">
                <label>Berat (Gram)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="Contoh: 1.5"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Harga / Gram (Rp)</label>
                <input
                  type="number"
                  placeholder="Contoh: 1450000"
                  value={pricePerGram}
                  onChange={(e) => setPricePerGram(e.target.value)}
                />
              </div>
            </div>

            <button type="submit" className="btn-primary glow btn-block">
              <Plus size={15} /> Simpan Transaksi Emas
            </button>
          </form>

          {/* History */}
          <div className="gold-history-section">
            <h4>Riwayat Transaksi</h4>
            {goldTransactions.length === 0 ? (
              <p className="empty-text">Belum ada riwayat transaksi emas.</p>
            ) : (
              <div className="gold-history-list">
                {goldTransactions.map((tx) => (
                  <div key={tx.id} className="gold-tx-item">
                    <div>
                      <span className={`badge ${tx.type === "buy" ? "badge-success" : "badge-danger"}`}>
                        {tx.type === "buy" ? "Beli" : "Jual"}
                      </span>
                      <strong style={{ marginLeft: 8 }}>{tx.weight} gram</strong>
                    </div>
                    <small className="text-sub">{tx.date}</small>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="modal-foot">
          <button type="button" onClick={onClose} className="btn-secondary btn-block">
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
