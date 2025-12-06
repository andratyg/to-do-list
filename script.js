// ==================== SYSTEM & CONFIG ====================
let currentUser = null; // UID User

// Wadah Data Lokal
let cachedData = { 
    tasks: [], 
    transactions: [], 
    jadwal: null,
    settings: {}
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
let soundPreference = 'bell'; 
let currentScheduleFilterGuru = 'all'; 
let currentScheduleFilterCategory = 'all'; 

// --- VARIABEL PENTING ---
let taskFilter = 'all';
let editingTaskId = null;

// --- DATA JADWAL DEFAULT ---
const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
const defaultJadwalData = {
    umum: {
        "Senin": [
            { mapel: "Koding & AI", guru: "Juliana Mansur, S.Kom", time: "08.20 - 09.40", type: "produktif" },
            { mapel: "PAI & Budi Pekerti", guru: "Hapid, S.Ag", time: "10.00 - 11.20", type: "umum" },
            { mapel: "Matematika", guru: "Wijiastuti, S.Pd", time: "11.20 - 13.20", type: "umum" },
            { mapel: "Pend. Pancasila", guru: "Amanda Putri S, S.Pd", time: "13.20 - 14.40", type: "umum" },
            { mapel: "Bahasa Inggris", guru: "Endang Setiawan, S.Pd", time: "14.40 - 16.00", type: "umum" }
        ],
        "Selasa": [ { mapel: "KOKURIKULER", guru: "Nurulia Aprilia, S.Si", time: "08.00 - 15.50", type: "kokurikuler" } ],
        "Rabu": [
            { mapel: "Bahasa Indonesia", guru: "Lia Siti Sholehah, S.Pd", time: "08.00 - 09.20", type: "umum" },
            { mapel: "Bahasa Inggris", guru: "Endang Setiawan, S.Pd", time: "09.40 - 11.00", type: "umum" },
            { mapel: "PAI", guru: "Hapid, S.Ag", time: "11.00 - 13.00", type: "umum" },
            { mapel: "Matematika", guru: "Wijiastuti, S.Pd", time: "13.00 - 14.30", type: "umum" },
            { mapel: "Pend. Pancasila", guru: "Amanda Putri S, S.Pd", time: "14.30 - 15.50", type: "umum" }
        ],
        "Kamis": [
            { mapel: "Sejarah", guru: "Yessy Novita D, S.Pd", time: "08.00 - 09.20", type: "umum" },
            { mapel: "Bahasa Indonesia", guru: "Lia Siti Sholehah, S.Pd", time: "09.40 - 11.00", type: "umum" },
            { mapel: "Bahasa Sunda", guru: "Isti Hamidah", time: "11.00 - 13.00", type: "umum" },
            { mapel: "Matematika", guru: "Wijiastuti, S.Pd", time: "13.00 - 14.30", type: "umum" },
            { mapel: "Sejarah", guru: "Yessy Novita D, S.Pd", time: "14.30 - 15.50", "type": "umum" }
        ],
        "Jumat": [
            { mapel: "Koding & AI", guru: "Juliana Mansur, S.Kom", time: "07.45 - 09.05", type: "produktif" },
            { mapel: "Bahasa Inggris", guru: "Endang Setiawan, S.Pd", time: "09.05 - 10.25", type: "umum" },
            { mapel: "Bahasa Indonesia", guru: "Lia Siti Sholehah, S.Pd", time: "10.25 - 13.40", type: "umum" },
            { mapel: "Bahasa Sunda", guru: "Isti Hamidah", time: "13.40 - 15.00", type: "umum" }
        ]
    },
    produktif: {
        "Senin": [
            { mapel: "DDPK (Juliana)", time: "08.20 - 09.40", type: "produktif" },
            { mapel: "PJOK", guru: "Noer Sandy M, S.Pd", time: "10.00 - 12.00", type: "umum" },
            { mapel: "DDPK (Duma)", time: "12.40 - 14.40", type: "produktif" },
            { mapel: "DDPK (Muslih)", time: "14.40 - 16.00", type: "produktif" }
        ],
        "Selasa": [
            { mapel: "Projek IPAS", guru: "Nurulia Aprilia, S.Si", time: "08.00 - 11.40", type: "umum" },
            { mapel: "DDPK (Duma)", time: "12.20 - 14.30", type: "produktif" },
            { mapel: "Informatika", guru: "Nurdin", time: "14.30 - 15.50", type: "produktif" }
        ],
        "Rabu": [
            { mapel: "Informatika", guru: "Nurdin", time: "08.00 - 09.20", type: "produktif" },
            { mapel: "PJOK", guru: "Noer Sandy M, S.Pd", time: "09.40 - 11.40", type: "umum" },
            { mapel: "Projek IPAS", guru: "Nurulia Aprilia, S.Si", time: "12.20 - 15.50", type: "umum" }
        ],
        "Kamis": [ { mapel: "DDPK (Full Day)", guru: "Iqbal Fajar Syahbana", time: "08.00 - 15.50", type: "produktif" } ],
        "Jumat": [
            { mapel: "DDPK (Duma)", time: "07.45 - 10.25", type: "produktif" },
            { mapel: "Informatika", guru: "Nurdin", time: "10.25 - 13.40", type: "produktif" },
            { mapel: "DDPK (Duma)", time: "13.40 - 15.00", type: "produktif" }
        ]
    }
};

let jadwalData = defaultJadwalData;
let currentDayIdx = new Date().getDay(); 
let currentWeekType = 'umum'; 

const motivationalQuotes = [
    "Fokus 25 menit, hasilnya 100%. Kamu bisa! 💪",
    "Disiplin adalah jembatan antara tujuan dan pencapaian.",
    "Bekerja cerdas, bukan hanya bekerja keras.",
    "Jangan tunggu motivasi. Ciptakan momentummu sendiri.",
    "Masa depanmu diciptakan oleh apa yang kamu lakukan hari ini."
];

// ==================== B. AUTHENTICATION LOGIC ====================

document.addEventListener("DOMContentLoaded", () => {
    initAuthListener(); 
});

function initAuthListener() {
    setTimeout(() => {
        if (!window.authListener) return;

        window.authListener(window.auth, (user) => {
            if (user) {
                // USER LOGIN
                const displayName = user.displayName ? user.displayName : user.email.split('@')[0];
                currentUser = displayName;
                const uid = user.uid; 
                
                document.getElementById('loginOverlay').style.display = 'none';
                document.getElementById('mainContent').style.display = 'block';
                
                document.getElementById('displayUsername').innerText = displayName; 
                updateGreeting(); 
                document.getElementById('loginStatusText').innerText = "Online";
                
                startFirebaseListener(uid); 
                initApp();
            } else {
                // USER LOGOUT
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
    const errorMsg = document.getElementById('authErrorMsg');
    if(errorMsg) errorMsg.innerText = ""; 

    if (mode === 'register') {
        loginView.style.display = 'none';
        registerView.style.display = 'block';
    } else {
        loginView.style.display = 'block';
        registerView.style.display = 'none';
    }
}

window.handleLogin = function() {
    const email = document.getElementById('loginEmail').value;
    const pass = document.getElementById('loginPass').value;
    const errorMsg = document.getElementById('authErrorMsg');

    if(!email || !pass) { errorMsg.innerText = "Isi email dan password!"; return; }

    errorMsg.innerText = "Sedang masuk...";
    window.authSignIn(window.auth, email, pass)
        .then(() => { errorMsg.innerText = ""; showToast("Berhasil Masuk!", "success"); })
        .catch((error) => { errorMsg.innerText = "Gagal: Email/Password salah."; });
}

window.handleGoogleLogin = function() {
    const errorMsg = document.getElementById('authErrorMsg');
    errorMsg.innerText = "Menghubungkan ke Google...";
    errorMsg.style.color = "var(--text-sub)";
    
    window.authSignInGoogle(window.auth, window.googleProvider)
        .then((result) => {
            const user = result.user;
            errorMsg.style.color = "var(--green)";
            errorMsg.innerText = "Berhasil! Mengalihkan...";
            showToast(`Masuk sebagai ${user.displayName}`, "success");
        }).catch((error) => {
            console.error(error);
            errorMsg.style.color = "var(--red)";
            if (error.code === 'auth/popup-closed-by-user') {
                errorMsg.innerText = "Login dibatalkan.";
            } else if (error.code === 'auth/network-request-failed') {
                errorMsg.innerText = "Gagal: Periksa internet Anda.";
            } else {
                errorMsg.innerText = "Gagal masuk Google.";
            }
        });
}

window.handleRegister = function() {
    const username = document.getElementById('regUsername').value;
    const email = document.getElementById('regEmail').value;
    const pass = document.getElementById('regPass').value;
    
    if(!username || !email || !pass) { alert("Lengkapi data pendaftaran!"); return; }
    if(pass.length < 6) { alert("Password minimal 6 karakter!"); return; }

    window.authSignUp(window.auth, email, pass)
        .then((userCredential) => {
            const user = userCredential.user;
            window.authUpdateProfile(user, { displayName: username })
                .then(() => {
                    showToast(`Halo ${username}!`, "success");
                    setTimeout(() => location.reload(), 1500);
                });
        })
        .catch((error) => {
            if(error.code === 'auth/email-already-in-use') alert("Email sudah terdaftar!");
            else alert("Gagal: " + error.message);
        });
}

window.logoutUser = function() {
    if(confirm("Yakin ingin keluar?")) {
        window.authSignOut(window.auth).then(() => {
            location.reload();
        });
    }
}

window.editUsername = function() {
    const user = window.auth.currentUser;
    if(user) {
        document.getElementById('newUsernameInput').value = user.displayName || "";
        document.getElementById('usernameModal').style.display = 'flex';
        const dropdown = document.getElementById('settingsDropdown');
        if(dropdown) dropdown.classList.remove('active');
    }
}

window.saveUsername = function() {
    const newName = document.getElementById('newUsernameInput').value.trim();
    if(!newName) return showToast("Nama tidak boleh kosong!", "error");

    const user = window.auth.currentUser;
    window.authUpdateProfile(user, { displayName: newName }).then(() => {
        document.getElementById('displayUsername').innerText = newName;
        updateGreeting();
        document.getElementById('usernameModal').style.display = 'none';
        showToast("Nama berhasil diganti!", "success");
    }).catch(err => {
        showToast("Gagal ganti nama: " + err.message, "error");
    });
}

// ==================== C. FIREBASE DATA LOGIC ====================

function startFirebaseListener(uid) {
    if (!window.db || !window.dbOnValue) {
        console.error("Firebase belum siap.");
        return;
    }
    const userPath = 'users/' + uid;
    
    window.dbOnValue(window.dbRef(window.db, userPath), (snapshot) => {
        const data = snapshot.val();
        if (data) {
            cachedData.tasks = data.tasks || [];
            cachedData.transactions = data.transactions || [];
            if (data.jadwal && data.jadwal.umum) {
                cachedData.jadwal = data.jadwal;
            } else {
                cachedData.jadwal = defaultJadwalData;
                saveDB('jadwalData', defaultJadwalData); 
            }
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
        renderAll();
    });
}

function saveDB(key, data) {
    const uid = window.auth.currentUser.uid;
    if(key === 'tasks') cachedData.tasks = data;
    if(key === 'transactions') cachedData.transactions = data;
    if(key === 'jadwalData') { cachedData.jadwal = data; jadwalData = data; }

    let dbKey = key;
    if(key === 'jadwalData') dbKey = 'jadwal';

    window.dbSet(window.dbRef(window.db, `users/${uid}/${dbKey}`), data)
    .catch(err => showToast("Gagal simpan ke Cloud: " + err.message, "error"));
}

function saveSetting(key, val) {
    const uid = window.auth.currentUser.uid;
    window.dbSet(window.dbRef(window.db, `users/${uid}/settings/${key}`), val);
}

function saveAllToCloud(uid) {
    const targetUid = uid || (window.auth.currentUser ? window.auth.currentUser.uid : null);
    if(targetUid) {
        window.dbSet(window.dbRef(window.db, `users/${targetUid}`), cachedData);
    }
}

function getDB(key) {
    if (key === 'tasks') return cachedData.tasks || [];
    if (key === 'transactions') return cachedData.transactions || [];
    return [];
}

// ==================== D. APP FEATURES LOGIC ====================

function initApp() {
    startClock(); 
    updateGreeting(); 
    updateHeaderDate(); 
    loadScheduleFilters(); 
    loadSoundSettings(); 
    loadRandomQuote(); 
    updateTimerDisplay(); 
    
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey || e.metaKey) { 
            if (e.key === 't' || e.key === 'T') { e.preventDefault(); document.getElementById('taskInput').focus(); }
            else if (e.key === 's' || e.key === 'S') { e.preventDefault(); document.getElementById('startPauseBtn').click(); }
            else if (e.key === 'd' || e.key === 'D') { e.preventDefault(); toggleDarkMode(); }
        }
    });
    setInterval(checkReminders, 60000);
}

function renderAll() {
    document.getElementById('weekTypeSelector').value = currentWeekType;
    checkExamMode();
    renderSchedule();
    loadTasks();
    loadTransactions();
    loadTarget();
    loadPomodoroTasks();
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
    localStorage.setItem(`${uid}_theme`, theme);
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
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    if (type === 'ding') {
        oscillator.type = 'sine'; oscillator.frequency.setValueAtTime(1200, audioCtx.currentTime); 
        oscillator.frequency.exponentialRampToValueAtTime(600, audioCtx.currentTime + 0.5); 
        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime); gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.5); 
        oscillator.start(); oscillator.stop(audioCtx.currentTime + 0.5);
    } else if (type === 'coin') {
        oscillator.type = 'triangle'; oscillator.frequency.setValueAtTime(900, audioCtx.currentTime);
        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime); gainNode.gain.linearRampToValueAtTime(0.0001, audioCtx.currentTime + 0.3);
        oscillator.start(); oscillator.stop(audioCtx.currentTime + 0.3);
    } else if (type === 'bell') {
        oscillator.type = 'sawtooth'; oscillator.frequency.setValueAtTime(440, audioCtx.currentTime);
        gainNode.gain.setValueAtTime(0.15, audioCtx.currentTime); gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 1.5);
        oscillator.start(); oscillator.stop(audioCtx.currentTime + 1.5);
    }
}

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}

function updateTimerDisplay() {
    document.getElementById('timerDisplay').innerText = formatTime(timeLeft);
    const card = document.querySelector('.pomodoro-card');
    if (isWorking) {
        document.getElementById('timerMode').innerText = "FOKUS";
        document.getElementById('timerMessage').innerText = "Waktunya Bekerja Keras";
        card.classList.remove('mode-break');
    } else {
        document.getElementById('timerMode').innerText = "ISTIRAHAT";
        document.getElementById('timerMessage').innerText = "Istirahat Sejenak";
        card.classList.add('mode-break');
    }
    if (timeLeft === 0) toggleMode();
}

function startTimer() {
    if (!isPaused) return;
    isPaused = false;
    document.getElementById('startPauseBtn').innerText = "Jeda";
    document.getElementById('startPauseBtn').setAttribute('onclick', 'pauseTimer()');
    timerInterval = setInterval(() => { timeLeft--; updateTimerDisplay(); }, 1000);
}

function pauseTimer() {
    if (isPaused) return;
    isPaused = true;
    clearInterval(timerInterval);
    document.getElementById('startPauseBtn').innerText = "Lanjutkan";
    document.getElementById('startPauseBtn').setAttribute('onclick', 'startTimer()');
}

function resetTimer() {
    pauseTimer();
    isWorking = true;
    timeLeft = isExamMode ? WORK_DURATION_EXAM : WORK_DURATION_DEFAULT; 
    document.getElementById('startPauseBtn').innerText = "Mulai";
    document.getElementById('startPauseBtn').setAttribute('onclick', 'startTimer()');
    updateTimerDisplay();
}

function toggleMode() {
    pauseTimer();
    isWorking = !isWorking;
    timeLeft = isWorking ? (isExamMode ? WORK_DURATION_EXAM : WORK_DURATION_DEFAULT) : (isExamMode ? BREAK_DURATION_EXAM : BREAK_DURATION_DEFAULT);
    playSuccessSound('bell');
    showToast(isWorking ? "Waktunya FOKUS! 🔔" : "Waktunya ISTIRAHAT! ☕", "info");
    updateTimerDisplay();
    startTimer();
}

function loadPomodoroTasks() {
    const selector = document.getElementById('pomodoroTaskSelector');
    if(!selector) return;
    selector.innerHTML = '<option value="">-- Pilih Tugas untuk Fokus --</option>';
    cachedData.tasks.filter(t => !t.completed).forEach(t => {
        const option = document.createElement('option');
        option.value = t.id; option.innerText = t.text; selector.appendChild(option);
    });
}

// --- JADWAL (UPDATED: Status 5 Sore & Tombol Baru) ---
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
    if (currentWeekType === 'auto') {
        currentWeekDisplay = (getWeekNumber(new Date()) % 2 !== 0) ? 'umum' : 'produktif';
    }
    
    if(!jadwalData) return;
    let data = jadwalData[currentWeekDisplay][dayName];
    const tbody = document.getElementById('scheduleBody');
    
    // LOGIKA WAKTU
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const curMins = currentHour * 60 + currentMinute;
    const isToday = currentDayIdx === now.getDay();
    
    tbody.innerHTML = '';
    
    // Filter
    const filterCategory = document.getElementById('scheduleFilterCategory').value;
    const filterGuru = document.getElementById('scheduleFilterGuru').value;

    if (data) {
        data = data.filter(item => {
            return (filterCategory === 'all' || item.type === filterCategory) && 
                   (filterGuru === 'all' || item.guru === filterGuru);
        });
    }

    // Cek Libur / Kosong
    if(!data || data.length === 0) { 
        tbody.parentElement.style.display='none'; 
        document.getElementById('holidayMessage').style.display='block'; 
        document.getElementById('currentStatus').innerText = "Tidak ada jadwal"; 
        // Reset warna dot
        document.querySelector('.status-dot').style.background = 'var(--text-sub)';
        return; 
    }
    
    tbody.parentElement.style.display='table'; 
    document.getElementById('holidayMessage').style.display='none';
    
    // --- LOGIKA STATUS (JAM 5 SORE) ---
    let statusText = "Belum Mulai";
    let dotColor = "var(--text-sub)";

    if (isToday) {
        if (currentHour >= 17) {
            // JIKA SUDAH LEWAT JAM 17:00 (5 SORE)
            statusText = "Pembelajaran Hari Ini Telah Selesai. Sampai Jumpa Besok! 🌙";
            dotColor = "var(--purple)"; 
        } else {
            let ongoing = false;
            data.forEach(item => {
                const parts = item.time.split("-");
                if(parts.length >= 2) {
                    const start = parts[0].trim().replace(/\./g, ':').split(':').map(Number);
                    const end = parts[1].trim().split(" ")[0].replace(/\./g, ':').split(':').map(Number);
                    const sM = start[0]*60+start[1]; 
                    const eM = end[0]*60+end[1];
                    
                    if(curMins >= sM && curMins < eM) { 
                        statusText = `Sedang Berlangsung: ${item.mapel}`; 
                        dotColor = "var(--green)";
                        ongoing = true;
                    }
                }
            });
            if (!ongoing && currentHour < 17) {
                if (curMins < (7*60 + 45)) { 
                     statusText = "Menunggu jam masuk...";
                     dotColor = "var(--orange)";
                } else {
                     statusText = "Istirahat / Pergantian Jam";
                     dotColor = "var(--blue)";
                }
            }
        }
    } else {
        statusText = `Jadwal hari ${dayName}`;
        dotColor = "var(--text-sub)";
    }

    document.getElementById('currentStatus').innerText = statusText;
    document.querySelector('.status-dot').style.background = dotColor;

    // RENDER TABEL (TOMBOL BARU)
    data.forEach((item, idx) => {
        let isActive = false;
        // Highlight hanya jika belum lewat jam 5
        if (isToday && currentHour < 17) {
            const parts = item.time.split("-");
            if(parts.length >= 2) {
                const start = parts[0].trim().replace(/\./g, ':').split(':').map(Number);
                const end = parts[1].trim().split(" ")[0].replace(/\./g, ':').split(':').map(Number);
                const sM = start[0]*60+start[1]; const eM = end[0]*60+end[1];
                if(curMins >= sM && curMins < eM) { isActive = true; }
            }
        }
        
        // --- TOMBOL DIPERCANTIK ---
        const noteElem = `<button class="btn-note" onclick="alert('Fitur catatan per mapel akan hadir di update berikutnya!')">
                            <i class="fas fa-sticky-note"></i> Catatan
                          </button>`;
        
        const editElem = `<button class="btn-edit-round" onclick="openScheduleEdit('${dayName}',${idx})" title="Edit Jadwal">
                            <i class="fas fa-pencil-alt"></i>
                          </button>`;
        
        tbody.innerHTML += `
        <tr class="${isActive?'active-row':''}">
            <td><b>${escapeHtml(item.mapel)}</b><br><small style="color:var(--text-sub)">${escapeHtml(item.guru || '')}</small></td>
            <td>${escapeHtml(item.time)}</td>
            <td>${noteElem}</td>
            <td>${editElem}</td>
        </tr>`;
    });
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
    const name = escapeHtml(document.getElementById('editMapelName').value);
    const time = escapeHtml(document.getElementById('editMapelTime').value);
    const type = document.getElementById('editMapelType').value;
    
    if (!name || !time) return showToast("Data tidak boleh kosong!", "error");
    
    const { day, idx } = currentScheduleEdit;
    let displayType = currentWeekType === 'auto' ? ((getWeekNumber(new Date()) % 2 !== 0) ? 'umum' : 'produktif') : currentWeekType;
    
    jadwalData[displayType][day][idx] = { ...jadwalData[displayType][day][idx], mapel: name, time, type };
    saveDB('jadwalData', jadwalData);
    
    document.getElementById('scheduleEditModal').style.display = 'none'; 
    showToast("Jadwal diupdate!", "success");
}
function closeScheduleEditModal() { document.getElementById('scheduleEditModal').style.display = 'none'; }


// --- TO-DO LIST ---
function formatDateIndo(dateString) { if(!dateString) return ""; return new Date(dateString).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' }); }
function getDaysRemaining(dateString) { if (!dateString) return null; const target = new Date(dateString); target.setHours(0,0,0,0); const today = new Date(); today.setHours(0,0,0,0); return Math.ceil((target - today) / (1000 * 60 * 60 * 24)); }
function filterTasks(type, btn) { taskFilter = type; document.querySelectorAll('.tab').forEach(b => b.classList.remove('active')); btn.classList.add('active'); loadTasks(); }

function handleTaskButton() {
    const text = escapeHtml(document.getElementById('taskInput').value);
    const date = document.getElementById('taskDate').value; 
    const priority = document.getElementById('taskPriority').value;

    if(!text) return showToast("Isi nama tugas dulu!", 'error');
    if(!date) return showToast("Pilih tanggal deadline dulu!", 'error');

    let tasks = getDB('tasks'); 

    if(editingTaskId) {
        const idx = tasks.findIndex(t => t.id === editingTaskId);
        if(idx !== -1) { tasks[idx].text = text; tasks[idx].date = date; tasks[idx].priority = priority; showToast("Tugas diupdate!", "success"); }
        editingTaskId = null; document.getElementById('addTaskBtn').innerHTML = `Tambah Tugas`;
    } else {
        tasks.push({ id: Date.now(), text, date: date, priority, completed: false });
        playSuccessSound('ding'); showToast("Tugas ditambah ke Cloud!", "success");
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

    filtered.sort((a, b) => new Date(a.date) - new Date(b.date));

    filtered.forEach(t => {
        const daysLeft = getDaysRemaining(t.date);
        let dateDisplay = `<i class="far fa-calendar"></i> ${formatDateIndo(t.date)}`;
        let badgeClass = 'deadline-far';
        
        if (daysLeft !== null && !t.completed) {
            if (daysLeft < 0) { dateDisplay = `⚠️ Telat ${Math.abs(daysLeft)} hari`; badgeClass = 'deadline-urgent'; }
            else if (daysLeft === 0) { dateDisplay = `🔥 HARI INI`; badgeClass = 'deadline-urgent'; }
            else if (daysLeft === 1) { dateDisplay = `⏰ Besok`; badgeClass = 'deadline-near'; }
            else { 
                dateDisplay = `📅 ${daysLeft} Hari Lagi (${formatDateIndo(t.date)})`; 
                badgeClass = daysLeft <= 3 ? 'deadline-near' : 'deadline-far'; 
            }
        }

        list.innerHTML += `
            <li class="task-item priority-${t.priority} ${t.completed ? 'completed' : ''}">
                <div class="task-content">
                    <div class="check-btn" onclick="toggleTask(${t.id})"><i class="fas fa-check"></i></div>
                    <div class="task-text">
                        <span>${escapeHtml(t.text)}</span>
                        <small class="${badgeClass}">${dateDisplay} • ${t.priority}</small>
                    </div>
                </div>
                <div class="task-actions">
                    <button class="action-btn" onclick="loadTaskToEdit(${t.id})"><i class="fas fa-pencil-alt"></i></button>
                    <button class="action-btn delete" onclick="deleteTask(${t.id})"><i class="fas fa-trash"></i></button>
                </div>
            </li>`;
    });
    renderUrgentDeadlines(tasks);
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
        if(t.completed) playSuccessSound('ding');
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

// --- KEUANGAN ---
function addTransaction(type) {
    const desc = escapeHtml(document.getElementById('moneyDesc').value);
    const amount = parseInt(document.getElementById('moneyAmount').value);
    const wallet = document.getElementById('selectedWallet').value; 
    const category = document.getElementById('txnCategory').value;
    
    if(!desc || !amount || amount <= 0) return showToast("Data tidak valid!", 'error');
    
    const newTxn = { id: Date.now(), desc, amount, type, wallet, category, date: new Date().toISOString().split('T')[0] };
    let txns = cachedData.transactions;
    txns.push(newTxn);
    
    lastTransaction = newTxn;
    saveDB('transactions', txns);
    
    if(type === 'in') playSuccessSound('coin'); 
    document.getElementById('moneyDesc').value = ''; document.getElementById('moneyAmount').value = '';
    showToast(`${type==='in'?"Masuk":"Keluar"} Rp ${amount} tercatat!`, type==='in'?'success':'error');
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

    const displayTxns = txns.slice().reverse();
    displayTxns.forEach(t => {
        let show = (filter === 'all') || (filter === 'in' && t.type === 'in') || (filter === 'out' && t.type === 'out');
        if(show) {
            const color = t.type === 'in' ? 'var(--green)' : 'var(--red)';
            const sign = t.type === 'in' ? '+' : '-';
            list.innerHTML += `
                <li class="txn-item">
                    <div class="txn-left"><b>${escapeHtml(t.desc)}</b><small>${t.wallet.toUpperCase()} • ${t.category}</small></div>
                    <div class="txn-right"><b style="color:${color}">${sign} ${t.amount.toLocaleString()}</b>
                    <button class="delete-txn-btn" onclick="delTxn(${t.id})"><i class="fas fa-trash"></i></button></div>
                </li>`;
        }
    });

    document.getElementById('totalBalance').innerText = "Rp " + bal.total.toLocaleString();
    ['dana','ovo','gopay','cash'].forEach(k => document.getElementById(`saldo-${k}`).innerText = "Rp " + bal[k].toLocaleString());
    
    renderExpenseChart(txns);
}

function delTxn(id) { 
    if(confirm("Hapus?")) { 
        const t = cachedData.transactions.filter(x => x.id !== id); 
        saveDB('transactions', t); 
    } 
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

// --- LOGIKA TARGET (DESIMAL FIX) ---
function loadTarget() {
    const uid = window.auth.currentUser ? window.auth.currentUser.uid : null;
    if(!uid) return;

    const target = parseInt(localStorage.getItem(`${uid}_target`) || 0);
    const txns = cachedData.transactions;
    
    let saving = 0; 
    // Hitung hanya uang MASUK dengan kategori TABUNGAN
    txns.forEach(t => { 
        if(t.category === 'Tabungan' && t.type === 'in') {
            saving += t.amount; 
        }
        // Opsional: Jika ingin uang KELUAR dari tabungan mengurangi target
        if(t.category === 'Tabungan' && t.type === 'out') {
            saving -= t.amount;
        }
    });
    
    // Pastikan tidak minus
    if (saving < 0) saving = 0;

    document.getElementById('targetAmount').innerText = "Rp " + target.toLocaleString();
    
    // Logika Persentase dengan Desimal (agar tidak stuck di 0%)
    let pct = 0;
    if (target > 0) {
        pct = (saving / target) * 100;
    }
    
    // Batasi max 100%
    if (pct > 100) pct = 100;

    // Tampilkan 1 angka di belakang koma jika kecil (misal 0.5%)
    // Jika bulat, hilangkan koma (misal 50.0% jadi 50%)
    let pctDisplay = pct.toFixed(1); 
    if (pctDisplay.endsWith('.0')) pctDisplay = Math.round(pct);

    document.getElementById('targetProgressBar').style.width = `${pct}%`;
    document.getElementById('targetPercentage').innerText = `${pctDisplay}% (${saving.toLocaleString()})`;
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
        html += `
        <div class="expense-item">
            <div class="expense-label"><span class="dot" style="background:${colors[c]||'#ccc'}"></span>${c}</div>
            <div class="expense-value">${cats[c].toLocaleString()} <small>(${pct}%)</small></div>
            <div class="expense-bar-bg"><div class="expense-bar-fill" style="width:${pct}%;background:${colors[c]||'#ccc'}"></div></div>
        </div>`;
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
    showToast("Suara disimpan!", "success"); 
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
function loadRandomQuote() { if(document.getElementById('motivationQuote')) document.getElementById('motivationQuote').innerText = `"${motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]}"`; }
function openClearDataModal() { if(confirm("Yakin hapus data lokal dan logout?")) { localStorage.clear(); location.reload(); } }
function exportData() { 
    const d=cachedData; 
    const b=new Blob([JSON.stringify(d)],{type:"application/json"}); 
    const a=document.createElement('a'); a.href=URL.createObjectURL(b); a.download=`${currentUser}_backup.json`; a.click(); 
}

// --- UTILS UI & RESTORE DATA ---
window.toggleSettings = function() { 
    const dropdown = document.getElementById('settingsDropdown');
    if (dropdown) dropdown.classList.toggle('active');
}

window.selectWallet = function(walletId, el) {
    document.getElementById('selectedWallet').value = walletId;
    document.querySelectorAll('.wallet-card').forEach(card => {
        card.classList.remove('active');
    });
    el.classList.add('active');
}

window.importData = function(input) {
    const file = input.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            if (confirm("Apakah Anda yakin ingin menimpa data saat ini dengan data backup?")) {
                cachedData = data;
                saveAllToCloud(); 
                showToast("Data berhasil direstore!", "success");
                setTimeout(() => location.reload(), 1000);
            }
        } catch (err) {
            console.error(err);
            showToast("File backup rusak atau tidak valid!", "error");
        }
    };
    reader.readAsText(file);
    input.value = '';
}

// --- FITUR TAMBAH JADWAL BARU (DARI MODAL) ---
window.openAddScheduleModal = function() {
    const currentDayName = days[currentDayIdx];
    document.getElementById('addScheduleDay').value = currentDayName;
    
    let currentType = document.getElementById('weekTypeSelector').value;
    if(currentType === 'auto') currentType = 'umum'; 
    document.getElementById('addScheduleWeekType').value = currentType;

    document.getElementById('addScheduleMapel').value = '';
    document.getElementById('addScheduleGuru').value = '';
    document.getElementById('addScheduleTime').value = '';
    
    document.getElementById('addScheduleModal').style.display = 'flex';
}

window.saveNewSchedule = function() {
    const weekType = document.getElementById('addScheduleWeekType').value;
    const day = document.getElementById('addScheduleDay').value;
    const mapel = document.getElementById('addScheduleMapel').value;
    const guru = document.getElementById('addScheduleGuru').value;
    const time = document.getElementById('addScheduleTime').value;
    const type = document.getElementById('addScheduleType').value;

    if(!mapel || !time) {
        showToast("Nama Mapel dan Waktu wajib diisi!", "error");
        return;
    }

    const newItem = { mapel, guru, time, type };

    if (!jadwalData[weekType]) jadwalData[weekType] = {};
    if (!jadwalData[weekType][day]) jadwalData[weekType][day] = [];

    jadwalData[weekType][day].push(newItem);
    
    // Sortir jadwal agar urut waktu
    jadwalData[weekType][day].sort((a, b) => {
        const timeA = a.time.split('-')[0].trim().replace('.',':');
        const timeB = b.time.split('-')[0].trim().replace('.',':');
        return timeA.localeCompare(timeB);
    });

    saveDB('jadwalData', jadwalData);
    renderSchedule();
    document.getElementById('addScheduleModal').style.display = 'none';
    showToast("Jadwal berhasil ditambahkan!", "success");
}

window.closeNoteModal = function() { document.getElementById('noteModal').style.display = 'none'; }
window.saveNoteFromModal = function() { showToast("Catatan disimpan (Placeholder)", "success"); closeNoteModal(); }
window.deleteNote = function() { if(confirm("Hapus catatan?")) { document.getElementById('noteModalInput').value = ""; closeNoteModal(); } }

// --- FITUR HAPUS JADWAL (BARU) ---
window.deleteSchedule = function() {
    // Cek apakah ada jadwal yang sedang diedit
    if (!currentScheduleEdit) return;
    
    if(confirm("Yakin ingin menghapus jadwal mata pelajaran ini?")) {
        const { day, idx } = currentScheduleEdit;
        
        // Tentukan kita sedang di minggu apa (Umum/Produktif)
        let displayType = currentWeekType;
        if (currentWeekType === 'auto') {
             displayType = (getWeekNumber(new Date()) % 2 !== 0) ? 'umum' : 'produktif';
        }

        // Proses Hapus
        if(jadwalData[displayType] && jadwalData[displayType][day]) {
            // Hapus 1 item pada index tersebut
            jadwalData[displayType][day].splice(idx, 1);
            
            // Simpan perubahan ke Firebase
            saveDB('jadwalData', jadwalData);
            
            // Refresh tampilan & tutup modal
            renderSchedule();
            closeScheduleEditModal();
            showToast("Jadwal berhasil dihapus!", "success");
        }
    }
}
