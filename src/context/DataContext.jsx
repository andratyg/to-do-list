import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { db, ref, set, onValue, update } from "../firebase/config";
import { useAuth } from "./AuthContext";
import defaultJadwalData from "../data/defaultSchedule";
import achievementsData from "../data/achievements";
import { playSuccessSound } from "../utils/sound";
import confetti from "canvas-confetti";

const DataContext = createContext();

export function useData() {
  return useContext(DataContext);
}

export function DataProvider({ children }) {
  const { currentUser } = useAuth();

  const [tasks, setTasks] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [gamification, setGamification] = useState({ xp: 0, level: 1 });
  const [streak, setStreak] = useState({ count: 0, lastLogin: null });
  const [jadwal, setJadwal] = useState(defaultJadwalData);
  const [scheduleNotes, setScheduleNotes] = useState({});
  const [stickyNote, setStickyNote] = useState("");
  const [focusLogs, setFocusLogs] = useState({});
  const [unlockedAchievements, setUnlockedAchievements] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [budgets, setBudgets] = useState({});
  const [goldTransactions, setGoldTransactions] = useState([]);
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [settings, setSettings] = useState({
    sound: "bell",
    hideBalance: false,
    theme: "dark"
  });
  const [broadcast, setBroadcast] = useState(null);
  const [toast, setToast] = useState(null);

  const toastTimeoutRef = useRef(null);

  const showToast = useCallback((message, type = "info") => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToast({ message, type, id: Date.now() });
    toastTimeoutRef.current = setTimeout(() => {
      setToast(null);
    }, 3500);
  }, []);

  // Generic Save to Firebase RTDB
  const saveDB = useCallback((key, data) => {
    if (!currentUser?.uid) return;
    const userRef = ref(db, `users/${currentUser.uid}/${key}`);
    set(userRef, data).catch((err) => console.error(`Error saving ${key}:`, err));
  }, [currentUser]);

  // Add XP and level up check
  const addXP = useCallback((amount) => {
    setGamification((prev) => {
      const current = prev || { xp: 0, level: 1 };
      let newXp = current.xp + amount;
      let newLevel = current.level;
      const xpNeeded = newLevel * 100;

      if (newXp >= xpNeeded) {
        newXp -= xpNeeded;
        newLevel += 1;

        // Trigger confetti and sound
        try {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
          });
        } catch (e) {}

        playSuccessSound("bell", settings.sound);
        showToast(`🎉 LEVEL UP! Sekarang Level ${newLevel}!`, "success");
      }

      const updated = { xp: newXp, level: newLevel };
      saveDB("gamification", updated);
      return updated;
    });
  }, [saveDB, settings.sound, showToast]);

  // Check achievements against current state
  const checkAchievements = useCallback((allData) => {
    if (!allData) return;
    const currentUnlocked = allData.unlockedAchievements || [];
    const newUnlocked = [...currentUnlocked];
    let gainedXP = 0;

    achievementsData.forEach((ach) => {
      if (!currentUnlocked.includes(ach.id)) {
        try {
          if (ach.check(allData)) {
            newUnlocked.push(ach.id);
            gainedXP += ach.xp || 50;
            showToast(`🏆 Pencapaian Terbuka: ${ach.title}! (+${ach.xp} XP)`, "success");
            playSuccessSound("coin", settings.sound);
          }
        } catch (e) {
          // In case of check condition error
        }
      }
    });

    if (newUnlocked.length > currentUnlocked.length) {
      setUnlockedAchievements(newUnlocked);
      saveDB("unlockedAchievements", newUnlocked);
      if (gainedXP > 0) {
        addXP(gainedXP);
      }
    }
  }, [addXP, saveDB, settings.sound, showToast]);

  // Daily Streak check
  const checkDailyStreak = useCallback((currentStreakData) => {
    const today = new Date().toLocaleDateString("en-CA");
    let current = currentStreakData || { count: 0, lastLogin: null };

    if (current.lastLogin !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toLocaleDateString("en-CA");

      let newCount = 1;
      if (current.lastLogin === yesterdayStr) {
        newCount = (current.count || 0) + 1;
      }

      const updatedStreak = { count: newCount, lastLogin: today };
      setStreak(updatedStreak);
      saveDB("streak", updatedStreak);

      setTimeout(() => {
        addXP(10);
        showToast(`🔥 Streak Harian: ${newCount} Hari! (+10 XP)`, "success");
        playSuccessSound("coin", settings.sound);
      }, 1500);
    }
  }, [addXP, saveDB, settings.sound, showToast]);

  // Firebase Realtime Listener for logged in user
  useEffect(() => {
    if (!currentUser?.uid) return;

    const userDbRef = ref(db, `users/${currentUser.uid}`);
    const unsubscribeUser = onValue(userDbRef, (snapshot) => {
      const val = snapshot.val();
      if (val) {
        if (val.tasks) setTasks(Array.isArray(val.tasks) ? val.tasks : Object.values(val.tasks));
        else setTasks([]);

        if (val.transactions) {
          setTransactions(Array.isArray(val.transactions) ? val.transactions : Object.values(val.transactions));
        } else setTransactions([]);

        if (val.gamification) setGamification(val.gamification);
        if (val.streak) setStreak(val.streak);
        if (val.jadwal) setJadwal(val.jadwal);
        if (val.scheduleNotes) setScheduleNotes(val.scheduleNotes);
        if (val.stickyNote !== undefined) setStickyNote(val.stickyNote);
        if (val.focusLogs) setFocusLogs(val.focusLogs);
        if (val.unlockedAchievements) setUnlockedAchievements(val.unlockedAchievements);
        if (val.subscriptions) {
          setSubscriptions(Array.isArray(val.subscriptions) ? val.subscriptions : Object.values(val.subscriptions));
        } else setSubscriptions([]);
        if (val.budgets) setBudgets(val.budgets);
        if (val.goldTransactions) {
          setGoldTransactions(Array.isArray(val.goldTransactions) ? val.goldTransactions : Object.values(val.goldTransactions));
        } else setGoldTransactions([]);
        if (val.calendarEvents) {
          setCalendarEvents(Array.isArray(val.calendarEvents) ? val.calendarEvents : Object.values(val.calendarEvents));
        } else setCalendarEvents([]);
        if (val.settings) setSettings((prev) => ({ ...prev, ...val.settings }));

        // Check streak on first load
        checkDailyStreak(val.streak);
      } else {
        // Initial setup for new user
        setJadwal(defaultJadwalData);
        saveDB("jadwal", defaultJadwalData);
        checkDailyStreak({ count: 0, lastLogin: null });
      }
    });

    // Listen to Global Broadcast Announcement
    const broadcastRef = ref(db, "broadcast");
    const unsubscribeBroadcast = onValue(broadcastRef, (snapshot) => {
      const data = snapshot.val();
      if (data && data.text) {
        const now = Date.now();
        if (data.expiry && now > data.expiry) {
          setBroadcast(null);
        } else {
          setBroadcast(data);
        }
      } else {
        setBroadcast(null);
      }
    });

    return () => {
      unsubscribeUser();
      unsubscribeBroadcast();
    };
  }, [currentUser?.uid, checkDailyStreak, saveDB]);

  // Trigger achievement check when primary data changes
  useEffect(() => {
    if (!currentUser?.uid) return;
    const aggregated = {
      tasks,
      transactions,
      gamification,
      streak,
      jadwal,
      subscriptions,
      unlockedAchievements
    };
    checkAchievements(aggregated);
  }, [tasks, transactions, gamification, streak, subscriptions, currentUser?.uid, checkAchievements, unlockedAchievements, jadwal]);

  // Task Operations
  const addTask = (task) => {
    const newTask = {
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      completed: false,
      subtasks: [],
      ...task
    };
    const updated = [newTask, ...tasks];
    setTasks(updated);
    saveDB("tasks", updated);
    showToast("Tugas berhasil ditambahkan! 📝", "success");
  };

  const updateTask = (taskId, updates) => {
    const updated = tasks.map((t) => {
      if (t.id === taskId) {
        const wasCompleted = t.completed;
        const willBeCompleted = updates.completed !== undefined ? updates.completed : wasCompleted;
        if (!wasCompleted && willBeCompleted) {
          // Reward XP on task completion!
          addXP(15);
          playSuccessSound("ding", settings.sound);
        }
        return { ...t, ...updates };
      }
      return t;
    });
    setTasks(updated);
    saveDB("tasks", updated);
  };

  const deleteTask = (taskId) => {
    const updated = tasks.filter((t) => t.id !== taskId);
    setTasks(updated);
    saveDB("tasks", updated);
    showToast("Tugas telah dihapus.", "info");
  };

  const reorderTasks = (newTasksList) => {
    setTasks(newTasksList);
    saveDB("tasks", newTasksList);
  };

  // Transaction Operations
  const addTransaction = (tx) => {
    const newTx = {
      id: Date.now().toString(),
      date: new Date().toLocaleDateString("en-CA"),
      createdAt: new Date().toISOString(),
      ...tx
    };
    const updated = [newTx, ...transactions];
    setTransactions(updated);
    saveDB("transactions", updated);
    addXP(10);
    playSuccessSound("coin", settings.sound);
    showToast("Transaksi berhasil dicatat! 💰 (+10 XP)", "success");
  };

  const deleteTransaction = (txId) => {
    const updated = transactions.filter((t) => t.id !== txId);
    setTransactions(updated);
    saveDB("transactions", updated);
    showToast("Transaksi telah dihapus.", "info");
  };

  // Sticky Note auto-save
  const updateStickyNote = (content) => {
    setStickyNote(content);
    saveDB("stickyNote", content);
  };

  // Update Settings
  const updateSetting = (key, value) => {
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    saveDB("settings", updated);
  };

  // Save Schedule Notes
  const updateScheduleNote = (subjectKey, note) => {
    const updated = { ...scheduleNotes, [subjectKey]: note };
    setScheduleNotes(updated);
    saveDB("scheduleNotes", updated);
    showToast("Catatan mata pelajaran disimpan! 📖", "success");
  };

  // Schedule CRUD
  const updateSchedule = (newJadwal) => {
    setJadwal(newJadwal);
    saveDB("jadwal", newJadwal);
    showToast("Jadwal pelajaran diperbarui!", "success");
  };

  // Subscriptions CRUD
  const addSubscription = (sub) => {
    const newSub = { id: Date.now().toString(), ...sub };
    const updated = [...subscriptions, newSub];
    setSubscriptions(updated);
    saveDB("subscriptions", updated);
    showToast("Langganan berhasil ditambahkan!", "success");
  };

  const deleteSubscription = (id) => {
    const updated = subscriptions.filter((s) => s.id !== id);
    setSubscriptions(updated);
    saveDB("subscriptions", updated);
    showToast("Langganan dihapus.", "info");
  };

  // Gold Transactions
  const addGoldTx = (tx) => {
    const newTx = { id: Date.now().toString(), date: new Date().toLocaleDateString("en-CA"), ...tx };
    const updated = [newTx, ...goldTransactions];
    setGoldTransactions(updated);
    saveDB("goldTransactions", updated);
    showToast("Transaksi emas disimpan! 👑", "success");
  };

  // Calendar Events
  const addCalendarEvent = (event) => {
    const newEv = { id: Date.now().toString(), ...event };
    const updated = [...calendarEvents, newEv];
    setCalendarEvents(updated);
    saveDB("calendarEvents", updated);
    showToast("Acara kalender disimpan! 📅", "success");
  };

  const deleteCalendarEvent = (id) => {
    const updated = calendarEvents.filter((e) => e.id !== id);
    setCalendarEvents(updated);
    saveDB("calendarEvents", updated);
    showToast("Acara kalender dihapus.", "info");
  };

  // Reset All App Data
  const resetAllData = () => {
    const emptyTasks = [];
    const emptyTransactions = [];
    const initialGamification = { xp: 0, level: 1 };
    const initialStreak = { count: 0, lastLogin: null };

    setTasks(emptyTasks);
    setTransactions(emptyTransactions);
    setGamification(initialGamification);
    setStreak(initialStreak);
    setJadwal(defaultJadwalData);
    setStickyNote("");
    setSubscriptions([]);
    setGoldTransactions([]);
    setCalendarEvents([]);

    saveDB("tasks", emptyTasks);
    saveDB("transactions", emptyTransactions);
    saveDB("gamification", initialGamification);
    saveDB("streak", initialStreak);
    saveDB("jadwal", defaultJadwalData);
    saveDB("stickyNote", "");
    saveDB("subscriptions", []);
    saveDB("goldTransactions", []);
    saveDB("calendarEvents", []);

    showToast("Aplikasi berhasil direset ke pengaturan awal.", "info");
  };

  const value = {
    tasks,
    transactions,
    gamification,
    streak,
    jadwal,
    scheduleNotes,
    stickyNote,
    focusLogs,
    unlockedAchievements,
    subscriptions,
    budgets,
    goldTransactions,
    calendarEvents,
    settings,
    broadcast,
    toast,
    showToast,
    saveDB,
    addXP,
    addTask,
    updateTask,
    deleteTask,
    reorderTasks,
    addTransaction,
    deleteTransaction,
    updateStickyNote,
    updateSetting,
    updateScheduleNote,
    updateSchedule,
    addSubscription,
    deleteSubscription,
    addGoldTx,
    addCalendarEvent,
    deleteCalendarEvent,
    resetAllData
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}
