import React from "react";
import { useData } from "../../context/DataContext";
import achievementsData from "../../data/achievements";
import { X, Trophy, CheckCircle, Lock } from "lucide-react";

export default function AchievementModal({ isOpen, onClose }) {
  const { unlockedAchievements } = useData();

  if (!isOpen) return null;

  const unlockedCount = unlockedAchievements?.length || 0;
  const totalCount = achievementsData.length;

  return (
    <div className="modal-backdrop">
      <div className="modal-content fade-in-up" style={{ maxWidth: 500 }}>
        <div className="modal-head">
          <div className="title-with-icon">
            <Trophy size={20} color="#eab308" />
            <h3 style={{ margin: 0 }}>Pencapaian Saya (Achievements)</h3>
            <span className="badge badge-primary">{unlockedCount} / {totalCount}</span>
          </div>
          <button className="close-icon" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body modal-scrollable" style={{ maxHeight: 420 }}>
          <div className="achievements-grid">
            {achievementsData.map((ach) => {
              const isUnlocked = unlockedAchievements?.includes(ach.id);
              return (
                <div
                  key={ach.id}
                  className={`achievement-card ${isUnlocked ? "unlocked" : "locked"}`}
                >
                  <div className="ach-icon-circle">
                    {isUnlocked ? (
                      <CheckCircle size={22} className="text-success" />
                    ) : (
                      <Lock size={20} className="text-sub" />
                    )}
                  </div>
                  <div className="ach-content">
                    <h5 className="ach-title">{ach.title}</h5>
                    <p className="ach-desc">{ach.desc}</p>
                    <span className="ach-xp-badge">+{ach.xp || 50} XP</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="modal-foot">
          <button onClick={onClose} className="btn-secondary btn-block">
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
