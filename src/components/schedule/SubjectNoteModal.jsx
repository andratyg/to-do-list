import React, { useState, useEffect } from "react";
import { X, BookOpen, Save } from "lucide-react";

export default function SubjectNoteModal({
  isOpen,
  onClose,
  subjectName,
  currentNote,
  onSave
}) {
  const [noteText, setNoteText] = useState("");

  useEffect(() => {
    setNoteText(currentNote || "");
  }, [currentNote, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(subjectName, noteText);
    onClose();
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content fade-in-up" style={{ maxWidth: 450 }}>
        <div className="modal-head">
          <div className="title-with-icon">
            <BookOpen size={18} className="text-primary" />
            <h3 style={{ margin: 0 }}>Catatan: {subjectName}</h3>
          </div>
          <button className="close-icon" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label>Catatan khusus untuk materi atau tugas {subjectName}:</label>
              <textarea
                rows={6}
                placeholder="Tulis ringkasan rumus, kisi-kisi ulangan, atau catatan penting di sini..."
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                autoFocus
              />
            </div>
          </div>

          <div className="modal-foot">
            <button type="button" onClick={onClose} className="btn-secondary">
              Batal
            </button>
            <button type="submit" className="btn-primary glow">
              <Save size={15} /> Simpan Catatan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
