import React, { useState } from "react";
import { X, Calendar, Clock, BookOpen, User, Tag } from "lucide-react";

export default function ScheduleModal({ isOpen, onClose, onSave }) {
  const [scheduleType, setScheduleType] = useState("umum");
  const [day, setDay] = useState("Senin");
  const [mapel, setMapel] = useState("");
  const [guru, setGuru] = useState("");
  const [time, setTime] = useState("");
  const [type, setType] = useState("umum");

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!mapel.trim()) return;

    onSave({
      scheduleType,
      day,
      item: {
        mapel: mapel.trim(),
        guru: guru.trim(),
        time: time.trim() || "08.00 - 09.30",
        type
      }
    });

    setMapel("");
    setGuru("");
    setTime("");
    onClose();
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content fade-in-up" style={{ maxWidth: 450 }}>
        <div className="modal-head">
          <div className="title-with-icon">
            <Calendar size={18} className="text-primary" />
            <h3 style={{ margin: 0 }}>Tambah Jadwal Pelajaran</h3>
          </div>
          <button className="close-icon" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label>Kategori Jadwal</label>
              <select
                value={scheduleType}
                onChange={(e) => setScheduleType(e.target.value)}
              >
                <option value="umum">Jadwal Umum</option>
                <option value="produktif">Jadwal Produktif / Kejuruan</option>
              </select>
            </div>

            <div className="form-group">
              <label>Hari</label>
              <select value={day} onChange={(e) => setDay(e.target.value)}>
                <option value="Senin">Senin</option>
                <option value="Selasa">Selasa</option>
                <option value="Rabu">Rabu</option>
                <option value="Kamis">Kamis</option>
                <option value="Jumat">Jumat</option>
                <option value="Sabtu">Sabtu</option>
                <option value="Minggu">Minggu</option>
              </select>
            </div>

            <div className="form-group">
              <label>Mata Pelajaran</label>
              <input
                type="text"
                placeholder="Contoh: Matematika Wajib"
                value={mapel}
                onChange={(e) => setMapel(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div className="form-group">
              <label>Guru Pengajar</label>
              <input
                type="text"
                placeholder="Contoh: Budi Santoso, S.Pd"
                value={guru}
                onChange={(e) => setGuru(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Jam Pelajaran</label>
              <input
                type="text"
                placeholder="Contoh: 08.00 - 09.30"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-foot">
            <button type="button" onClick={onClose} className="btn-secondary">
              Batal
            </button>
            <button type="submit" className="btn-primary glow">
              Simpan Jadwal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
