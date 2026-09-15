import React, { useState, useEffect } from "react";
import { useData } from "../../context/DataContext";
import { StickyNote as StickyIcon, Check } from "lucide-react";

export default function StickyNotes() {
  const { stickyNote, updateStickyNote } = useData();
  const [content, setContent] = useState("");
  const [isSaved, setIsSaved] = useState(true);

  useEffect(() => {
    setContent(stickyNote || "");
  }, [stickyNote]);

  const handleChange = (e) => {
    const val = e.target.value;
    setContent(val);
    setIsSaved(false);
  };

  // Debounced auto-save
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isSaved) {
        updateStickyNote(content);
        setIsSaved(true);
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [content, isSaved, updateStickyNote]);

  return (
    <div id="sticky-section" className="card sticky-note-card fade-in-up">
      <div className="card-header">
        <div className="title-with-icon">
          <div className="icon-box amber">
            <StickyIcon size={18} />
          </div>
          <div>
            <h3>Catatan Cepat (Sticky Note)</h3>
            <p className="card-subtitle">
              {isSaved ? "Tersimpan otomatis ke akunmu" : "Menyimpan perubahan..."}
            </p>
          </div>
        </div>

        {isSaved && (
          <span className="save-indicator">
            <Check size={14} className="text-success" /> Tersimpan
          </span>
        )}
      </div>

      <div className="sticky-body">
        <textarea
          rows={5}
          placeholder="Tulis ide mendadak, memo singkat, atau pengingat penting di sini..."
          value={content}
          onChange={handleChange}
          className="sticky-textarea"
        />
      </div>
    </div>
  );
}
