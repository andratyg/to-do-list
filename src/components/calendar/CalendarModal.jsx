import React, { useState } from "react";
import { useData } from "../../context/DataContext";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
  Trash2
} from "lucide-react";

export default function CalendarModal({ isOpen, onClose }) {
  const { tasks, calendarEvents, addCalendarEvent, deleteCalendarEvent } = useData();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState(
    new Date().toLocaleDateString("en-CA")
  );
  const [showAddForm, setShowAddForm] = useState(false);
  const [eventTitle, setEventTitle] = useState("");
  const [eventDate, setEventDate] = useState(new Date().toLocaleDateString("en-CA"));
  const [eventTime, setEventTime] = useState("");

  if (!isOpen) return null;

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];

  const firstDayIndex = new Date(year, month, 1).getDay();
  const totalDaysInMonth = new Date(year, month + 1, 0).getDate();

  const changeMonth = (offset) => {
    setCurrentDate(new Date(year, month + offset, 1));
  };

  const handleDayClick = (dayNum) => {
    const formattedDate = `${year}-${String(month + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
    setSelectedDateStr(formattedDate);
    setEventDate(formattedDate);
  };

  const handleSaveEvent = (e) => {
    e.preventDefault();
    if (!eventTitle.trim()) return;

    addCalendarEvent({
      title: eventTitle.trim(),
      date: eventDate,
      time: eventTime
    });

    setEventTitle("");
    setEventTime("");
    setShowAddForm(false);
  };

  // Find tasks & events for selected day
  const selectedDayTasks = tasks.filter((t) => t.deadline === selectedDateStr);
  const selectedDayEvents = calendarEvents.filter((e) => e.date === selectedDateStr);

  return (
    <div className="modal-backdrop">
      <div className="modal-content fade-in-up" style={{ maxWidth: 500 }}>
        {/* Head */}
        <div className="modal-head">
          <div className="title-with-icon">
            <CalendarIcon size={20} className="text-primary" />
            <h3 style={{ margin: 0 }}>Kalender Akademik</h3>
          </div>
          <div className="modal-head-actions">
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="btn-icon-mini text-primary"
              title="Tambah Acara"
            >
              <Plus size={18} />
            </button>
            <button className="close-icon" onClick={onClose}>
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="modal-body">
          {/* Controls: Prev, Month Year, Next */}
          <div className="calendar-controls">
            <button onClick={() => changeMonth(-1)} className="btn-icon-subtle">
              <ChevronLeft size={18} />
            </button>
            <h4 className="cal-month-title">
              {monthNames[month]} {year}
            </h4>
            <button onClick={() => changeMonth(1)} className="btn-icon-subtle">
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Grid Header Days */}
          <div className="cal-grid-header">
            <span>Min</span>
            <span>Sen</span>
            <span>Sel</span>
            <span>Rab</span>
            <span>Kam</span>
            <span>Jum</span>
            <span>Sab</span>
          </div>

          {/* Grid Days */}
          <div className="cal-days-grid">
            {/* Empty slots for start of month */}
            {Array.from({ length: firstDayIndex }).map((_, i) => (
              <div key={`empty-${i}`} className="cal-day-cell empty" />
            ))}

            {/* Days of current month */}
            {Array.from({ length: totalDaysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
              const isSelected = selectedDateStr === dateStr;
              const hasTask = tasks.some((t) => t.deadline === dateStr);
              const hasEvent = calendarEvents.some((e) => e.date === dateStr);
              const isToday = new Date().toLocaleDateString("en-CA") === dateStr;

              return (
                <div
                  key={`day-${dayNum}`}
                  onClick={() => handleDayClick(dayNum)}
                  className={`cal-day-cell ${isSelected ? "selected" : ""} ${isToday ? "today" : ""}`}
                >
                  <span className="day-number">{dayNum}</span>
                  <div className="day-dots">
                    {hasTask && <span className="dot-task" title="Ada Deadline Tugas" />}
                    {hasEvent && <span className="dot-event" title="Ada Acara" />}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Add Event Form Toggle */}
          {showAddForm && (
            <form onSubmit={handleSaveEvent} className="cal-add-event-box fade-in-up">
              <h5>➕ Tambah Acara Baru</h5>
              <div className="form-group">
                <input
                  type="text"
                  placeholder="Nama acara (contoh: Ujian Akhir, Pertemuan Kelompok)"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  required
                />
              </div>
              <div className="form-row-grid">
                <input
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  required
                />
                <input
                  type="time"
                  value={eventTime}
                  onChange={(e) => setEventTime(e.target.value)}
                />
              </div>
              <div className="form-actions-mini">
                <button type="button" onClick={() => setShowAddForm(false)} className="btn-secondary btn-sm">
                  Batal
                </button>
                <button type="submit" className="btn-primary glow btn-sm">
                  Simpan Acara
                </button>
              </div>
            </form>
          )}

          {/* Day Detail Box */}
          <div className="cal-detail-section">
            <h5 className="cal-detail-title">Detail Tanggal: {selectedDateStr}</h5>
            {selectedDayTasks.length === 0 && selectedDayEvents.length === 0 ? (
              <p className="empty-text">Tidak ada acara atau tugas pada tanggal ini.</p>
            ) : (
              <div className="cal-day-events-list">
                {selectedDayTasks.map((t) => (
                  <div key={t.id} className="cal-event-pill task-pill">
                    <span>📝 Tugas: {t.title}</span>
                    <span className="badge badge-primary">{t.priority || "Tugas"}</span>
                  </div>
                ))}
                {selectedDayEvents.map((e) => (
                  <div key={e.id} className="cal-event-pill event-pill">
                    <span>
                      📅 {e.title} {e.time && `(${e.time})`}
                    </span>
                    <button
                      onClick={() => deleteCalendarEvent(e.id)}
                      className="btn-icon-mini text-danger"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}
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
