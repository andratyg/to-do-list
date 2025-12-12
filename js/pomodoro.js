// js/pomodoro.js
import { CONFIG, cachedData } from './config.js';
import { saveDB, saveSetting } from './db.js';
import { showToast, playSuccessSound, formatTime } from './utils.js';
import { addXP } from './gamification.js';

let timerInterval = null;
let isPaused = true;
let isWorking = true;
let timeLeft = CONFIG.WORK_DURATION_DEFAULT;

let isExamMode = false;
let soundPreference = "bell";

// Fokus Control
let isFocusLocked = false;
let isTabBlurred = false;
let blurCount = 0;
let savedFocusTime = null;
let savedBreakTime = null;
let focusType = 'strict'; 

const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

export function getIsExamMode() { return isExamMode; }
export function setIsExamMode(val) { isExamMode = val; }

export function logFocusTime(minutes) {
    if(minutes <= 0) return;
    const today = new Date().toISOString().split('T')[0];
    let logs = cachedData.focusLogs;
    if(!logs[today]) logs[today] = 0;
    logs[today] += minutes;
    saveDB('focusLogs', logs);
    renderFocusChart();
}

export function renderFocusChart() {
    const chart = document.getElementById('focusChart');
    if(!chart) return;
    chart.innerHTML = '';
    
    let html = '<div style="display: flex; gap: 5px; align-items: flex-end; height: 80px; padding-bottom: 5px; width:100%;">';
    for(let i=6; i>=0; i--) {
        const d = new Date(); d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        const dayName = days[d.getDay()].substring(0,3); 
        const minutes = cachedData.focusLogs[dateStr] || 0;
        let heightPct = (minutes / 120) * 100; 
        if(heightPct > 100) heightPct = 100;
        if(heightPct < 5 && minutes > 0) heightPct = 5;
        
        html += `
            <div style="flex:1; display:flex; flex-direction:column; align-items:center; justify-content:flex-end; height:100%;">
                <div style="width:80%; background:rgba(255,255,255,0.5); height:${heightPct}%; border-radius:4px; position:relative; min-height: ${minutes>0?4:0}px;" title="${minutes} Menit"></div>
                <small style="font-size:0.6rem; color:white; margin-top:4px;">${dayName}</small>
            </div>
        `;
    }
    html += '</div>';
    chart.innerHTML = html;
}

export function setFocusType(type) {
    if (!isPaused) return showToast("Jeda timer dulu untuk ganti mode!", "error");
    focusType = type;
    document.getElementById('btnModeStrict').className = type === 'strict' ? 'mode-btn active' : 'mode-btn';
    document.getElementById('btnModeChill').className = type === 'chill' ? 'mode-btn active' : 'mode-btn';
    if (type === 'strict') showToast("Mode Ketat: Pindah tab = Timer Pause 🔒", "info");
    else showToast("Mode Santai: Bebas buka tab lain ☕", "success");
}

export function setFocusLock(lock) {
    isFocusLocked = lock && (focusType === 'strict');
    const focusModeElement = document.getElementById('focusModeLockText'); 
    if(focusModeElement) {
        focusModeElement.style.display = isFocusLocked ? 'block' : 'none';
    }
}

export function handleTabBlur() {
    if (isExamMode) {
        showToast("⚠️ PERINGATAN: Dilarang pindah tab saat Ujian!", "error");
        playSuccessSound('coin'); 
    }

    if (focusType === 'strict' && isFocusLocked && !isPaused && isWorking) {
        isTabBlurred = true;
        blurCount++;
        pauseTimer(); 
        showToast(`❌ MODE KETAT: Timer dijeda karena pindah tab!`, 'error');
    }
}

export function handleTabFocus() {
    if (focusType === 'strict' && isFocusLocked && isTabBlurred) {
        isTabBlurred = false;
    }
}

export function handleBeforeUnload(event) {
    if (!isPaused && isWorking) {
        event.preventDefault();
        event.returnValue = "Timer sedang berjalan!";
        return "Timer sedang berjalan!";
    }
}

export function updateTimerDisplay() {
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
            document.getElementById('startPauseBtn').innerText = "Skip";
            document.getElementById('startPauseBtn').setAttribute('onclick', 'resumeFocus()');
        } else {
            document.getElementById('startPauseBtn').innerText = "Lanjut";
            document.getElementById('startPauseBtn').setAttribute('onclick', 'resumeFocus()');
        }
    }
    if (timeLeft === 0) toggleMode();
}

export function startTimer() {
    if (!isPaused) return;
    isPaused = false;
    if(isWorking) setFocusLock(true); 
    updateTimerDisplay();
    timerInterval = setInterval(() => { timeLeft--; updateTimerDisplay(); }, 1000);
}

export function pauseTimer() {
    if (isPaused) return;
    isPaused = true;
    clearInterval(timerInterval);
    if (isWorking) {
        savedFocusTime = timeLeft; 
        const durationSetting = isExamMode ? CONFIG.WORK_DURATION_EXAM : CONFIG.WORK_DURATION_DEFAULT;
        const workedMinutes = Math.floor((durationSetting - timeLeft) / 60);
        if(workedMinutes > 0) logFocusTime(workedMinutes);
        isWorking = false; 
        if (savedBreakTime !== null && savedBreakTime > 0) timeLeft = savedBreakTime; 
        else timeLeft = isExamMode ? CONFIG.BREAK_DURATION_EXAM : CONFIG.BREAK_DURATION_DEFAULT; 
        showToast("Fokus dijeda. Istirahat dulu!", "info");
        updateTimerDisplay();
        startTimer(); 
    }
    setFocusLock(false); 
}

export function resumeFocus() {
    savedBreakTime = timeLeft; 
    clearInterval(timerInterval);
    isPaused = true;
    isWorking = true;
    if (savedFocusTime !== null && savedFocusTime > 0) {
        timeLeft = savedFocusTime;
        showToast("Melanjutkan Fokus...", "success");
    } else {
        timeLeft = isExamMode ? CONFIG.WORK_DURATION_EXAM : CONFIG.WORK_DURATION_DEFAULT;
        showToast("Mulai Fokus Baru", "success");
    }
    savedFocusTime = null;
    updateTimerDisplay();
    startTimer();
}

export function resetTimer() {
    clearInterval(timerInterval);
    isPaused = true;
    isWorking = true;
    timeLeft = isExamMode ? CONFIG.WORK_DURATION_EXAM : CONFIG.WORK_DURATION_DEFAULT; 
    savedFocusTime = null; 
    savedBreakTime = null;
    updateTimerDisplay();
    setFocusLock(false);
}

export function toggleMode() {
    clearInterval(timerInterval);
    isPaused = true;
    if (isWorking) {
         const durationSetting = isExamMode ? CONFIG.WORK_DURATION_EXAM : CONFIG.WORK_DURATION_DEFAULT;
         const workedMinutes = Math.floor(durationSetting / 60);
         logFocusTime(workedMinutes);
         addXP(20); 
         isWorking = false;
         savedBreakTime = null;
         timeLeft = isExamMode ? CONFIG.BREAK_DURATION_EXAM : CONFIG.BREAK_DURATION_DEFAULT;
         showToast("Waktunya ISTIRAHAT! ☕ (+20 XP)", "info");
    } else {
        isWorking = true;
        savedFocusTime = null;
        timeLeft = isExamMode ? CONFIG.WORK_DURATION_EXAM : CONFIG.WORK_DURATION_DEFAULT;
        showToast("Kembali FOKUS! 🔔", "info");
    }
    playSuccessSound('bell');
    updateTimerDisplay();
    startTimer(); 
}

export function loadPomodoroTasks() {
    const s = document.getElementById('pomodoroTaskSelector');
    if(!s) return;
    s.innerHTML = '<option value="">-- Pilih Tugas untuk Fokus --</option>';
    cachedData.tasks.filter(t => !t.completed).forEach(t => {
        const o = document.createElement('option');
        o.value = t.id; o.innerText = t.text; s.appendChild(o);
    });
}

export function loadSoundSettings() { 
    const uid = window.auth.currentUser ? window.auth.currentUser.uid : null;
    if(uid) soundPreference = localStorage.getItem(`${uid}_soundPreference`) || 'bell'; 
    if(document.getElementById('pomodoroSoundSelect')) document.getElementById('pomodoroSoundSelect').value = soundPreference; 
}
export function saveSoundSettings() { 
    const uid = window.auth.currentUser.uid;
    soundPreference = document.getElementById('pomodoroSoundSelect').value; 
    localStorage.setItem(`${uid}_soundPreference`, soundPreference); 
    document.getElementById('soundModal').style.display='none'; 
    showToast("Disimpan!", "success"); 
}
export function showSoundSettings() { document.getElementById('soundModal').style.display='flex'; }

export function checkExamMode() {
    const financeCard = document.getElementById('financeCard');
    if(financeCard) financeCard.style.display = isExamMode ? 'none' : 'block';
    timeLeft = isExamMode ? CONFIG.WORK_DURATION_EXAM : CONFIG.WORK_DURATION_DEFAULT; 
    updateTimerDisplay();
}

export function toggleExamMode() { 
    isExamMode = !isExamMode; 
    saveSetting('isExamMode', isExamMode);
    checkExamMode(); 
    showToast(isExamMode ? "Mode Ujian AKTIF" : "Mode Ujian NONAKTIF", 'info'); 
}