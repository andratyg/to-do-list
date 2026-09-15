import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useData } from "../../context/DataContext";
import { X, User } from "lucide-react";

export default function UsernameModal({ isOpen, onClose }) {
  const { currentUser, changeUsername } = useAuth();
  const { showToast } = useData();
  const [name, setName] = useState("");

  useEffect(() => {
    setName(currentUser?.displayName || "");
  }, [currentUser, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      await changeUsername(name.trim());
      showToast("Nama panggilan berhasil diperbarui!", "success");
      onClose();
    } catch (e) {
      showToast("Gagal mengubah nama: " + e.message, "error");
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content fade-in-up" style={{ maxWidth: 360 }}>
        <div className="modal-head">
          <div className="title-with-icon">
            <User size={18} className="text-primary" />
            <h3 style={{ margin: 0 }}>Ganti Nama Panggilan</h3>
          </div>
          <button className="close-icon" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label>Nama Baru Kamu</label>
              <input
                type="text"
                placeholder="Masukkan nama panggilan..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoFocus
              />
            </div>
          </div>

          <div className="modal-foot">
            <button type="button" onClick={onClose} className="btn-secondary">
              Batal
            </button>
            <button type="submit" className="btn-primary glow">
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
