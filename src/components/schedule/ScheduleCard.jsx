import React, { useState } from "react";
import { useData } from "../../context/DataContext";
import {
  Calendar,
  Plus,
  Filter,
  User,
  Clock,
  FileText,
  Trash2
} from "lucide-react";

export default function ScheduleCard({
  onOpenAddModal,
  onOpenSubjectNote
}) {
  const { jadwal, updateSchedule } = useData();

  const days = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];
  const currentDayIndex = new Date().getDay(); // 0 is Sunday
  const todayName = days[currentDayIndex === 0 ? 6 : currentDayIndex - 1];

  const [activeDay, setActiveDay] = useState(todayName || "Senin");
  const [scheduleType, setScheduleType] = useState("umum"); // 'umum' | 'produktif'
  const [guruFilter, setGuruFilter] = useState("all");

  const currentDayList =
    (jadwal?.[scheduleType]?.[activeDay]) || [];

  // Extract list of unique teachers for filter
  const allTeachers = Array.from(
    new Set(
      Object.values(jadwal?.[scheduleType] || {})
        .flat()
        .map((item) => item.guru)
        .filter(Boolean)
    )
  );

  const filteredItems = currentDayList.filter((item) => {
    if (guruFilter !== "all" && item.guru !== guruFilter) return false;
    return true;
  });

  const handleDeleteItem = (idx) => {
    const updatedTypeSchedule = { ...(jadwal?.[scheduleType] || {}) };
    const dayItems = [...(updatedTypeSchedule[activeDay] || [])];
    dayItems.splice(idx, 1);
    updatedTypeSchedule[activeDay] = dayItems;

    const newJadwal = {
      ...jadwal,
      [scheduleType]: updatedTypeSchedule
    };
    updateSchedule(newJadwal);
  };

  return (
    <div id="schedule-section" className="card schedule-section fade-in-up">
      {/* Header */}
      <div className="card-header">
        <div className="title-with-icon">
          <div className="icon-box purple">
            <Calendar size={20} />
          </div>
          <div>
            <h3>Jadwal Pelajaran Sekolah</h3>
            <p className="card-subtitle">Atur mata pelajaran harian dan catatan kelas</p>
          </div>
        </div>

        <div className="schedule-header-actions">
          <div className="schedule-type-pill">
            <button
              className={`type-pill-btn ${scheduleType === "umum" ? "active" : ""}`}
              onClick={() => setScheduleType("umum")}
            >
              Umum
            </button>
            <button
              className={`type-pill-btn ${scheduleType === "produktif" ? "active" : ""}`}
              onClick={() => setScheduleType("produktif")}
            >
              Produktif
            </button>
          </div>

          <button onClick={onOpenAddModal} className="btn-primary glow btn-sm">
            <Plus size={16} /> Tambah
          </button>
        </div>
      </div>

      {/* Day Selector Tabs */}
      <div className="schedule-days-bar">
        {days.map((day) => (
          <button
            key={day}
            onClick={() => setActiveDay(day)}
            className={`day-tab ${activeDay === day ? "active" : ""} ${day === todayName ? "is-today" : ""}`}
          >
            <span>{day}</span>
            {day === todayName && <small className="today-badge">Hari Ini</small>}
          </button>
        ))}
      </div>

      {/* Teacher Filter */}
      {allTeachers.length > 0 && (
        <div className="schedule-filter-strip">
          <label>
            <Filter size={13} /> Filter Guru:
          </label>
          <select
            value={guruFilter}
            onChange={(e) => setGuruFilter(e.target.value)}
            className="filter-select-mini"
          >
            <option value="all">Semua Guru Pengajar</option>
            {allTeachers.map((guru) => (
              <option key={guru} value={guru}>
                {guru}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Schedule Items List */}
      <div className="schedule-list-wrapper">
        {filteredItems.length === 0 ? (
          <div className="empty-state-mini">
            <p>Tidak ada mata pelajaran di hari {activeDay} ({scheduleType}).</p>
          </div>
        ) : (
          <div className="schedule-items-grid">
            {filteredItems.map((item, idx) => (
              <div key={idx} className="schedule-card-item">
                <div className="schedule-time-badge">
                  <Clock size={13} />
                  <span>{item.time || "08.00 - 09.30"}</span>
                </div>

                <div className="schedule-subject-details">
                  <h4 className="subject-title">{item.mapel}</h4>
                  {item.guru && (
                    <p className="subject-teacher">
                      <User size={13} /> {item.guru}
                    </p>
                  )}
                </div>

                <div className="schedule-item-actions">
                  <button
                    onClick={() => onOpenSubjectNote(item.mapel)}
                    className="btn-icon-subtle"
                    title="Buka Catatan Mapel"
                  >
                    <FileText size={15} />
                  </button>
                  <button
                    onClick={() => handleDeleteItem(idx)}
                    className="btn-icon-subtle text-danger"
                    title="Hapus Jadwal"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
