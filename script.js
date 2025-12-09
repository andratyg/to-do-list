// ==================== SYSTEM & CONFIG ====================
let currentUser = null; // UID User
let isDataLoaded = false;

// Wadah Data Lokal (Updated dengan fitur baru)
let cachedData = {
  tasks: [],
  transactions: [],
  jadwal: null,
  settings: {},
  // --- FITUR BARU A & E ---
  gamification: { xp: 0, level: 1 },
  streak: { count: 0, lastLogin: null },
  focusLogs: {}, // Format: { "2023-10-27": 45 } (menit)
  scheduleNotes: {}, // Format: { "Senin_0": "Catatan..." }
};

// --- CONFIG LAINNYA ---
const WORK_DURATION_DEFAULT = 25 * 60;
const BREAK_DURATION_DEFAULT = 5 * 60;
const WORK_DURATION_EXAM = 50 * 60;
const BREAK_DURATION_EXAM = 10 * 60;

let timerInterval = null;
let isPaused = true;
let isWorking = true;
let timeLeft = WORK_DURATION_DEFAULT;

let lastTransaction = null;
let isExamMode = false;
let soundPreference = "bell";
let currentScheduleFilterGuru = "all";
let currentScheduleFilterCategory = "all";

// --- VARIABEL KONTROL FOKUS (UPDATED) ---
let isFocusLocked = false;
let isTabBlurred = false;
let blurCount = 0;
let savedFocusTime = null;
let savedBreakTime = null;
let focusType = 'strict'; // Default: 'strict' (Ketat) atau 'chill' (Santai)

// --- VARIABEL FITUR BARU ---
let currentNoteTarget = null; // Untuk menyimpan target catatan mapel (C)
let dragSrcEl = null; // Untuk Drag & Drop (F)

// --- DATA JADWAL DEFAULT ---
const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
const defaultJadwalData = {
  umum: {
    Senin: [
      { mapel: "Koding & AI", guru: "Juliana Mansur, S.Kom", time: "08.20 - 09.40", type: "produktif" },
      { mapel: "PAI & Budi Pekerti", guru: "Hapid, S.Ag", time: "10.00 - 11.20", type: "umum" },
      { mapel: "Matematika", guru: "Wijiastuti, S.Pd", time: "11.20 - 13.20", type: "umum" },
      { mapel: "Pend. Pancasila", guru: "Amanda Putri S, S.Pd", time: "13.20 - 14.40", type: "umum" },
      { mapel: "Bahasa Inggris", guru: "Endang Setiawan, S.Pd", time: "14.40 - 16.00", type: "umum" },
    ],
    Selasa: [
      { mapel: "KOKURIKULER", guru: "Nurulia Aprilia, S.Si", time: "08.00 - 15.50", type: "kokurikuler" },
    ],
    Rabu: [
      { mapel: "Bahasa Indonesia", guru: "Lia Siti Sholehah, S.Pd", time: "08.00 - 09.20", type: "umum" },
      { mapel: "Bahasa Inggris", guru: "Endang Setiawan, S.Pd", time: "09.40 - 11.00", type: "umum" },
      { mapel: "PAI", guru: "Hapid, S.Ag", time: "11.00 - 13.00", type: "umum" },
      { mapel: "Matematika", guru: "Wijiastuti, S.Pd", time: "13.00 - 14.30", type: "umum" },
      { mapel: "Pend. Pancasila", guru: "Amanda Putri S, S.Pd", time: "14.30 - 15.50", type: "umum" },
    ],
    Kamis: [
      { mapel: "Sejarah", guru: "Yessy Novita D, S.Pd", time: "08.00 - 09.20", type: "umum" },
      { mapel: "Bahasa Indonesia", guru: "Lia Siti Sholehah, S.Pd", time: "09.40 - 11.00", type: "umum" },
      { mapel: "Bahasa Sunda", guru: "Isti Hamidah", time: "11.00 - 13.00", type: "umum" },
      { mapel: "Matematika", guru: "Wijiastuti, S.Pd", time: "13.00 - 14.30", type: "umum" },
      { mapel: "Sejarah", guru: "Yessy Novita D, S.Pd", time: "14.30 - 15.50", type: "umum" },
    ],
    Jumat: [
      { mapel: "Koding & AI", guru: "Juliana Mansur, S.Kom", time: "07.45 - 09.05", type: "produktif" },
      { mapel: "Bahasa Inggris", guru: "Endang Setiawan, S.Pd", time: "09.05 - 10.25", type: "umum" },
      { mapel: "Bahasa Indonesia", guru: "Lia Siti Sholehah, S.Pd", time: "10.25 - 13.40", type: "umum" },
      { mapel: "Bahasa Sunda", guru: "Isti Hamidah", time: "13.40 - 15.00", type: "umum" },
    ],
  },
  produktif: {
    Senin: [
      { mapel: "DDPK (Juliana)", time: "08.20 - 09.40", type: "produktif" },
      { mapel: "PJOK", guru: "Noer Sandy M, S.Pd", time: "10.00 - 12.00", type: "umum" },
      { mapel: "DDPK (Duma)", time: "12.40 - 14.40", type: "produktif" },
      { mapel: "DDPK (Muslih)", time: "14.40 - 16.00", type: "produktif" },
    ],
    Selasa: [
      { mapel: "Projek IPAS", guru: "Nurulia Aprilia, S.Si", time: "08.00 - 11.40", type: "umum" },
      { mapel: "DDPK (Duma)", time: "12.20 - 14.30", type: "produktif" },
      { mapel: "Informatika", guru: "Nurdin", time: "14.30 - 15.50", type: "produktif" },
    ],
    Rabu: [
      { mapel: "Informatika", guru: "Nurdin", time: "08.00 - 09.20", type: "produktif" },
      { mapel: "PJOK", guru: "Noer Sandy M, S.Pd", time: "09.40 - 11.40", type: "umum" },
      { mapel: "Projek IPAS", guru: "Nurulia Aprilia, S.Si", time: "12.20 - 15.50", type: "umum" },
    ],
    Kamis: [
      { mapel: "DDPK (Full Day)", guru: "Iqbal Fajar Syahbana", time: "08.00 - 15.50", type: "produktif" },
    ],
    Jumat: [
      { mapel: "DDPK (Duma)", time: "07.45 - 10.25", type: "produktif" },
      { mapel: "Informatika", guru: "Nurdin", time: "10.25 - 13.40", type: "produktif" },
      { mapel: "DDPK (Duma)", time: "13.40 - 15.00", type: "produktif" },
    ],
  },
};

let jadwalData = defaultJadwalData;
let currentDayIdx = new Date().getDay();
let currentWeekType = "umum";
let taskFilter = "all";
let editingTaskId = null;

// ==================== QUOTES ====================
const motivationalQuotes = [
  "Fokus 25 menit, hasilnya 100%. Kamu bisa! 💪",
  "Masa depanmu diciptakan oleh apa yang kamu lakukan hari ini, bukan besok.",
  "Jangan berhenti saat lelah, berhentilah saat selesai.",
  "Rasa sakit karena disiplin lebih baik daripada rasa sakit karena penyesalan.",
  "Satu jam belajar hari ini lebih berharga dari seribu jam penyesalan nanti.",
  "Gas terus! 🚀",
  "Ingat, cicilan masa depan menanti. Kerja! 💸",
  "Kalau mimpimu tidak membuatmu takut, mungkin mimpimu kurang besar.",
  "Belajar itu memang berat, tapi kebodohan itu jauh lebih berat.",
  "Jadilah 1% lebih baik setiap harinya.",
  "Jangan tunggu motivasi, ciptakan momentummu sendiri.",
  "Scroll sosmed tidak akan membayarmu di masa depan.",
  "Sukses adalah jumlah dari usaha kecil yang diulang hari demi hari.",
  "Waktu tidak akan menunggu. Lakukan sekarang atau tidak sama sekali.",
  "Disiplin adalah melakukan apa yang harus dilakukan, bahkan saat kamu tidak ingin."
];

const funWords = ["Menyala Abangkuh! 🔥", "Gacor Parah! 🦅", "Kelas Pejabat! 🎩", "Savage! ⚔️", "GG Gaming! 🎮", "Auto Kaya! 💸", "Mulus Banget 🧈", "Slayyy! 💅", "Top Global 🌍", "Gak Ada Obat! 💊"];

// ==================== B. AUTHENTICATION LOGIC ====================

document.addEventListener("DOMContentLoaded", () => {
    initAuthListener(); 
});

function initAuthListener() {
    setTimeout(() => {
        if (!window.authListener) return;

        window.authListener(window.auth, (user) => {
            if (user) {
                const displayName = user.displayName ? user.displayName : user.email.split('@')[0];
                currentUser = displayName;
                const uid = user.uid; 
                
                document.getElementById('loginOverlay').style.display = 'none';
                document.getElementById('mainContent').style.display = 'block';
                
                document.getElementById('displayUsername').innerText = displayName; 
                updateGreeting(); 
                document.getElementById('loginStatusText').innerText = "Online";
                
                startFirebaseListener(uid); 
                initApp(uid); 
            } else {
                currentUser = null;
                document.getElementById('loginOverlay').style.display = 'flex';
                document.getElementById('mainContent').style.display = 'none';
            }
        });
    }, 1000);
}

window.switchAuthMode = function(mode) {
    const loginView = document.getElementById('loginView');
    const registerView = document.getElementById('registerView');
    if (mode === 'register') { loginView.style.display = 'none'; registerView.style.display = 'block'; }
    else { loginView.style.display = 'block'; registerView.style.display = 'none'; }
}
window.handleLogin = function() {
    const email = document.getElementById('loginEmail').value;
    const pass = document.getElementById('loginPass').value;
    if(!email || !pass) { document.getElementById('authErrorMsg').innerText = "Isi email dan password!"; return; }
    window.authSignIn(window.auth, email, pass).catch((e) => { document.getElementById('authErrorMsg').innerText = "Gagal: Email/Password salah."; });
}
window.handleGoogleLogin = function() { window.authSignInGoogle(window.auth, window.googleProvider).then(res => showToast(`Masuk: ${res.user.displayName}`, "success")).catch(e => console.error(e)); }
window.handleRegister = function() {
    const u = document.getElementById('regUsername').value; const e = document.getElementById('regEmail').value; const p = document.getElementById('regPass').value;
    if(!u || !e || !p) return alert("Lengkapi data!");
    window.authSignUp(window.auth, e, p).then(c => { window.authUpdateProfile(c.user, { displayName: u }).then(() => location.reload()); }).catch(e => alert(e.message));
}
window.logoutUser = function() { if(confirm("Keluar?")) window.authSignOut(window.auth).then(() => location.reload()); }
window.editUsername = function() { const u = window.auth.currentUser; if(u) { document.getElementById('newUsernameInput').value = u.displayName || ""; document.getElementById('usernameModal').style.display = 'flex'; } }
window.saveUsername = function() { const n = document.getElementById('newUsernameInput').value.trim(); if(n) window.authUpdateProfile(window.auth.currentUser, { displayName: n }).then(() => { document.getElementById('displayUsername').innerText = n; updateGreeting(); document.getElementById('usernameModal').style.display = 'none'; }); }

// ==================== C. FIREBASE DATA LOGIC ====================

function startFirebaseListener(uid) {
    if (!window.db || !window.dbOnValue) return;
    const userPath = 'users/' + uid;
    
    window.dbOnValue(window.dbRef(window.db, userPath), (snapshot) => {
        const data = snapshot.val();
        if (data) {
            cachedData.tasks = data.tasks || [];
            cachedData.transactions = data.transactions || [];
            cachedData.gamification = data.gamification || { xp: 0, level: 1 };
            cachedData.streak = data.streak || { count: 0, lastLogin: null };
            cachedData.focusLogs = data.focusLogs || {};
            cachedData.scheduleNotes = data.scheduleNotes || {};

            if (data.jadwal && data.jadwal.umum) cachedData.jadwal = data.jadwal;
            else { cachedData.jadwal = defaultJadwalData; saveDB('jadwalData', defaultJadwalData); }

            if(data.settings) {
                if(data.settings.theme) applyTheme(data.settings.theme);
                if(data.settings.weekType) currentWeekType = data.settings.weekType;
                if(data.settings.target) localStorage.setItem(`${uid}_target`, data.settings.target);
                if(data.settings.isExamMode) isExamMode = data.settings.isExamMode;
            }
        } else {
            cachedData.jadwal = defaultJadwalData;
            saveAllToCloud(uid); 
        }
        jadwalData = cachedData.jadwal;
        isDataLoaded = true;
        renderAll();
    });
}

function saveDB(key, data) {
    if (!isDataLoaded) return;
    const uid = window.auth.currentUser.uid;
    // Update local cache
    if(key === 'tasks') cachedData.tasks = data;
    if(key === 'transactions') cachedData.transactions = data;
    if(key === 'gamification') cachedData.gamification = data;
    if(key === 'streak') cachedData.streak = data;
    if(key === 'focusLogs') cachedData.focusLogs = data;
    if(key === 'scheduleNotes') cachedData.scheduleNotes = data;
    if(key === 'jadwalData') { cachedData.jadwal = data; jadwalData = data; key = 'jadwal'; }

    window.dbSet(window.dbRef(window.db, `users/${uid}/${key}`), data).catch(err => console.error("Save Error:", err));
}

function saveSetting(key, val) { const uid = window.auth.currentUser.uid; window.dbSet(window.dbRef(window.db, `users/${uid}/settings/${key}`), val); }

function saveAllToCloud(uid) {
    const targetUid = uid || (window.auth.currentUser ? window.auth.currentUser.uid : null);
    if(targetUid) window.dbSet(window.dbRef(window.db, `users/${targetUid}`), cachedData);
}

function getDB(key) { if (key === 'tasks') return cachedData.tasks || []; if (key === 'transactions') return cachedData.transactions || []; return []; }

// ==================== D. APP FEATURES LOGIC ====================

function initApp(uid) {
    startClock(); updateGreeting(); updateHeaderDate(); 
    loadScheduleFilters(); loadSoundSettings(); loadRandomQuote(); 
    updateTimerDisplay(); 
    injectNewUI(); 
    checkStreak(uid); 
    
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey || e.metaKey) { 
            if (e.key === 't') { e.preventDefault(); document.getElementById('taskInput').focus(); }
            else if (e.key === 's') { e.preventDefault(); document.getElementById('startPauseBtn').click(); }
            else if (e.key === 'd') { e.preventDefault(); toggleDarkMode(); }
        }
    });
    setInterval(checkReminders, 60000);
    
    window.addEventListener('blur', handleTabBlur);
    window.addEventListener('focus', handleTabFocus);
    window.addEventListener('beforeunload', handleBeforeUnload);
}

function injectNewUI() {
    // 1. XP Bar di Header Left
    if(!document.getElementById('xpContainer')) {
        const headerLeft = document.querySelector('.header-left');
        const xpHTML = `
            <div id="xpContainer" style="margin-top: 8px; background: rgba(0,0,0,0.1); border-radius: 10px; padding: 5px 10px; display: inline-block;">
                <div style="display:flex; justify-content:space-between; font-size: 0.75rem; font-weight: 700; margin-bottom: 3px;">
                    <span id="userLevelBadge">Lvl 1 Novice</span>
                    <span id="userXPText">0 / 100 XP</span>
                </div>
                <div style="width: 150px; height: 6px; background: #ddd; border-radius: 3px; overflow: hidden;">
                    <div id="userXPBar" style="height: 100%; width: 0%; background: linear-gradient(90deg, #6366f1, #8b5cf6); transition: width 0.5s;"></div>
                </div>
            </div>
            <div id="streakBadge" style="display:inline-flex; align-items:center; gap:5px; background: #fee2e2; color: #ef4444; padding: 5px 10px; border-radius: 20px; font-weight:bold; font-size:0.8rem; margin-left:10px;">
                <i class="fas fa-fire"></i> <span id="streakCount">0</span> Hari
            </div>
        `;
        headerLeft.insertAdjacentHTML('beforeend', xpHTML);
    }

    // 2. Music Player (LoFi) Floating Widget
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

    // 3. Focus Stats Chart
    const pomodoroCard = document.querySelector('.pomodoro-card');
    if(pomodoroCard && !document.getElementById('focusChart')) {
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

// --- GAMIFICATION ---
function addXP(amount) {
    let stats = cachedData.gamification;
    stats.xp += amount;
    const xpNeeded = stats.level * 100;
    if (stats.xp >= xpNeeded) {
        stats.xp -= xpNeeded;
        stats.level++;
        showToast(`🎉 LEVEL UP! Kamu sekarang Level ${stats.level}`, "success");
        playSuccessSound('bell'); 
        alert(`SELAMAT! 🥳\nKamu naik ke Level ${stats.level}\nTitle: ${getLevelTitle(stats.level)}`);
    }
    saveDB('gamification', stats);
    updateGamificationUI();
}

function getLevelTitle(lvl) {
    if(lvl < 5) return "Novice Student";
    if(lvl < 10) return "Apprentice Learner";
    if(lvl < 20) return "High Achiever";
    if(lvl < 50) return "Master of Focus";
    return "Grandmaster Scholar";
}

function updateGamificationUI() {
    const stats = cachedData.gamification;
    const xpNeeded = stats.level * 100;
    const pct = (stats.xp / xpNeeded) * 100;
    const xpBar = document.getElementById('userXPBar');
    if(xpBar) xpBar.style.width = `${pct}%`;
    const xpText = document.getElementById('userXPText');
    if(xpText) xpText.innerText = `${stats.xp} / ${xpNeeded} XP`;
    const lvlBadge = document.getElementById('userLevelBadge');
    if(lvlBadge) lvlBadge.innerText = `Lvl ${stats.level} ${getLevelTitle(stats.level)}`;
}

// --- STREAK ---
function checkStreak(uid) {
    const today = new Date().toISOString().split('T')[0];
    let streak = cachedData.streak;
    if (streak.lastLogin !== today) {
        const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        if (streak.lastLogin === yesterdayStr) { streak.count++; } else { streak.count = 1; }
        streak.lastLogin = today;
        saveDB('streak', streak);
    }
    document.getElementById('streakCount').innerText = streak.count;
}

// --- FOCUS STATS ---
function logFocusTime(minutes) {
    if(minutes <= 0) return;
    const today = new Date().toISOString().split('T')[0];
    let logs = cachedData.focusLogs;
    if(!logs[today]) logs[today] = 0;
    logs[today] += minutes;
    saveDB('focusLogs', logs);
    renderFocusChart();
}

function renderFocusChart() {
    const chart = document.getElementById('focusChart');
    if(!chart) return;
    chart.innerHTML = '';
    for(let i=6; i>=0; i--) {
        const d = new Date(); d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        const dayName = days[d.getDay()].substring(0,3); 
        const minutes = cachedData.focusLogs[dateStr] || 0;
        let heightPct = (minutes / 240) * 100;
        if(heightPct > 100) heightPct = 100;
        if(heightPct < 5 && minutes > 0) heightPct = 5;
        
        chart.innerHTML += `
            <div style="flex:1; display:flex; flex-direction:column; align-items:center; justify-content:flex-end; height:100%;">
                <div style="width:100%; background:rgba(255,255,255,0.3); height:${heightPct}%; border-radius:4px; position:relative; min-height: ${minutes>0?4:0}px;" title="${minutes} Menit"></div>
                <small style="font-size:0.6rem; color:white; margin-top:4px;">${dayName}</small>
            </div>
        `;
    }
}

function renderAll() {
    document.getElementById('weekTypeSelector').value = currentWeekType;
    checkExamMode();
    renderSchedule();
    loadTasks();
    loadTransactions();
    loadTarget();
    loadPomodoroTasks();
    updateGamificationUI(); 
    renderFocusChart(); 
}

// --- MODE FOKUS & LOGIKA KUNCI TAB (UPDATED) ---
function setFocusType(type) {
    if (!isPaused) return showToast("Jeda timer dulu untuk ganti mode!", "error");
    focusType = type;
    
    // Update UI Tombol
    document.getElementById('btnModeStrict').className = type === 'strict' ? 'mode-btn active' : 'mode-btn';
    document.getElementById('btnModeChill').className = type === 'chill' ? 'mode-btn active' : 'mode-btn';
    
    if (type === 'strict') showToast("Mode Ketat: Pindah tab = Timer Pause 🔒", "info");
    else showToast("Mode Santai: Bebas buka tab lain ☕", "success");
}

function setFocusLock(lock) {
    // Kunci hanya aktif jika Mode Strict DAN sedang timer berjalan
    isFocusLocked = lock && (focusType === 'strict');
    
    const focusModeElement = document.getElementById('focusModeLockText'); 
    if(focusModeElement) {
        focusModeElement.style.display = isFocusLocked ? 'block' : 'none';
        document.querySelector('.timer-controls').style.marginTop = isFocusLocked ? '10px' : '0';
    }
}

function handleTabBlur() {
    // Cek apakah Mode Strict aktif
    if (focusType === 'strict' && isFocusLocked && !isPaused && isWorking) {
        isTabBlurred = true;
        blurCount++;
        pauseTimer(); 
        showToast(`❌ MODE KETAT: Timer dijeda karena pindah tab!`, 'error');
    }
}

function handleTabFocus() {
    if (focusType === 'strict' && isFocusLocked && isTabBlurred) {
        isTabBlurred = false;
    }
}

function handleBeforeUnload(event) {
    if (!isPaused && isWorking) {
        event.preventDefault();
        event.returnValue = "Timer sedang berjalan! Yakin ingin keluar?";
        return "Timer sedang berjalan! Yakin ingin keluar?";
    }
}

// --- UTILS UI ---
function updateGreeting() { 
    const h = new Date().getHours(); 
    let greet = 'Halo';
    let emoji = '👋';
    if (h < 11) { greet = 'Selamat Pagi'; emoji = '☀️'; }
    else if (h < 15) { greet = 'Selamat Siang'; emoji = '🌤️'; }
    else if (h < 18) { greet = 'Selamat Sore'; emoji = '🌇'; }
    else { greet = 'Selamat Malam'; emoji = '🌙'; }

    const userDisplay = currentUser || 'User';
    document.getElementById('greeting').innerHTML = `${greet}, <span class="text-gradient">${escapeHtml(userDisplay)}</span>! ${emoji}`; 
}

function updateHeaderDate() { document.getElementById('headerDate').innerHTML = `<i class="far fa-calendar"></i> ${new Date().toLocaleDateString('id-ID', {weekday:'long', day:'numeric', month:'long', year:'numeric'})}`; }
function startClock() { setInterval(() => { const n=new Date(); document.getElementById('clockTime').innerText=n.toLocaleTimeString('id-ID'); }, 1000); }
function showToast(m, t) { 
    const b=document.getElementById('toastBox'); const d=document.createElement('div'); 
    d.className=`toast ${t}`; d.innerHTML=`<i class="fas fa-${t==='success'?'check-circle':t==='info'?'bell':'exclamation-circle'}"></i> ${m}`; 
    b.appendChild(d); setTimeout(()=>d.remove(), 3000); 
}
function toggleDarkMode() { 
    document.body.classList.toggle('dark-mode'); 
    const uid = window.auth.currentUser.uid;
    const theme = document.body.classList.contains('dark-mode')?'dark':'light';
    saveSetting('theme', theme);
}
function applyTheme(theme) {
    if(theme === 'dark') document.body.classList.add('dark-mode');
    else document.body.classList.remove('dark-mode');
}

// --- POMODORO ---
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
function playSuccessSound(type = 'ding') {
    if (soundPreference === 'silent') return;
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.connect(g);
    g.connect(audioCtx.destination);
    if (type === 'ding') {
        o.type = 'sine'; o.frequency.setValueAtTime(1200, audioCtx.currentTime); 
        o.frequency.exponentialRampToValueAtTime(600, audioCtx.currentTime + 0.5); 
        g.gain.setValueAtTime(0.1, audioCtx.currentTime); g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.5); 
        o.start(); o.stop(audioCtx.currentTime + 0.5);
    } else if (type === 'coin') {
        o.type = 'triangle'; o.frequency.setValueAtTime(900, audioCtx.currentTime);
        g.gain.setValueAtTime(0.1, audioCtx.currentTime); g.gain.linearRampToValueAtTime(0.0001, audioCtx.currentTime + 0.3);
        o.start(); o.stop(audioCtx.currentTime + 0.3);
    } else if (type === 'bell') {
        o.type = 'sawtooth'; o.frequency.setValueAtTime(440, audioCtx.currentTime);
        g.gain.setValueAtTime(0.15, audioCtx.currentTime); g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 1.5);
        o.start(); o.stop(audioCtx.currentTime + 1.5);
    }
}

function formatTime(s) {
    const m = Math.floor(s / 60);
    const rs = s % 60;
    return `${String(m).padStart(2, '0')}:${String(rs).padStart(2, '0')}`;
}

function updateTimerDisplay() {
    document.getElementById('timerDisplay').innerText = formatTime(timeLeft);
    const card = document.querySelector('.pomodoro-card');
    
    if(isWorking) {
        document.getElementById('timerMode').innerText = "FOKUS";
        document.getElementById('timerMessage').innerText = "Waktunya Bekerja Keras";
        card.classList.remove('mode-break');
        if(!isPaused) {
            document.getElementById('startPauseBtn').innerText = "Jeda";
            document.getElementById('startPauseBtn').setAttribute('onclick', 'pauseTimer()');
        } else {
             document.getElementById('startPauseBtn').innerText = "Mulai";
             document.getElementById('startPauseBtn').setAttribute('onclick', 'startTimer()');
        }
    } else {
        document.getElementById('timerMode').innerText = "ISTIRAHAT";
        document.getElementById('timerMessage').innerText = "Istirahat Sejenak";
        card.classList.add('mode-break');
        if(!isPaused) {
            document.getElementById('startPauseBtn').innerText = "Skip Istirahat";
            document.getElementById('startPauseBtn').setAttribute('onclick', 'resumeFocus()');
        } else {
            document.getElementById('startPauseBtn').innerText = "Lanjut Fokus";
            document.getElementById('startPauseBtn').setAttribute('onclick', 'resumeFocus()');
        }
    }
    if (timeLeft === 0) toggleMode();
}

function startTimer() {
    if (!isPaused) return;
    isPaused = false;
    if(isWorking) setFocusLock(true); 
    updateTimerDisplay();
    timerInterval = setInterval(() => { timeLeft--; updateTimerDisplay(); }, 1000);
}

function pauseTimer() {
    if (isPaused) return;
    isPaused = true;
    clearInterval(timerInterval);
    
    if (isWorking) {
        savedFocusTime = timeLeft; 
        const durationSetting = isExamMode ? WORK_DURATION_EXAM : WORK_DURATION_DEFAULT;
        const workedMinutes = Math.floor((durationSetting - timeLeft) / 60);
        if(workedMinutes > 0) logFocusTime(workedMinutes);

        isWorking = false; 
        if (savedBreakTime !== null && savedBreakTime > 0) timeLeft = savedBreakTime; 
        else timeLeft = isExamMode ? BREAK_DURATION_EXAM : BREAK_DURATION_DEFAULT; 
        
        showToast("Fokus dijeda. Istirahat dulu!", "info");
        updateTimerDisplay();
        startTimer(); 
    }
    setFocusLock(false); 
}

function resumeFocus() {
    savedBreakTime = timeLeft; 
    clearInterval(timerInterval);
    isPaused = true;
    isWorking = true;
    if (savedFocusTime !== null && savedFocusTime > 0) {
        timeLeft = savedFocusTime;
        showToast("Melanjutkan Fokus...", "success");
    } else {
        timeLeft = isExamMode ? WORK_DURATION_EXAM : WORK_DURATION_DEFAULT;
        showToast("Mulai Fokus Baru", "success");
    }
    savedFocusTime = null;
    updateTimerDisplay();
    startTimer();
}

function resetTimer() {
    clearInterval(timerInterval);
    isPaused = true;
    isWorking = true;
    timeLeft = isExamMode ? WORK_DURATION_EXAM : WORK_DURATION_DEFAULT; 
    savedFocusTime = null; 
    savedBreakTime = null;
    updateTimerDisplay();
    setFocusLock(false);
}

function toggleMode() {
    clearInterval(timerInterval);
    isPaused = true;
    if (isWorking) {
         const durationSetting = isExamMode ? WORK_DURATION_EXAM : WORK_DURATION_DEFAULT;
         const workedMinutes = Math.floor(durationSetting / 60);
         logFocusTime(workedMinutes);
         addXP(20); 
         isWorking = false;
         savedBreakTime = null;
         timeLeft = isExamMode ? BREAK_DURATION_EXAM : BREAK_DURATION_DEFAULT;
         showToast("Waktunya ISTIRAHAT! ☕ (+20 XP)", "info");
    } else {
        isWorking = true;
        savedFocusTime = null;
        timeLeft = isExamMode ? WORK_DURATION_EXAM : WORK_DURATION_DEFAULT;
        showToast("Kembali FOKUS! 🔔", "info");
    }
    playSuccessSound('bell');
    updateTimerDisplay();
    startTimer(); 
}

function loadPomodoroTasks() {
    const s = document.getElementById('pomodoroTaskSelector');
    if(!s) return;
    s.innerHTML = '<option value="">-- Pilih Tugas untuk Fokus --</option>';
    cachedData.tasks.filter(t => !t.completed).forEach(t => {
        const o = document.createElement('option');
        o.value = t.id; o.innerText = t.text; s.appendChild(o);
    });
}

// --- JADWAL ---
function changeDay(dir) { currentDayIdx += dir; if(currentDayIdx>6) currentDayIdx=0; if(currentDayIdx<0) currentDayIdx=6; renderSchedule(); }
function changeWeekType() { 
    currentWeekType = document.getElementById('weekTypeSelector').value; 
    saveSetting('weekType', currentWeekType);
    renderSchedule(); 
}
function loadScheduleFilters() {
    const guruSet = new Set();
    const guruSelector = document.getElementById('scheduleFilterGuru');
    if (!guruSelector || !jadwalData) return;
    Object.values(jadwalData).forEach(week => {
        Object.values(week).forEach(dayData => {
            dayData.forEach(item => { if (item.guru) guruSet.add(item.guru); });
        });
    });
    guruSelector.innerHTML = '<option value="all">Filter Guru/Dosen (Semua)</option>';
    Array.from(guruSet).sort().forEach(guru => {
        guruSelector.innerHTML += `<option value="${escapeHtml(guru)}">${escapeHtml(guru)}</option>`;
    });
}
function getWeekNumber(d) {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    var yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

function renderSchedule() {
    const dayName = days[currentDayIdx];
    document.getElementById('activeDayName').innerText = dayName.toUpperCase();
    
    let currentWeekDisplay = currentWeekType;
    if (currentWeekType === 'auto') currentWeekDisplay = (getWeekNumber(new Date()) % 2 !== 0) ? 'umum' : 'produktif';
    
    if(!jadwalData) return;
    let data = jadwalData[currentWeekDisplay][dayName];
    const tbody = document.getElementById('scheduleBody');
    const now = new Date();
    const curMins = now.getHours() * 60 + now.getMinutes();
    const isToday = currentDayIdx === now.getDay();
    
    tbody.innerHTML = '';
    const filterCat = document.getElementById('scheduleFilterCategory').value;
    const filterGuru = document.getElementById('scheduleFilterGuru').value;

    if (data) data = data.filter(item => (filterCat === 'all' || item.type === filterCat) && (filterGuru === 'all' || item.guru === filterGuru));

    let statusWidget = document.getElementById('liveStatusWidget');
    if (!statusWidget) {
        document.querySelector('.schedule-status-bar').innerHTML = `<div id="liveStatusWidget" class="live-status-widget"><div class="status-icon-box"><i class="fas fa-bolt" id="statusIcon"></i></div><div class="status-content"><h4 id="statusLabel">STATUS SAAT INI</h4><p id="statusText">Memuat...</p></div></div>`;
        statusWidget = document.getElementById('liveStatusWidget');
    }

    if(!data || data.length === 0) { 
        tbody.parentElement.style.display='none'; 
        document.getElementById('holidayMessage').style.display='block'; 
        if(statusWidget) {
            document.getElementById('statusText').innerText = "Tidak ada jadwal (Libur)";
            statusWidget.className = "live-status-widget status-chill";
        }
        return; 
    }
    
    tbody.parentElement.style.display='table'; 
    document.getElementById('holidayMessage').style.display='none';
    let statusText = "Belum Mulai";
    let statusClass = "live-status-widget"; 
    let iconClass = "fas fa-clock";

    if (isToday) {
        if (now.getHours() >= 17) {
            statusText = "Selesai. Besok lagi!";
            statusClass += " status-chill";
            iconClass = "fas fa-moon";
        } else {
            let ongoing = false;
            data.forEach(item => {
                const parts = item.time.split("-");
                if(parts.length >= 2) {
                    const start = parts[0].trim().replace('.', ':').split(':').map(Number);
                    const end = parts[1].trim().split(" ")[0].replace('.', ':').split(':').map(Number);
                    if(curMins >= (start[0]*60+start[1]) && curMins < (end[0]*60+end[1])) { 
                        statusText = `Sedang: ${item.mapel}`; 
                        statusClass += " status-busy"; 
                        iconClass = "fas fa-book-reader";
                        ongoing = true;
                    }
                }
            });
            if (!ongoing) {
                 statusText = "Istirahat / Pergantian";
                 statusClass += " status-chill";
                 iconClass = "fas fa-coffee";
            }
        }
    } else {
        statusText = `Jadwal ${dayName}`;
        statusClass += " status-chill";
        iconClass = "fas fa-calendar-alt";
    }

    if(statusWidget) {
        document.getElementById('statusText').innerText = statusText;
        document.getElementById('statusIcon').className = iconClass;
        statusWidget.className = statusClass;
    }

    data.forEach((item, idx) => {
        let isActive = false;
        if (isToday && now.getHours() < 17) {
            const parts = item.time.split("-");
            if(parts.length >= 2) {
                const s = parts[0].trim().replace('.', ':').split(':').map(Number);
                const e = parts[1].trim().split(" ")[0].replace('.', ':').split(':').map(Number);
                if(curMins >= (s[0]*60+s[1]) && curMins < (e[0]*60+e[1])) isActive = true;
            }
        }
        
        const noteKey = `${dayName}_${idx}`;
        const hasNote = cachedData.scheduleNotes && cachedData.scheduleNotes[noteKey];
        const noteBtnClass = hasNote ? "btn-note" : "btn-note";
        const noteIcon = hasNote ? "fas fa-check-square" : "fas fa-sticky-note";
        const noteStyle = hasNote ? "background:var(--primary);color:white;" : "";
        
        const noteElem = `<button class="${noteBtnClass}" style="${noteStyle}" onclick="openMapelNote('${dayName}', ${idx})">
                            <i class="${noteIcon}"></i> ${hasNote ? "Ada Catatan" : "Catatan"}
                          </button>`;
        const editElem = `<button class="btn-edit-round" onclick="openScheduleEdit('${dayName}',${idx})"><i class="fas fa-pencil-alt"></i></button>`;
        
        tbody.innerHTML += `
        <tr class="${isActive?'active-row':''}">
            <td><b>${escapeHtml(item.mapel)}</b><br><small style="color:var(--text-sub)">${escapeHtml(item.guru || '')}</small></td>
            <td>${escapeHtml(item.time)}</td>
            <td>${noteElem}</td>
            <td>${editElem}</td>
        </tr>`;
    });
}

function openMapelNote(day, idx) {
    currentNoteTarget = `${day}_${idx}`;
    const savedNote = cachedData.scheduleNotes[currentNoteTarget] || "";
    document.getElementById('noteModalInput').value = savedNote;
    document.getElementById('noteModalTitle').innerText = `📝 Catatan: ${jadwalData[currentWeekType==='auto' ? ((getWeekNumber(new Date())%2!==0)?'umum':'produktif') : currentWeekType][day][idx].mapel}`;
    document.getElementById('noteModal').style.display = 'flex';
}

window.saveNoteFromModal = function() {
    if(!currentNoteTarget) return;
    const val = document.getElementById('noteModalInput').value;
    if(!cachedData.scheduleNotes) cachedData.scheduleNotes = {};
    cachedData.scheduleNotes[currentNoteTarget] = val;
    saveDB('scheduleNotes', cachedData.scheduleNotes);
    closeNoteModal();
    renderSchedule(); 
    showToast("Catatan Mapel Disimpan!", "success");
}

window.deleteNote = function() {
    if(!currentNoteTarget) return;
    if(confirm("Hapus catatan ini?")) {
        delete cachedData.scheduleNotes[currentNoteTarget];
        saveDB('scheduleNotes', cachedData.scheduleNotes);
        document.getElementById('noteModalInput').value = "";
        closeNoteModal();
        renderSchedule();
        showToast("Catatan dihapus.", "info");
    }
}
window.closeNoteModal = function() { document.getElementById('noteModal').style.display = 'none'; currentNoteTarget = null; }

function formatDateIndo(dateString) { if(!dateString) return ""; return new Date(dateString).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' }); }
function getDaysRemaining(dateString) { if (!dateString) return null; const target = new Date(dateString); target.setHours(0,0,0,0); const today = new Date(); today.setHours(0,0,0,0); return Math.ceil((target - today) / (1000 * 60 * 60 * 24)); }
function filterTasks(type, btn) { taskFilter = type; document.querySelectorAll('.tab').forEach(b => b.classList.remove('active')); btn.classList.add('active'); loadTasks(); }

function handleTaskButton() {
    const text = escapeHtml(document.getElementById('taskInput').value);
    const date = document.getElementById('taskDate').value; 
    const priority = document.getElementById('taskPriority').value;
    if(!text || !date) return showToast("Lengkapi data tugas!", 'error');

    let tasks = getDB('tasks'); 
    if(editingTaskId) {
        const idx = tasks.findIndex(t => t.id === editingTaskId);
        if(idx !== -1) { tasks[idx].text = text; tasks[idx].date = date; tasks[idx].priority = priority; showToast("Tugas diupdate!", "success"); }
        editingTaskId = null; document.getElementById('addTaskBtn').innerHTML = `Tambah Tugas`;
    } else {
        tasks.push({ id: Date.now(), text, date: date, priority, completed: false });
        addXP(5); 
        playSuccessSound('ding'); showToast("Tugas ditambah! (+5 XP)", "success");
    }
    saveDB('tasks', tasks);
    document.getElementById('taskInput').value = ''; document.getElementById('taskDate').value = ''; 
}

function loadTaskToEdit(id) {
    const task = cachedData.tasks.find(t => t.id === id);
    if(task) {
        document.getElementById('taskInput').value = task.text;
        document.getElementById('taskDate').value = task.date; 
        document.getElementById('taskPriority').value = task.priority;
        editingTaskId = id;
        document.getElementById('addTaskBtn').innerHTML = `Simpan`;
        document.getElementById('taskInput').focus();
    }
}

function loadTasks() {
    const list = document.getElementById('taskList');
    const tasks = cachedData.tasks || [];
    list.innerHTML = '';
    
    const total = tasks.length; 
    const done = tasks.filter(t => t.completed).length;
    const pct = total ? Math.round((done/total)*100) : 0;
    document.getElementById('taskProgressText').innerText = `${pct}%`;
    document.getElementById('taskProgressPath').style.strokeDasharray = `${pct}, 100`;

    const search = document.getElementById('searchTaskInput').value.toLowerCase();
    let filtered = tasks.filter(t => {
        if(taskFilter === 'pending') return !t.completed;
        if(taskFilter === 'completed') return t.completed;
        return t.text.toLowerCase().includes(search);
    });

    if (filtered.length === 0) {
        list.innerHTML = `<div class="empty-message"><i class="fas fa-clipboard-check"></i><p>Tidak ada tugas.</p></div>`;
        renderUrgentDeadlines(tasks);
        return;
    }

    filtered.sort((a, b) => {
        if (a.completed !== b.completed) return a.completed - b.completed;
        return new Date(a.date) - new Date(b.date);
    });

    filtered.forEach((t, index) => {
        const daysLeft = getDaysRemaining(t.date);
        let dateDisplay = `<i class="far fa-calendar"></i> ${formatDateIndo(t.date)}`;
        let badgeClass = 'deadline-far';
        
        if (daysLeft !== null && !t.completed) {
            if (daysLeft < 0) { dateDisplay = `⚠️ Telat ${Math.abs(daysLeft)} hari`; badgeClass = 'deadline-urgent'; }
            else if (daysLeft === 0) { dateDisplay = `🔥 HARI INI`; badgeClass = 'deadline-urgent'; }
            else if (daysLeft === 1) { dateDisplay = `⏰ Besok`; badgeClass = 'deadline-near'; }
            else { 
                dateDisplay = `📅 ${daysLeft} Hari Lagi`; 
                badgeClass = daysLeft <= 3 ? 'deadline-near' : 'deadline-far'; 
            }
        }
        const randomWord = funWords[Math.floor(Math.random() * funWords.length)];

        const li = document.createElement('li');
        li.className = `task-item priority-${t.priority} ${t.completed ? 'completed' : ''}`;
        li.draggable = true;
        li.dataset.id = t.id;
        li.innerHTML = `
                <div class="task-content" style="display:flex;align-items:center;width:100%;">
                    <div class="check-btn" onclick="toggleTask(${t.id})"><i class="fas fa-check"></i></div>
                    <div class="task-text">
                        <span>${escapeHtml(t.text)}</span>
                        <small class="${badgeClass}">${dateDisplay} • ${t.priority}</small>
                    </div>
                     <span class="fun-badge">${randomWord}</span>
                </div>
                <div class="task-actions">
                    <button class="action-btn" onclick="loadTaskToEdit(${t.id})"><i class="fas fa-pencil-alt"></i></button>
                    <button class="action-btn delete" onclick="deleteTask(${t.id})"><i class="fas fa-trash"></i></button>
                    <i class="fas fa-grip-lines" style="cursor:move; color:#ccc; margin-left:10px;"></i>
                </div>`;
        
        li.addEventListener('dragstart', handleDragStart);
        li.addEventListener('dragover', handleDragOver);
        li.addEventListener('drop', handleDrop);
        li.addEventListener('dragenter', handleDragEnter);
        li.addEventListener('dragleave', handleDragLeave);

        list.appendChild(li);
    });
    renderUrgentDeadlines(tasks);
}

function handleDragStart(e) {
    dragSrcEl = this;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', this.innerHTML);
    this.style.opacity = '0.4';
}
function handleDragOver(e) {
    if (e.preventDefault) { e.preventDefault(); }
    e.dataTransfer.dropEffect = 'move';
    return false;
}
function handleDragEnter(e) { this.classList.add('over'); }
function handleDragLeave(e) { this.classList.remove('over'); }
function handleDrop(e) {
    if (e.stopPropagation) { e.stopPropagation(); }
    if (dragSrcEl !== this) {
        const idSrc = parseInt(dragSrcEl.dataset.id);
        const idDest = parseInt(this.dataset.id);
        
        const tasks = cachedData.tasks;
        const idxSrc = tasks.findIndex(t => t.id === idSrc);
        const idxDest = tasks.findIndex(t => t.id === idDest);
        
        if (idxSrc > -1 && idxDest > -1) {
            const [movedItem] = tasks.splice(idxSrc, 1);
            tasks.splice(idxDest, 0, movedItem);
            saveDB('tasks', tasks);
            loadTasks(); 
        }
    }
    return false;
}

function renderUrgentDeadlines(tasks) {
    const urgentList = document.getElementById('urgentList');
    if(!urgentList) return; 
    urgentList.innerHTML = '';
    const urgentTasks = tasks.filter(t => {
        const days = getDaysRemaining(t.date);
        return !t.completed && days !== null && days >= 0 && days <= 3;
    });
    if (urgentTasks.length === 0) urgentList.innerHTML = '<div style="text-align:center;color:var(--text-sub);padding:10px;">Aman! Tidak ada deadline dekat. 🎉</div>';
    else {
        urgentTasks.forEach(t => {
            const days = getDaysRemaining(t.date);
            let textDay = days === 0 ? "Hari Ini!" : days === 1 ? "Besok" : `${days} Hari`;
            urgentList.innerHTML += `<li class="urgent-item"><span>${escapeHtml(t.text)}</span><span class="urgent-days">${textDay}</span></li>`;
        });
    }
}

function toggleTask(id) { 
    const tasks = cachedData.tasks; 
    const t = tasks.find(x => x.id === id); 
    if(t) { 
        t.completed = !t.completed; 
        if(t.completed) {
            playSuccessSound('ding');
            addXP(10); 
            showToast("Tugas Selesai! (+10 XP)", "success");
        }
        saveDB('tasks', tasks); 
    }
}
function deleteTask(id) { 
    if(confirm("Hapus?")) { 
        const tasks = cachedData.tasks.filter(x => x.id !== id); 
        saveDB('tasks', tasks); 
    } 
}
function clearCompletedTasks() {
    const tasks = cachedData.tasks.filter(t => !t.completed);
    if(confirm("Hapus semua yang selesai?")) saveDB('tasks', tasks);
}

function addTransaction(type) {
    const desc = escapeHtml(document.getElementById('moneyDesc').value);
    const amount = parseInt(document.getElementById('moneyAmount').value);
    const wallet = document.getElementById('selectedWallet').value; 
    const category = document.getElementById('txnCategory').value;
    if(!desc || !amount || amount <= 0) return showToast("Data tidak valid!", 'error');
    
    const newTxn = { id: Date.now(), desc, amount, type, wallet, category, date: new Date().toISOString().split('T')[0] };
    let txns = cachedData.transactions;
    txns.push(newTxn);
    
    if(type === 'in') { addXP(5); playSuccessSound('coin'); } 
    
    saveDB('transactions', txns);
    document.getElementById('moneyDesc').value = ''; document.getElementById('moneyAmount').value = '';
    showToast(`${type==='in'?"Masuk":"Keluar"} tercatat!`, type==='in'?'success':'error');
}

function loadTransactions() {
    const list = document.getElementById('transactionList');
    const txns = cachedData.transactions || [];
    const filter = document.getElementById('historyFilter').value;
    let bal = { total:0, dana:0, ovo:0, gopay:0, cash:0 };
    list.innerHTML = '';
    txns.forEach(t => {
        if(t.type === 'in') { bal.total+=t.amount; bal[t.wallet]+=t.amount; } 
        else { bal.total-=t.amount; bal[t.wallet]-=t.amount; }
    });

    txns.slice().reverse().forEach(t => {
        let show = (filter === 'all') || (filter === 'in' && t.type === 'in') || (filter === 'out' && t.type === 'out');
        if(show) {
            const color = t.type === 'in' ? 'var(--green)' : 'var(--red)';
            const sign = t.type === 'in' ? '+' : '-';
            list.innerHTML += `<li class="txn-item"><div class="txn-left"><b>${escapeHtml(t.desc)}</b><small>${t.wallet.toUpperCase()} • ${t.category}</small></div><div class="txn-right"><b style="color:${color}">${sign} Rp ${t.amount.toLocaleString('id-ID')}</b><button class="delete-txn-btn" onclick="delTxn(${t.id})"><i class="fas fa-trash"></i></button></div></li>`;
        }
    });
    document.getElementById('totalBalance').innerText = "Rp " + bal.total.toLocaleString('id-ID');
    ['dana','ovo','gopay','cash'].forEach(k => document.getElementById(`saldo-${k}`).innerText = "Rp " + bal[k].toLocaleString('id-ID'));
    renderExpenseChart(txns);
}
function delTxn(id) { 
    if(confirm("Hapus?")) { 
        const t = cachedData.transactions.filter(x => x.id !== id); 
        saveDB('transactions', t); 
    } 
}
window.exportFinanceReport = function() {
    const txns = cachedData.transactions || [];
    if (txns.length === 0) return showToast("Kosong!", "error");
    let csv = "Tanggal,Ket,Kat,Tipe,Jml,Dompet\n" + txns.map(t => `${t.date},"${t.desc}",${t.category},${t.type},${t.amount},${t.wallet}`).join("\n");
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    link.download = `Laporan.csv`;
    link.click();
}

function editTarget() { 
    const uid = window.auth.currentUser.uid;
    const val = prompt("Target Tabungan (Rp):", localStorage.getItem(`${uid}_target`) || 0); 
    if(val && !isNaN(val)) { 
        localStorage.setItem(`${uid}_target`, val); 
        saveSetting('target', val); 
        loadTarget(); 
    } 
}
function loadTarget() {
    const uid = window.auth.currentUser ? window.auth.currentUser.uid : null;
    if(!uid) return;
    const target = parseInt(localStorage.getItem(`${uid}_target`) || 0);
    const saving = cachedData.transactions.reduce((acc, t) => t.category === 'Tabungan' ? (t.type === 'in' ? acc + t.amount : acc - t.amount) : acc, 0);
    document.getElementById('targetAmount').innerText = "Rp " + target.toLocaleString('id-ID');
    const pct = target > 0 ? Math.min((Math.max(saving, 0) / target) * 100, 100) : 0;
    document.getElementById('targetProgressBar').style.width = `${pct}%`;
    document.getElementById('targetPercentage').innerText = `${pct.toFixed(1)}% (Rp ${Math.max(saving, 0).toLocaleString('id-ID')})`;
}

function renderExpenseChart(txns) {
    const container = document.getElementById('expenseChartContainer');
    let total = 0; let cats = {};
    txns.forEach(t => { if(t.type === 'out') { total+=t.amount; cats[t.category] = (cats[t.category]||0)+t.amount; }});
    if(total === 0) { container.innerHTML = `<div class="empty-message small"><p>Belum ada pengeluaran.</p></div>`; return; }
    let html = '';
    const colors = { 'Jajan':'#f97316', 'Transport':'#3b82f6', 'Tabungan':'#10b981', 'Belanja':'#8b5cf6', 'Lainnya':'#6b7280' };
    Object.keys(cats).forEach(c => {
        const pct = Math.round((cats[c]/total)*100);
        html += `<div class="expense-item"><div class="expense-label"><span class="dot" style="background:${colors[c]||'#ccc'}"></span>${c}</div><div class="expense-value">Rp ${cats[c].toLocaleString('id-ID')} <small>(${pct}%)</small></div><div class="expense-bar-bg"><div class="expense-bar-fill" style="width:${pct}%;background:${colors[c]||'#ccc'}"></div></div></div>`;
    });
    container.innerHTML = html;
}

function loadSoundSettings() { 
    const uid = window.auth.currentUser ? window.auth.currentUser.uid : null;
    if(uid) soundPreference = localStorage.getItem(`${uid}_soundPreference`) || 'bell'; 
    if(document.getElementById('pomodoroSoundSelect')) document.getElementById('pomodoroSoundSelect').value = soundPreference; 
}
function saveSoundSettings() { 
    const uid = window.auth.currentUser.uid;
    soundPreference = document.getElementById('pomodoroSoundSelect').value; 
    localStorage.setItem(`${uid}_soundPreference`, soundPreference); 
    document.getElementById('soundModal').style.display='none'; 
    showToast("Disimpan!", "success"); 
}
function showSoundSettings() { document.getElementById('soundModal').style.display='flex'; }
function checkExamMode() {
    const financeCard = document.getElementById('financeCard');
    if(financeCard) financeCard.style.display = isExamMode ? 'none' : 'block';
    timeLeft = isExamMode ? WORK_DURATION_EXAM : WORK_DURATION_DEFAULT; 
    updateTimerDisplay();
}
function toggleExamMode() { 
    isExamMode = !isExamMode; 
    saveSetting('isExamMode', isExamMode);
    checkExamMode(); 
    showToast(isExamMode ? "Mode Ujian AKTIF" : "Mode Ujian NONAKTIF", 'info'); 
}
function checkReminders() { 
    if(!jadwalData) return;
    const now=new Date(); const m=now.getHours()*60+now.getMinutes(); const d=days[now.getDay()]; 
    let displayType = currentWeekType === 'auto' ? ((getWeekNumber(new Date()) % 2 !== 0) ? 'umum' : 'produktif') : currentWeekType;
    const data=jadwalData[displayType][d]; 
    if(data) data.forEach(i => { const p=i.time.split("-"); if(p.length>=2) { const s=p[0].trim().replace(/\./g,':').split(':').map(Number); if(m===(s[0]*60+s[1])-5) showToast(`🔔 5 Menit lagi: ${i.mapel}`, 'info'); } }); 
}
function escapeHtml(text) { if (!text) return text; return String(text).replace(/[&<>"']/g, function(m) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[m]; }); }

function loadRandomQuote() {
    if(document.getElementById('motivationQuote')) {
        document.getElementById('motivationQuote').innerText = `"${motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]}"`;
    }
}
function openClearDataModal() { if(confirm("Yakin hapus data lokal dan logout?")) { localStorage.clear(); location.reload(); } }
function exportData() { 
    const b=new Blob([JSON.stringify(cachedData)],{type:"application/json"}); 
    const a=document.createElement('a'); a.href=URL.createObjectURL(b); a.download=`${currentUser}_backup.json`; a.click(); 
}
window.toggleSettings = function() { document.getElementById('settingsDropdown').classList.toggle('active'); }
window.selectWallet = function(id, el) { document.getElementById('selectedWallet').value = id; document.querySelectorAll('.wallet-card').forEach(c => c.classList.remove('active')); el.classList.add('active'); }
window.importData = function(input) {
    const f = input.files[0]; if (!f) return;
    const r = new FileReader();
    r.onload = function(e) {
        try {
            cachedData = JSON.parse(e.target.result);
            saveAllToCloud(); 
            showToast("Restored!", "success");
            setTimeout(() => location.reload(), 1000);
        } catch (err) { showToast("File rusak!", "error"); }
    };
    r.readAsText(f);
}

let currentScheduleEdit = null;
function openScheduleEdit(day, idx) {
    currentScheduleEdit = { day, idx };
    let displayType = currentWeekType === 'auto' ? ((getWeekNumber(new Date()) % 2 !== 0) ? 'umum' : 'produktif') : currentWeekType;
    const item = jadwalData[displayType][day][idx];
    document.getElementById('editMapelName').value = item.mapel;
    document.getElementById('editMapelTime').value = item.time;
    document.getElementById('editMapelType').value = item.type;
    document.getElementById('scheduleEditModal').style.display = 'flex';
}
function saveScheduleChanges() {
    const n = document.getElementById('editMapelName').value;
    const t = document.getElementById('editMapelTime').value;
    const type = document.getElementById('editMapelType').value;
    if (!n || !t) return showToast("Isi semua!", "error");
    const { day, idx } = currentScheduleEdit;
    let displayType = currentWeekType === 'auto' ? ((getWeekNumber(new Date()) % 2 !== 0) ? 'umum' : 'produktif') : currentWeekType;
    jadwalData[displayType][day][idx] = { ...jadwalData[displayType][day][idx], mapel: n, time: t, type };
    saveDB('jadwalData', jadwalData);
    document.getElementById('scheduleEditModal').style.display = 'none';
    showToast("Diupdate!", "success");
}
function closeScheduleEditModal() { document.getElementById('scheduleEditModal').style.display = 'none'; }
window.openAddScheduleModal = function() { document.getElementById('addScheduleDay').value = days[currentDayIdx]; document.getElementById('addScheduleModal').style.display = 'flex'; }
window.saveNewSchedule = function() {
    const w = document.getElementById('addScheduleWeekType').value;
    const d = document.getElementById('addScheduleDay').value;
    const m = document.getElementById('addScheduleMapel').value;
    const g = document.getElementById('addScheduleGuru').value;
    const t = document.getElementById('addScheduleTime').value;
    const ty = document.getElementById('addScheduleType').value;
    if(!m || !t) return showToast("Wajib isi!", "error");
    if (!jadwalData[w]) jadwalData[w] = {};
    if (!jadwalData[w][d]) jadwalData[w][d] = [];
    jadwalData[w][d].push({ mapel: m, guru: g, time: t, type: ty });
    jadwalData[w][d].sort((a, b) => a.time.localeCompare(b.time));
    saveDB('jadwalData', jadwalData);
    renderSchedule();
    document.getElementById('addScheduleModal').style.display = 'none';
    showToast("Jadwal Baru!", "success");
}
window.deleteSchedule = function() {
    if (!currentScheduleEdit) return;
    if(confirm("Hapus mapel ini?")) {
        const { day, idx } = currentScheduleEdit;
        let displayType = currentWeekType === 'auto' ? ((getWeekNumber(new Date()) % 2 !== 0) ? 'umum' : 'produktif') : currentWeekType;
        jadwalData[displayType][day].splice(idx, 1);
        saveDB('jadwalData', jadwalData);
        renderSchedule();
        closeScheduleEditModal();
    }
}