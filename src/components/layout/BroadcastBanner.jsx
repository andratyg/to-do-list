import React, { useState } from "react";
import { useData } from "../../context/DataContext";
import { Megaphone, X } from "lucide-react";

export default function BroadcastBanner() {
  const { broadcast } = useData();
  const [dismissed, setDismissed] = useState(false);

  if (!broadcast || !broadcast.text || dismissed) return null;

  return (
    <div className="broadcast-container fade-in">
      <div className="broadcast-icon">
        <Megaphone size={16} /> <span>INFO:</span>
      </div>
      <div className="broadcast-wrapper">
        <p className="running-text">{broadcast.text}</p>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="btn-close-broadcast"
        title="Tutup Notifikasi"
      >
        <X size={14} />
      </button>
    </div>
  );
}
