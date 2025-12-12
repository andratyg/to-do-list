// js/schedule.js
import { cachedData, days, defaultJadwalData } from './config.js';
import { saveDB, saveSetting } from './db.js';
import { showToast, escapeHtml, getWeekNumber } from './utils.js';
import { getIsExamMode } from './pomodoro.js';

let currentDayIdx = new Date().getDay();
let currentWeekType = "umum";
let currentNoteTarget = null;
let currentScheduleEdit = null;

export function changeDay(dir) { currentDayIdx += dir; if(currentDayIdx>6) currentDayIdx=0; if(currentDayIdx<0) currentDayIdx=6; renderSchedule(); }

export function changeWeekType() { 
    currentWeekType = document.getElementById('weekTypeSelector').value; 
    saveSetting('weekType', currentWeekType);
    renderSchedule(); 
}

export function loadScheduleFilters() {
    const guruSet = new Set();
    const guruSelector = document.getElementById('scheduleFilterGuru');
    const jadwalData = cachedData.jadwal || defaultJadwalData;
    
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

export function renderSchedule() {
    // Sync currentWeekType from cache if available
    if(cachedData.settings && cachedData.settings.weekType) currentWeekType = cachedData.settings.weekType;
    
    const dayName = days[currentDayIdx];
    document.getElementById('activeDayName').innerText = dayName.toUpperCase();
    document.getElementById('weekTypeSelector').value = currentWeekType;

    let currentWeekDisplay = currentWeekType;
    if (currentWeekType === 'auto') currentWeekDisplay = (getWeekNumber(new Date()) % 2 !== 0) ? 'umum' : 'produktif';
    
    let jadwalData = cachedData.jadwal;
    if(!jadwalData) return;
    if(!jadwalData[currentWeekDisplay]) jadwalData[currentWeekDisplay] = {};
    
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
        const statusBar = document.querySelector('.schedule-status-bar');
        if(statusBar) {
             statusBar.innerHTML = `<div id="liveStatusWidget" class="live-status-widget"><div class="status-icon-box"><i class="fas fa-bolt" id="statusIcon"></i></div><div class="status-content"><h4 id="statusLabel">STATUS SAAT INI</h4><p id="statusText">Memuat...</p></div></div>`;
             statusWidget = document.getElementById('liveStatusWidget');
        }
    }

    if(!data || data.length === 0) { 
        if(tbody.parentElement) tbody.parentElement.style.display='none'; 
        document.getElementById('holidayMessage').style.display='block'; 
        if(statusWidget) { document.getElementById('statusText').innerText = "Tidak ada jadwal (Libur)"; statusWidget.className = "live-status-widget status-chill"; }
        return; 
    }
    
    if(tbody.parentElement) tbody.parentElement.style.display='table'; 
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
        const noteBtnClass = hasNote ? "btn-note has-content" : "btn-note";
        const noteIcon = hasNote ? "fas fa-check-square" : "fas fa-sticky-note";
        const noteElem = `<button class="${noteBtnClass}" onclick="openMapelNote('${dayName}', ${idx})"><i class="${noteIcon}"></i> ${hasNote ? "Ada Catatan" : "Catatan"}</button>`;
        const editElem = `<button class="btn-edit-round" onclick="openScheduleEdit('${dayName}',${idx})"><i class="fas fa-pencil-alt"></i></button>`;
        tbody.innerHTML += `<tr class="${isActive?'active-row':''}"><td><b>${escapeHtml(item.mapel)}</b><br><small style="color:var(--text-sub)">${escapeHtml(item.guru || '')}</small></td><td>${escapeHtml(item.time)}</td><td>${noteElem}</td><td>${editElem}</td></tr>`;
    });
}

export function checkReminders() { 
    if(!cachedData.jadwal) return;
    const now=new Date(); const m=now.getHours()*60+now.getMinutes(); const d=days[now.getDay()]; 
    let displayType = currentWeekType === 'auto' ? ((getWeekNumber(new Date()) % 2 !== 0) ? 'umum' : 'produktif') : currentWeekType;
    if(cachedData.jadwal[displayType] && cachedData.jadwal[displayType][d]) {
        const data=cachedData.jadwal[displayType][d]; 
        data.forEach(i => { const p=i.time.split("-"); if(p.length>=2) { const s=p[0].trim().replace(/\./g,':').split(':').map(Number); if(m===(s[0]*60+s[1])-5) showToast(`🔔 5 Menit lagi: ${i.mapel}`, 'info'); } }); 
    }
}

// Modal Functions
export function openMapelNote(day, idx) {
    currentNoteTarget = `${day}_${idx}`;
    const savedNote = cachedData.scheduleNotes[currentNoteTarget] || "";
    document.getElementById('noteModalInput').value = savedNote;
    let displayType = currentWeekType === 'auto' ? ((getWeekNumber(new Date()) % 2 !== 0) ? 'umum' : 'produktif') : currentWeekType;
    if(cachedData.jadwal[displayType] && cachedData.jadwal[displayType][day]) {
         document.getElementById('noteModalTitle').innerText = `📝 Catatan: ${cachedData.jadwal[displayType][day][idx].mapel}`;
    }
    document.getElementById('noteModal').style.display = 'flex';
}

export function saveNoteFromModal() {
    if(!currentNoteTarget) return;
    const val = document.getElementById('noteModalInput').value;
    if(!cachedData.scheduleNotes) cachedData.scheduleNotes = {};
    cachedData.scheduleNotes[currentNoteTarget] = val;
    saveDB('scheduleNotes', cachedData.scheduleNotes);
    closeNoteModal();
    renderSchedule(); 
    showToast("Catatan Mapel Disimpan!", "success");
}

export function deleteNote() {
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
export function closeNoteModal() { document.getElementById('noteModal').style.display = 'none'; currentNoteTarget = null; }

export function openScheduleEdit(day, idx) {
    currentScheduleEdit = { day, idx };
    let displayType = currentWeekType === 'auto' ? ((getWeekNumber(new Date()) % 2 !== 0) ? 'umum' : 'produktif') : currentWeekType;
    const item = cachedData.jadwal[displayType][day][idx];
    document.getElementById('editMapelName').value = item.mapel;
    document.getElementById('editMapelTime').value = item.time;
    document.getElementById('editMapelType').value = item.type;
    document.getElementById('scheduleEditModal').style.display = 'flex';
}

export function saveScheduleChanges() {
    const n = document.getElementById('editMapelName').value;
    const t = document.getElementById('editMapelTime').value;
    const type = document.getElementById('editMapelType').value;
    if (!n || !t) return showToast("Isi semua!", "error");
    const { day, idx } = currentScheduleEdit;
    let displayType = currentWeekType === 'auto' ? ((getWeekNumber(new Date()) % 2 !== 0) ? 'umum' : 'produktif') : currentWeekType;
    cachedData.jadwal[displayType][day][idx] = { ...cachedData.jadwal[displayType][day][idx], mapel: n, time: t, type };
    saveDB('jadwalData', cachedData.jadwal);
    document.getElementById('scheduleEditModal').style.display = 'none';
    showToast("Diupdate!", "success");
    renderSchedule();
}
export function closeScheduleEditModal() { document.getElementById('scheduleEditModal').style.display = 'none'; }

export function openAddScheduleModal() { document.getElementById('addScheduleDay').value = days[currentDayIdx]; document.getElementById('addScheduleModal').style.display = 'flex'; }

export function saveNewSchedule() {
    const w = document.getElementById('addScheduleWeekType').value;
    const d = document.getElementById('addScheduleDay').value;
    const m = document.getElementById('addScheduleMapel').value;
    const g = document.getElementById('addScheduleGuru').value;
    const t = document.getElementById('addScheduleTime').value;
    const ty = document.getElementById('addScheduleType').value;
    if(!m || !t) return showToast("Wajib isi!", "error");
    
    let jadwalData = cachedData.jadwal;
    if (!jadwalData[w]) jadwalData[w] = {};
    if (!jadwalData[w][d]) jadwalData[w][d] = [];
    jadwalData[w][d].push({ mapel: m, guru: g, time: t, type: ty });
    jadwalData[w][d].sort((a, b) => a.time.localeCompare(b.time));
    saveDB('jadwalData', jadwalData);
    renderSchedule();
    document.getElementById('addScheduleModal').style.display = 'none';
    showToast("Jadwal Baru!", "success");
}

export function deleteSchedule() {
    if (!currentScheduleEdit) return;
    if(confirm("Hapus mapel ini?")) {
        const { day, idx } = currentScheduleEdit;
        let displayType = currentWeekType === 'auto' ? ((getWeekNumber(new Date()) % 2 !== 0) ? 'umum' : 'produktif') : currentWeekType;
        if(cachedData.jadwal[displayType] && cachedData.jadwal[displayType][day]) {
            cachedData.jadwal[displayType][day].splice(idx, 1);
            saveDB('jadwalData', cachedData.jadwal);
            renderSchedule();
            closeScheduleEditModal();
            showToast("Jadwal berhasil dihapus!", "success");
        }
    }
}