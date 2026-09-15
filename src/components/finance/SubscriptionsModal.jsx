import React, { useState } from "react";
import { X, Plus, Trash2, Repeat, Calendar } from "lucide-react";
import { formatRupiah } from "../../utils/helpers";

export default function SubscriptionsModal({
  isOpen,
  onClose,
  subscriptions,
  onAddSub,
  onDeleteSub
}) {
  const [name, setName] = useState("");
  const [cost, setCost] = useState("");
  const [billingDate, setBillingDate] = useState("");
  const [category, setCategory] = useState("Streaming");

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const c = parseFloat(cost);
    if (!name.trim() || isNaN(c) || c <= 0) return;

    onAddSub({
      name: name.trim(),
      cost: c,
      billingDate,
      category
    });

    setName("");
    setCost("");
    setBillingDate("");
  };

  const totalMonthlyCost = subscriptions.reduce((acc, s) => acc + (Number(s.cost) || 0), 0);

  return (
    <div className="modal-backdrop">
      <div className="modal-content fade-in-up" style={{ maxWidth: 450 }}>
        <div className="modal-head">
          <div className="title-with-icon">
            <Repeat size={20} className="text-primary" />
            <h3 style={{ margin: 0 }}>Langganan Rutin (Subscriptions)</h3>
          </div>
          <button className="close-icon" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {/* Cost Summary Banner */}
          <div className="sub-summary-card">
            <small>Total Pengeluaran Rutin Bulanan</small>
            <h2>{formatRupiah(totalMonthlyCost)}</h2>
          </div>

          <form onSubmit={handleSubmit} className="sub-add-form">
            <div className="form-group">
              <label>Nama Layanan / Langganan</label>
              <input
                type="text"
                placeholder="Contoh: Spotify, Netflix, Kuota Telkomsel"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-row-grid">
              <div className="form-group">
                <label>Biaya Bulanan (Rp)</label>
                <input
                  type="number"
                  placeholder="Contoh: 55000"
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Tanggal Tagihan (Tiap Bulan)</label>
                <input
                  type="number"
                  min="1"
                  max="31"
                  placeholder="Contoh: 25"
                  value={billingDate}
                  onChange={(e) => setBillingDate(e.target.value)}
                />
              </div>
            </div>

            <button type="submit" className="btn-primary glow btn-block">
              <Plus size={15} /> Tambah Langganan
            </button>
          </form>

          {/* Subscriptions List */}
          <div className="sub-list-section">
            <h4>Daftar Langganan Aktif ({subscriptions.length})</h4>
            {subscriptions.length === 0 ? (
              <p className="empty-text">Belum ada langganan rutin yang dicatat.</p>
            ) : (
              <div className="sub-items-list">
                {subscriptions.map((s) => (
                  <div key={s.id} className="sub-item-card">
                    <div>
                      <h5 style={{ margin: 0 }}>{s.name}</h5>
                      <small className="text-sub">
                        {s.billingDate ? `Tiap tanggal ${s.billingDate}` : "Bulanan"}
                      </small>
                    </div>
                    <div className="sub-item-right">
                      <strong>{formatRupiah(s.cost)}</strong>
                      <button
                        onClick={() => onDeleteSub(s.id)}
                        className="btn-icon-mini text-danger"
                        title="Hapus Langganan"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
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
