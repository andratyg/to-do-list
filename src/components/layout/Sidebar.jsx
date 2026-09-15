import React from "react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import {
  X,
  User,
  Calendar,
  CheckCircle,
  Wallet,
  Clock,
  Plus,
  Coins,
  CalendarPlus,
  Music,
  StickyNote,
  Trophy,
  Download,
  Trash2,
  LogOut,
  Shield,
  Volume2,
  FileSpreadsheet
} from "lucide-react";

export default function Sidebar({
  isOpen,
  onClose,
  onOpenTaskModal,
  onOpenFinanceModal,
  onOpenScheduleModal,
  onOpenAchievementsModal,
  onOpenRecapModal,
  onOpenCalendarModal,
  onOpenSoundModal,
  onOpenClearDataModal,
  onToggleMusic,
  onExportExcel,
  onExportJson
}) {
  const { currentUser, logout } = useAuth();

  const handleNavClick = (elementId) => {
    onClose();
    const el = document.getElementById(elementId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      <div className={`sidebar-drawer ${isOpen ? "active" : ""}`}>
        {/* User Profile Header */}
        <div className="sidebar-user-profile">
          <div className="sidebar-avatar-large">
            <User size={28} />
          </div>
          <div className="sidebar-user-info">
            <h4 className="user-name">{currentUser?.displayName || "Siswa Pro"}</h4>
            <small className="user-email">{currentUser?.email || "siswa@workspace.app"}</small>
          </div>
          <button onClick={onClose} className="close-sidebar-btn" title="Tutup Menu">
            <X size={20} />
          </button>
        </div>

        <div className="sidebar-divider" />

        <div className="sidebar-content-scroll">
          {/* Quick Navigation */}
          <div className="sidebar-group">
            <small className="sidebar-group-title">Navigasi Utama</small>
            <div className="sidebar-menu-item" onClick={() => handleNavClick("schedule-section")}>
              <div className="menu-icon purple"><Calendar size={16} /></div>
              <span>Jadwal Pelajaran</span>
            </div>
            <div className="sidebar-menu-item" onClick={() => handleNavClick("todo-section")}>
              <div className="menu-icon blue"><CheckCircle size={16} /></div>
              <span>Tugas & PR</span>
            </div>
            <div className="sidebar-menu-item" onClick={() => handleNavClick("finance-section")}>
              <div className="menu-icon green"><Wallet size={16} /></div>
              <span>Dompet & Keuangan</span>
            </div>
            <div className="sidebar-menu-item" onClick={() => handleNavClick("pomodoro-section")}>
              <div className="menu-icon red"><Clock size={16} /></div>
              <span>Mode Fokus (Pomodoro)</span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="sidebar-group">
            <small className="sidebar-group-title">Aksi Cepat</small>
            <div className="sidebar-menu-item" onClick={() => { onClose(); onOpenTaskModal(); }}>
              <div className="menu-icon blue"><Plus size={16} /></div>
              <span>Tambah Tugas Baru</span>
            </div>
            <div className="sidebar-menu-item" onClick={() => { onClose(); onOpenFinanceModal(); }}>
              <div className="menu-icon green"><Coins size={16} /></div>
              <span>Catat Transaksi</span>
            </div>
            <div className="sidebar-menu-item" onClick={() => { onClose(); onOpenScheduleModal(); }}>
              <div className="menu-icon purple"><CalendarPlus size={16} /></div>
              <span>Tambah Jadwal</span>
            </div>
          </div>

          {/* Utilities & Modals */}
          <div className="sidebar-group">
            <small className="sidebar-group-title">Fitur & Utilitas</small>
            <div className="sidebar-menu-item" onClick={() => { onClose(); onOpenCalendarModal(); }}>
              <div className="menu-icon amber"><Calendar size={16} /></div>
              <span>Kalender Akademik</span>
            </div>
            <div className="sidebar-menu-item" onClick={() => { onClose(); onOpenRecapModal(); }}>
              <div className="menu-icon blue"><FileSpreadsheet size={16} /></div>
              <span>Rekap Bulanan</span>
            </div>
            <div className="sidebar-menu-item" onClick={() => { onClose(); onToggleMusic(); }}>
              <div className="menu-icon pink"><Music size={16} /></div>
              <span>Radio Lo-Fi</span>
            </div>
            <div className="sidebar-menu-item" onClick={() => handleNavClick("sticky-section")}>
              <div className="menu-icon amber"><StickyNote size={16} /></div>
              <span>Catatan Cepat</span>
            </div>
            <div className="sidebar-menu-item" onClick={() => { onClose(); onOpenSoundModal(); }}>
              <div className="menu-icon teal"><Volume2 size={16} /></div>
              <span>Pengaturan Suara</span>
            </div>
          </div>

          {/* System & Data */}
          <div className="sidebar-group">
            <small className="sidebar-group-title">Sistem & Akun</small>
            <div className="sidebar-menu-item" onClick={() => { onClose(); onOpenAchievementsModal(); }}>
              <div className="menu-icon gold"><Trophy size={16} /></div>
              <span>Pencapaian Saya</span>
            </div>
            <div className="sidebar-menu-item" onClick={() => { onClose(); onExportExcel(); }}>
              <div className="menu-icon green"><Download size={16} /></div>
              <span>Download Laporan Excel</span>
            </div>
            <div className="sidebar-menu-item" onClick={() => { onClose(); onExportJson(); }}>
              <div className="menu-icon blue"><Download size={16} /></div>
              <span>Backup Data JSON</span>
            </div>
            <div className="sidebar-menu-item" onClick={() => { window.location.href = "admin.html"; }}>
              <div className="menu-icon orange"><Shield size={16} /></div>
              <span>Dashboard Admin</span>
            </div>
            <div className="sidebar-menu-item danger" onClick={() => { onClose(); onOpenClearDataModal(); }}>
              <div className="menu-icon red"><Trash2 size={16} /></div>
              <span>Reset Aplikasi</span>
            </div>
          </div>

          <div className="sidebar-version-tag">
            <p>Student Workspace Pro v3.0 (React)</p>
          </div>
        </div>

        {/* Sidebar Footer Logout */}
        <div className="sidebar-footer">
          <button onClick={() => { onClose(); logout(); }} className="btn-logout-side">
            <LogOut size={16} /> Keluar Akun
          </button>
        </div>
      </div>

      {/* Backdrop */}
      {isOpen && <div className="sidebar-backdrop active" onClick={onClose} />}
    </>
  );
}
