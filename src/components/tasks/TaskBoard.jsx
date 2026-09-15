import React, { useState } from "react";
import { useData } from "../../context/DataContext";
import TaskItem from "./TaskItem";
import {
  CheckCircle2,
  Plus,
  Search,
  SlidersHorizontal,
  Sparkles,
  ArrowRight
} from "lucide-react";

export default function TaskBoard({ onOpenTaskModal, onEditTask }) {
  const { tasks, addTask, updateTask, deleteTask } = useData();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // 'all' | 'active' | 'completed' | 'overdue'
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  // Fast inline task addition
  const [quickTitle, setQuickTitle] = useState("");
  const [quickPriority, setQuickPriority] = useState("medium");

  const handleQuickAdd = (e) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;

    addTask({
      title: quickTitle.trim(),
      priority: quickPriority,
      category: "Tugas Sekolah",
      deadline: new Date().toLocaleDateString("en-CA"),
      subtasks: []
    });

    setQuickTitle("");
  };

  const filteredTasks = tasks.filter((t) => {
    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = t.title.toLowerCase().includes(q);
      const matchCat = t.category?.toLowerCase().includes(q);
      if (!matchTitle && !matchCat) return false;
    }

    // Status filter
    const isCompleted = t.completed;
    const isOverdue =
      t.deadline &&
      !isCompleted &&
      new Date(t.deadline).setHours(23, 59, 59, 999) < new Date().getTime();

    if (statusFilter === "active" && isCompleted) return false;
    if (statusFilter === "completed" && !isCompleted) return false;
    if (statusFilter === "overdue" && (!isOverdue || isCompleted)) return false;

    // Category filter
    if (categoryFilter !== "all" && t.category !== categoryFilter) return false;

    // Priority filter
    if (priorityFilter !== "all" && t.priority !== priorityFilter) return false;

    return true;
  });

  const remainingActiveCount = tasks.filter((t) => !t.completed).length;

  return (
    <div id="todo-section" className="card todo-section fade-in-up">
      {/* Card Header */}
      <div className="card-header">
        <div className="title-with-icon">
          <div className="icon-box blue">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <h3>Tugas & Pekerjaan Rumah</h3>
            <p className="card-subtitle">
              {remainingActiveCount} tugas belum diselesaikan
            </p>
          </div>
        </div>

        <button onClick={onOpenTaskModal} className="btn-primary glow btn-sm">
          <Plus size={16} /> Tambah Lengkap
        </button>
      </div>

      {/* Fast Inline Task Input */}
      <form onSubmit={handleQuickAdd} className="quick-task-bar">
        <div className="quick-task-input-wrapper">
          <Sparkles size={16} className="quick-sparkle-icon" />
          <input
            type="text"
            placeholder="Tambah tugas cepat... (Tekan Enter)"
            value={quickTitle}
            onChange={(e) => setQuickTitle(e.target.value)}
          />
        </div>

        <div className="quick-task-controls">
          <select
            value={quickPriority}
            onChange={(e) => setQuickPriority(e.target.value)}
            className="quick-priority-select"
            title="Pilih Prioritas"
          >
            <option value="low">🟢 Rendah</option>
            <option value="medium">🟡 Sedang</option>
            <option value="high">🔴 Tinggi</option>
          </select>

          <button
            type="submit"
            disabled={!quickTitle.trim()}
            className="btn-quick-submit"
            title="Tambah Cepat"
          >
            <ArrowRight size={16} />
          </button>
        </div>
      </form>

      {/* Filter & Search Bar */}
      <div className="tasks-filter-bar">
        <div className="search-input-wrapper">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Cari nama tugas atau mapel..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="clear-search-btn">
              ×
            </button>
          )}
        </div>

        <div className="filter-dropdowns">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">Semua Kategori</option>
            <option value="Tugas Sekolah">Tugas Sekolah</option>
            <option value="PR Harian">PR Harian</option>
            <option value="Projek Kelompok">Projek Kelompok</option>
            <option value="Persiapan Ujian">Persiapan Ujian</option>
            <option value="Pribadi">Pribadi</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">Semua Prioritas</option>
            <option value="high">Prioritas Tinggi</option>
            <option value="medium">Prioritas Sedang</option>
            <option value="low">Prioritas Rendah</option>
          </select>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="task-status-tabs">
        <button
          onClick={() => setStatusFilter("all")}
          className={`status-tab ${statusFilter === "all" ? "active" : ""}`}
        >
          Semua ({tasks.length})
        </button>
        <button
          onClick={() => setStatusFilter("active")}
          className={`status-tab ${statusFilter === "active" ? "active" : ""}`}
        >
          Belum Selesai ({remainingActiveCount})
        </button>
        <button
          onClick={() => setStatusFilter("completed")}
          className={`status-tab ${statusFilter === "completed" ? "active" : ""}`}
        >
          Selesai ({tasks.filter((t) => t.completed).length})
        </button>
        <button
          onClick={() => setStatusFilter("overdue")}
          className={`status-tab ${statusFilter === "overdue" ? "active" : ""}`}
        >
          Terlambat (
          {
            tasks.filter(
              (t) =>
                !t.completed &&
                t.deadline &&
                new Date(t.deadline).setHours(23, 59, 59, 999) < new Date().getTime()
            ).length
          }
          )
        </button>
      </div>

      {/* Tasks List */}
      <div className="task-list-container">
        {filteredTasks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🎯</div>
            <h4>Tidak ada tugas ditemukan</h4>
            <p>
              {searchQuery || statusFilter !== "all"
                ? "Coba ubah filter atau kata kunci pencarian Anda."
                : "Semua tugas beres! Tulis tugas di kotak atas atau klik 'Tambah Lengkap'."}
            </p>
          </div>
        ) : (
          <div className="task-items-wrapper">
            {filteredTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onUpdate={updateTask}
                onDelete={deleteTask}
                onEdit={onEditTask}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
