// js/main.js
import * as Auth from './auth.js';
import * as DB from './db.js';
import * as Utils from './utils.js';
import * as Tasks from './tasks.js';
import * as Schedule from './schedule.js';
import * as Pomodoro from './pomodoro.js';
import * as Finance from './finance.js';
import * as Gamification from './gamification.js';
import { cachedData } from './config.js';

// --- INIT SYSTEM ---
document.addEventListener("DOMContentLoaded", () => {
    Auth.initAuthListener((uid) => {
        // Callback saat berhasil login
        DB.startFirebaseListener(uid, renderAll, Gamification.checkStreak);
        initApp();
    });
});

function renderAll() {
    Schedule.renderSchedule();
    Tasks.loadTasks();
    Finance.loadTransactions();
    Finance.loadTarget();
    Pomodoro.updateTimerDisplay();
    Pomodoro.loadPomodoroTasks();
    Gamification.updateGamificationUI();
    Pomodoro.renderFocusChart();
    
    if(document.getElementById('streakCount')) {
        document.getElementById('streakCount').innerText = cachedData.streak.count || 0;
    }
}

function initApp() {
    Utils.startClock();
    Utils.updateHeaderDate();
    Schedule.loadScheduleFilters();
    Pomodoro.loadSoundSettings();
    Utils.loadRandomQuote();
    Pomodoro.updateTimerDisplay();
    injectNewUI();
    
    // Shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey || e.metaKey) { 
            if (e.key === 't') { e.preventDefault(); document.getElementById('taskInput').focus(); }
            else if (e.key === 's') { e.preventDefault(); document.getElementById('startPauseBtn').click(); }
            else if (e.key === 'd') { e.preventDefault(); Utils.toggleDarkMode(); }
        }
    });

    setInterval(Schedule.checkReminders, 60000);
    setTimeout(Finance.checkSubscriptionReminders, 3000);
    
    window.addEventListener('blur', Pomodoro.handleTabBlur);
    window.addEventListener('focus', Pomodoro.handleTabFocus);
    window.addEventListener('beforeunload', Pomodoro.handleBeforeUnload);

    document.addEventListener('contextmenu', (event) => {
        if (Pomodoro.getIsExamMode()) {
            event.preventDefault(); 
            Utils.showToast("🚫 Klik Kanan dimatikan selama Mode Ujian!", "error");
            Utils.playSuccessSound('coin'); 
        }
    });
}

function injectNewUI() {
    if(!document.getElementById('musicWidget')) {
        const musicHTML = `
            <div id="musicWidget" style="position: fixed; bottom: 20px; left: 20px; z-index: 1000; background: var(--card-bg); padding: 10px; border-radius: 15px; box-shadow: var(--shadow-lg); border: 1px solid var(--border-color); width: 200px; transition: 0.3s;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 5px;">
                    <span style="font-weight:700; font-size:0.8rem;"><i class="fas fa-music"></i> Lo-Fi Radio</span>
                    <button onclick="document.getElementById('musicFrame').classList.toggle('hidden-music')" style="background:none; color:var(--text-sub);"><i class="fas fa-chevron-down"></i></button>
                </div>
                <div id="musicFrame" style="height: 100px; overflow: hidden; border-radius: 10px;">
                     <iframe width="100%" height="100%" src="https://www.youtube.com/embed/jfKfPfyJRdk?controls=0&autoplay=0" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                </div>
                <style>.hidden-music { height: 0 !important; }</style>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', musicHTML);
    }

    const pomodoroCard = document.querySelector('.pomodoro-card');
    if(pomodoroCard && !document.getElementById('focusChartSection')) {
        const chartHTML = `
            <div id="focusChartSection" style="margin-top: 20px; background: rgba(0,0,0,0.1); padding: 15px; border-radius: 12px; text-align: left;">
                <h4 style="font-size: 0.9rem; margin-bottom: 10px; color: white;">📊 Statistik Fokus Minggu Ini</h4>
                <div id="focusChart" style="display: flex; gap: 5px; align-items: flex-end; height: 80px; padding-bottom: 5px;">
                    </div>
            </div>
        `;
        pomodoroCard.appendChild(document.createElement('div')).innerHTML = chartHTML;
    }
}

// --- EXPOSE GLOBAL FUNCTIONS (untuk onclick di HTML) ---
window.handleLogin = Auth.handleLogin;
window.handleGoogleLogin = Auth.handleGoogleLogin;
window.handleRegister = Auth.handleRegister;
window.logoutUser = Auth.logoutUser;
window.switchAuthMode = Auth.switchAuthMode;
window.editUsername = Auth.editUsername;
window.saveUsername = Auth.saveUsername;

window.toggleSettings = Utils.toggleSettings;
window.toggleDarkMode = Utils.toggleDarkMode;
window.selectWallet = Utils.selectWallet;
window.importData = (el) => Utils.importData(el, (data) => { 
    // Logic import ada di DB tapi utils menangani file read, kita reload page di utils jadi cukup pass data
    // Sebenarnya di Utils.importData sudah handle reload.
});
window.exportData = () => Utils.exportData(cachedData);
window.openClearDataModal = Utils.openClearDataModal;
window.confirmClearUserData = Utils.confirmClearUserData;
window.saveSoundSettings = Pomodoro.saveSoundSettings;
window.showSoundSettings = Pomodoro.showSoundSettings;

window.handleTaskButton = Tasks.handleTaskButton;
window.toggleTask = Tasks.toggleTask;
window.deleteTask = Tasks.deleteTask;
window.loadTasks = Tasks.loadTasks;
window.filterTasks = Tasks.filterTasks;
window.loadTaskToEdit = Tasks.loadTaskToEdit;
window.clearCompletedTasks = Tasks.clearCompletedTasks;

window.changeDay = Schedule.changeDay;
window.changeWeekType = Schedule.changeWeekType;
window.renderSchedule = Schedule.renderSchedule;
window.openMapelNote = Schedule.openMapelNote;
window.saveNoteFromModal = Schedule.saveNoteFromModal;
window.deleteNote = Schedule.deleteNote;
window.closeNoteModal = Schedule.closeNoteModal;
window.openScheduleEdit = Schedule.openScheduleEdit;
window.saveScheduleChanges = Schedule.saveScheduleChanges;
window.closeScheduleEditModal = Schedule.closeScheduleEditModal;
window.openAddScheduleModal = Schedule.openAddScheduleModal;
window.saveNewSchedule = Schedule.saveNewSchedule;
window.deleteSchedule = Schedule.deleteSchedule;

window.setFocusType = Pomodoro.setFocusType;
window.startTimer = Pomodoro.startTimer;
window.pauseTimer = Pomodoro.pauseTimer;
window.resumeFocus = Pomodoro.resumeFocus;
window.resetTimer = Pomodoro.resetTimer;
window.toggleExamMode = Pomodoro.toggleExamMode;

window.addTransaction = Finance.addTransaction;
window.loadTransactions = Finance.loadTransactions;
window.delTxn = Finance.delTxn;
window.exportFinanceReport = Finance.exportFinanceReport;
window.editTarget = Finance.editTarget;
window.toggleTransferModal = Finance.toggleTransferModal;
window.executeTransfer = Finance.executeTransfer;
window.openSubModal = Finance.openSubModal;
window.addSubscription = Finance.addSubscription;
window.deleteSubscription = Finance.deleteSubscription;
window.openBudgetModal = Finance.openBudgetModal;
window.saveBudgets = Finance.saveBudgets;

window.openAchievementModal = Gamification.openAchievementModal;