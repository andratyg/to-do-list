import React, { useState } from "react";
import { Music, X, Minimize2, Maximize2 } from "lucide-react";

export default function MusicWidget({ isOpen, onClose }) {
  const [isMinimized, setIsMinimized] = useState(false);

  if (!isOpen) return null;

  return (
    <div className={`floating-music-widget fade-in-up ${isMinimized ? "minimized" : ""}`}>
      <div className="music-widget-header">
        <div className="title-with-icon">
          <Music size={16} className="text-pink" />
          <span>Radio Lo-Fi Santai 🎧</span>
        </div>
        <div className="widget-controls">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="btn-icon-mini"
            title={isMinimized ? "Perbesar" : "Kecilkan"}
          >
            {isMinimized ? <Maximize2 size={13} /> : <Minimize2 size={13} />}
          </button>
          <button onClick={onClose} className="btn-icon-mini" title="Tutup Radio">
            <X size={13} />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <div className="music-widget-body">
          <iframe
            width="100%"
            height="180"
            src="https://www.youtube.com/embed/jfKfPfyJRdk?autoplay=0&enablejsapi=1"
            title="Lofi Hip Hop Radio"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      )}
    </div>
  );
}
