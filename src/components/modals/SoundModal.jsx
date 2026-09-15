import React, { useState } from "react";
import { useData } from "../../context/DataContext";
import { playSuccessSound } from "../../utils/sound";
import { X, Volume2, Play } from "lucide-react";

export default function SoundModal({ isOpen, onClose }) {
  const { settings, updateSetting, showToast } = useData();
  const [selectedSound, setSelectedSound] = useState(settings?.sound || "bell");

  if (!isOpen) return null;

  const handleTestSound = (snd) => {
    playSuccessSound("ding", snd);
  };

  const handleSave = () => {
    updateSetting("sound", selectedSound);
    showToast("Pengaturan suara berhasil disimpan! 🔔", "success");
    onClose();
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content fade-in-up" style={{ maxWidth: 380 }}>
        <div className="modal-head">
          <div className="title-with-icon">
            <Volume2 size={18} className="text-primary" />
            <h3 style={{ margin: 0 }}>Pengaturan Suara Notifikasi</h3>
          </div>
          <button className="close-icon" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <p className="text-sub" style={{ fontSize: "0.85rem", marginBottom: 15 }}>
            Pilih efek suara untuk penyelesaian tugas dan timer fokus:
          </p>

          <div className="sound-options-list">
            {[
              { id: "bell", label: "Lonceng Sekolah (Bell)" },
              { id: "coin", label: "Koin Emas (Coin)" },
              { id: "ding", label: "Ting Halus (Ding)" },
              { id: "silent", label: "Mode Hening (Mute)" }
            ].map((s) => (
              <div
                key={s.id}
                onClick={() => setSelectedSound(s.id)}
                className={`sound-option-card ${selectedSound === s.id ? "active" : ""}`}
              >
                <div className="sound-option-left">
                  <input
                    type="radio"
                    name="sound-pref"
                    checked={selectedSound === s.id}
                    onChange={() => setSelectedSound(s.id)}
                  />
                  <span>{s.label}</span>
                </div>

                {s.id !== "silent" && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTestSound(s.id);
                    }}
                    className="btn-icon-mini"
                    title="Uji Suara"
                  >
                    <Play size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="modal-foot">
          <button onClick={onClose} className="btn-secondary">
            Batal
          </button>
          <button onClick={handleSave} className="btn-primary glow">
            Simpan Pilihan
          </button>
        </div>
      </div>
    </div>
  );
}
