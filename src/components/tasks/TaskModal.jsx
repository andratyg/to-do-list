import React, { useState, useEffect } from "react";
import { X, Plus, Trash2, Calendar, Tag, AlertTriangle } from "lucide-react";

export default function TaskModal({ isOpen, onClose, onSave, editingTask }) {
  const [title, setTitle] = useState("");
  const [deadline, setDeadline] = useState("");
  const [priority, setPriority] = useState("medium");
  const [category, setCategory] = useState("Tugas Sekolah");
  const [subtasks, setSubtasks] = useState([]);
  const [subtaskInput, setSubtaskInput] = useState("");

  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title || "");
      setDeadline(editingTask.deadline || "");
      setPriority(editingTask.priority || "medium");
      setCategory(editingTask.category || "Tugas Sekolah");
      setSubtasks(editingTask.subtasks || []);
    } else {
      setTitle("");
      setDeadline("");
      setPriority("medium");
      setCategory("Tugas Sekolah");
      setSubtasks([]);
    }
    setSubtaskInput("");
  }, [editingTask, isOpen]);

  if (!isOpen) return null;

  const handleAddSubtask = (e) => {
    e.preventDefault();
    if (!subtaskInput.trim()) return;
    setSubtasks([...subtasks, { text: subtaskInput.trim(), completed: false }]);
    setSubtaskInput("");
  };

  const handleRemoveSubtask = (idx) => {
    setSubtasks(subtasks.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave({
      title: title.trim(),
      deadline,
      priority,
      category,
      subtasks
    });
    onClose();
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content fade-in-up" style={{ maxWidth: 450 }}>
        <div className="modal-head">
          <h3>{editingTask ? "✏️ Edit Tugas" : "📝 Tambah Tugas Baru"}</h3>
          <button className="close-icon" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label>Judul Tugas / PR</label>
              <input
                type="text"
                placeholder="Contoh: Kerjakan Latihan Matematika Hal. 42"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div className="form-row-grid">
              <div className="form-group">
                <label>
                  <Calendar size={13} /> Batas Waktu
                </label>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>
                  <AlertTriangle size={13} /> Prioritas
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                >
                  <option value="low">Rendah</option>
                  <option value="medium">Sedang</option>
                  <option value="high">Tinggi</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>
                <Tag size={13} /> Kategori
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="Tugas Sekolah">Tugas Sekolah</option>
                <option value="PR Harian">PR Harian</option>
                <option value="Projek Kelompok">Projek Kelompok</option>
                <option value="Persiapan Ujian">Persiapan Ujian</option>
                <option value="Pribadi">Pribadi</option>
              </select>
            </div>

            {/* Subtasks Section */}
            <div className="form-group">
              <label>Langkah / Subtask (Opsional)</label>
              <div className="subtasks-input-row">
                <input
                  type="text"
                  placeholder="Tambahkan langkah..."
                  value={subtaskInput}
                  onChange={(e) => setSubtaskInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddSubtask(e);
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddSubtask}
                  className="btn-secondary"
                >
                  <Plus size={16} />
                </button>
              </div>

              {subtasks.length > 0 && (
                <div className="modal-subtasks-preview">
                  {subtasks.map((st, idx) => (
                    <div key={idx} className="subtask-chip">
                      <span>{st.text}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSubtask(idx)}
                        className="btn-chip-remove"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="modal-foot">
            <button type="button" onClick={onClose} className="btn-secondary">
              Batal
            </button>
            <button type="submit" className="btn-primary glow">
              {editingTask ? "Simpan Perubahan" : "Tambah Tugas"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
