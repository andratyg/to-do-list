import React, { useState } from "react";
import { useAuth } from "./context/AuthContext";
import { useData } from "./context/DataContext";
import Header from "./components/layout/Header";
import Sidebar from "./components/layout/Sidebar";
import BroadcastBanner from "./components/layout/BroadcastBanner";
import QuoteBanner from "./components/layout/QuoteBanner";
import TaskBoard from "./components/tasks/TaskBoard";
import TaskModal from "./components/tasks/TaskModal";
import FinanceCard from "./components/finance/FinanceCard";
import FinanceModal from "./components/finance/FinanceModal";
import GoldModal from "./components/finance/GoldModal";
import SubscriptionsModal from "./components/finance/SubscriptionsModal";
import PomodoroCard from "./components/pomodoro/PomodoroCard";
import ScheduleCard from "./components/schedule/ScheduleCard";
import ScheduleModal from "./components/schedule/ScheduleModal";
import SubjectNoteModal from "./components/schedule/SubjectNoteModal";
import CalendarModal from "./components/calendar/CalendarModal";
import StickyNotes from "./components/widgets/StickyNotes";
import MusicWidget from "./components/widgets/MusicWidget";
import AchievementModal from "./components/modals/AchievementModal";
import MonthlyRecapModal from "./components/modals/MonthlyRecapModal";
import SoundModal from "./components/modals/SoundModal";
import UsernameModal from "./components/modals/UsernameModal";
import ConfirmModal from "./components/modals/ConfirmModal";
import Toast from "./components/widgets/Toast";
import AuthModal from "./components/auth/AuthModal";
import { exportFinanceExcel, exportFullJson } from "./utils/exportExcel";

export default function App() {
  const { currentUser } = useAuth();
  const {
    addTask,
    updateTask,
    addTransaction,
    addGoldTx,
    goldTransactions,
    subscriptions,
    addSubscription,
    deleteSubscription,
    updateSchedule,
    scheduleNotes,
    updateScheduleNote,
    resetAllData,
    transactions,
    tasks,
    gamification,
    streak,
    jadwal
  } = useData();

  // Sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Music Widget
  const [musicOpen, setMusicOpen] = useState(false);

  // Modals state
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const [financeModalOpen, setFinanceModalOpen] = useState(false);
  const [financeDefaultType, setFinanceDefaultType] = useState("out");

  const handleOpenFinanceModal = (type = "out") => {
    setFinanceDefaultType(type);
    setFinanceModalOpen(true);
  };
  const [subModalOpen, setSubModalOpen] = useState(false);

  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [subjectNoteModalOpen, setSubjectNoteModalOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState("");

  const [calendarModalOpen, setCalendarModalOpen] = useState(false);
  const [recapModalOpen, setRecapModalOpen] = useState(false);
  const [achievementModalOpen, setAchievementModalOpen] = useState(false);
  const [soundModalOpen, setSoundModalOpen] = useState(false);
  const [usernameModalOpen, setUsernameModalOpen] = useState(false);

  // Confirm Modal state
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {}
  });

  // Task Handlers
  const handleOpenAddTask = () => {
    setEditingTask(null);
    setTaskModalOpen(true);
  };

  const handleOpenEditTask = (task) => {
    setEditingTask(task);
    setTaskModalOpen(true);
  };

  const handleSaveTask = (taskData) => {
    if (editingTask) {
      updateTask(editingTask.id, taskData);
    } else {
      addTask(taskData);
    }
  };

  // Schedule Save Handler
  const handleSaveScheduleItem = ({ scheduleType, day, item }) => {
    const updated = { ...jadwal };
    if (!updated[scheduleType]) updated[scheduleType] = {};
    if (!updated[scheduleType][day]) updated[scheduleType][day] = [];
    updated[scheduleType][day].push(item);
    updateSchedule(updated);
  };

  const handleOpenSubjectNote = (subjectName) => {
    setSelectedSubject(subjectName);
    setSubjectNoteModalOpen(true);
  };

  // Export handlers
  const handleExportExcel = () => {
    exportFinanceExcel(transactions, currentUser?.displayName || "Siswa");
  };

  const handleExportJson = () => {
    exportFullJson(
      {
        tasks,
        transactions,
        gamification,
        streak,
        jadwal,
        goldTransactions,
        subscriptions
      },
      currentUser?.displayName || "Siswa"
    );
  };

  // Reset Confirmation
  const handleOpenClearData = () => {
    setConfirmModal({
      isOpen: true,
      title: "Reset Seluruh Data Aplikasi?",
      message:
        "Tindakan ini akan mengosongkan daftar tugas, riwayat transaksi keuangan, dan catatan. Tindakan ini tidak dapat dibatalkan!",
      onConfirm: resetAllData
    });
  };

  if (!currentUser) {
    return (
      <>
        <AuthModal />
        <Toast />
      </>
    );
  }

  return (
    <div className="app-container">
      {/* Off-canvas Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onOpenTaskModal={handleOpenAddTask}
        onOpenFinanceModal={() => handleOpenFinanceModal("out")}
        onOpenScheduleModal={() => setScheduleModalOpen(true)}
        onOpenAchievementsModal={() => setAchievementModalOpen(true)}
        onOpenRecapModal={() => setRecapModalOpen(true)}
        onOpenCalendarModal={() => setCalendarModalOpen(true)}
        onOpenSoundModal={() => setSoundModalOpen(true)}
        onOpenClearDataModal={handleOpenClearData}
        onToggleMusic={() => setMusicOpen(!musicOpen)}
        onExportExcel={handleExportExcel}
        onExportJson={handleExportJson}
      />

      {/* Main Workspace Layout */}
      <main className="main-content">
        <Header
          onOpenSidebar={() => setSidebarOpen(true)}
          onOpenProfileModal={() => setUsernameModalOpen(true)}
        />

        <BroadcastBanner />
        <QuoteBanner />

        {/* Dashboard 2-Column Responsive Grid */}
        <div className="dashboard-grid">
          {/* Left Column: Schedule & Tasks */}
          <div className="dashboard-col left-col">
            <ScheduleCard
              onOpenAddModal={() => setScheduleModalOpen(true)}
              onOpenSubjectNote={handleOpenSubjectNote}
            />
            <TaskBoard
              onOpenTaskModal={handleOpenAddTask}
              onEditTask={handleOpenEditTask}
            />
          </div>

          {/* Right Column: Finance, Focus Pomodoro, Sticky Note */}
          <div className="dashboard-col right-col">
            <FinanceCard
              onOpenFinanceModal={handleOpenFinanceModal}
              onOpenGoldModal={() => setGoldModalOpen(true)}
              onOpenSubModal={() => setSubModalOpen(true)}
              onExportExcel={handleExportExcel}
            />
            <PomodoroCard />
            <StickyNotes />
          </div>
        </div>
      </main>

      {/* Floating Lo-Fi Radio */}
      <MusicWidget isOpen={musicOpen} onClose={() => setMusicOpen(false)} />

      {/* Interactive Modals */}
      <TaskModal
        isOpen={taskModalOpen}
        onClose={() => setTaskModalOpen(false)}
        onSave={handleSaveTask}
        editingTask={editingTask}
      />

      <FinanceModal
        isOpen={financeModalOpen}
        onClose={() => setFinanceModalOpen(false)}
        onSave={addTransaction}
        defaultType={financeDefaultType}
      />

      <GoldModal
        isOpen={goldModalOpen}
        onClose={() => setGoldModalOpen(false)}
        goldTransactions={goldTransactions}
        onAddGoldTx={addGoldTx}
      />

      <SubscriptionsModal
        isOpen={subModalOpen}
        onClose={() => setSubModalOpen(false)}
        subscriptions={subscriptions}
        onAddSub={addSubscription}
        onDeleteSub={deleteSubscription}
      />

      <ScheduleModal
        isOpen={scheduleModalOpen}
        onClose={() => setScheduleModalOpen(false)}
        onSave={handleSaveScheduleItem}
      />

      <SubjectNoteModal
        isOpen={subjectNoteModalOpen}
        onClose={() => setSubjectNoteModalOpen(false)}
        subjectName={selectedSubject}
        currentNote={scheduleNotes[selectedSubject] || ""}
        onSave={updateScheduleNote}
      />

      <CalendarModal
        isOpen={calendarModalOpen}
        onClose={() => setCalendarModalOpen(false)}
      />

      <MonthlyRecapModal
        isOpen={recapModalOpen}
        onClose={() => setRecapModalOpen(false)}
      />

      <AchievementModal
        isOpen={achievementModalOpen}
        onClose={() => setAchievementModalOpen(false)}
      />

      <SoundModal
        isOpen={soundModalOpen}
        onClose={() => setSoundModalOpen(false)}
      />

      <UsernameModal
        isOpen={usernameModalOpen}
        onClose={() => setUsernameModalOpen(false)}
      />

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
      />

      <Toast />
    </div>
  );
}
