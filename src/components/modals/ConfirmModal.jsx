import React from "react";
import { X, AlertTriangle } from "lucide-react";

export default function ConfirmModal({
  isOpen,
  onClose,
  title = "Konfirmasi Tindakan",
  message = "Apakah Anda yakin ingin melanjutkan tindakan ini?",
  confirmLabel = "Ya, Lanjutkan",
  confirmVariant = "danger",
  onConfirm
}) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-content fade-in-up" style={{ maxWidth: 380 }}>
        <div className="modal-head">
          <div className="title-with-icon">
            <AlertTriangle size={18} className="text-danger" />
            <h3 style={{ margin: 0 }}>{title}</h3>
          </div>
          <button className="close-icon" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <p className="confirm-message">{message}</p>
        </div>

        <div className="modal-foot">
          <button onClick={onClose} className="btn-secondary">
            Batal
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`btn-primary ${confirmVariant === "danger" ? "bg-danger" : ""}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
