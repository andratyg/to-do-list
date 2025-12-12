// js/schedule.js
import { cachedData, days, defaultJadwalData } from './config.js';
import { saveDB, saveSetting } from './db.js';
import { showToast, escapeHtml, getWeekNumber } from './utils.js';

let currentDayIdx = new Date().getDay();
let currentWeekType = "auto"; // Default auto biar menyesuaikan tanggal

let currentNoteTarget = null;
let currentScheduleEdit = null;

// --- NAVIGASI HARI ---
export function changeDay(dir) { 
    currentDayIdx += dir; 
    if(currentDayIdx > 6) currentDayIdx = 0; 
    if(currentDayIdx < 0) currentDayIdx = 6; 
    renderSchedule(); 
}

// --- GANTI TIPE MINGGU (UMUM/PRODUKTIF) ---
export function changeWeekType() { 
    const selector = document.getElementById('weekTypeSelector');
    if (selector) {
        currentWeekType = selector.value;
        
        // Simpan setting agar tidak reset saat refresh
        if(!cachedData.settings) cachedData.settings = {};
        cachedData.settings.weekType = currentWeekType;
        saveSetting('weekType', currentWeekType);
        
        // Paksa render ulang langsung
        renderSchedule(); 
    }
}

// --- LOAD FILTER GURU ---
export function loadScheduleFilters() {
    const guruSet = new Set();
    const guruSelector = document.getElementById('scheduleFilterGuru');
    
    // Gunakan data yang ada atau default jika kosong
    const sourceData = cachedData.jadwal || defaultJadwalData;
    
    if (!guruSelector) return;
    
    // Reset isi dropdown
    guruSelector.innerHTML = '<option value="all">Filter Guru/Dosen (Semua)</option>';

    if(sourceData) {
        Object.values(sourceData).forEach(week => {
            if(week) {
                Object.values(week).forEach(dayData => {
                    if(Array.isArray(dayData)) {
                        dayData.forEach(item => { if (item.guru) guruSet.add(item.guru); });
                    }
                });
            }
        });
    }
    
    // Masukkan list guru ke dropdown
    Array.from(guruSet).sort().forEach(guru => {
        guruSelector.innerHTML += `<option value="${escapeHtml(guru)}">${escapeHtml(guru)}</option>`;
    });
}

// --- RENDER JADWAL (TAMPILKAN KE LAYAR) ---
export function renderSchedule() {
    const activeDayEl = document.getElementById('activeDayName');
    const selectorEl = document.getElementById('weekTypeSelector');
    const tbody = document.getElementById('scheduleBody');
    const holidayMsg = document.getElementById('holidayMessage');
    
    if(!activeDayEl || !selectorEl || !tbody) return;

    // Sinkronisasi setting terakhir user
    if(cachedData.settings && cachedData.settings.weekType) {
        // Jika user pernah ubah manual, pakai setting itu. Jika tidak, tetap di state sekarang.
        // Kita hanya overwrite currentWeekType jika berbeda, agar UI sync.
        if (selectorEl.value !== cachedData.settings.weekType) {
             currentWeekType = cachedData.settings.weekType;
        }
    }
    
    const dayName = days[currentDayIdx];
    activeDayEl.innerText = dayName.toUpperCase();
    selectorEl.value = currentWeekType; 

    // Tentukan mau tampilkan minggu apa
    let displayType = currentWeekType;
    if (currentWeekType === 'auto') {
        const weekNum = getWeekNumber(new Date());
        displayType = (weekNum % 2 !== 0) ? 'umum' : 'produktif';
    }
    
    // [PENTING] Ambil data jadwal. Jika kosong, pakai default.
    let jadwalData = cachedData.jadwal;
    if(!jadwalData) {
        jadwalData = defaultJadwalData; 
    }
    
    // Pastikan path data aman (tidak error undefined)
    if(!jadwalData[displayType]) jadwalData[displayType] = {};
    
    let data = jadwalData[displayType][dayName] || [];
    
    // Filter Data (Kategori / Guru)
    const filterCatEl = document.getElementById('scheduleFilterCategory');
    const filterGuruEl = document.getElementById('scheduleFilterGuru');
    const filterCat = filterCatEl ? filterCatEl.value : 'all';
    const filterGuru = filterGuruEl ? filterGuruEl.value : 'all';
    
    if (data.length > 0) {
        data = data.filter(item => 
            (filterCat === 'all' || item.type === filterCat) && 
            (filterGuru === 'all' || item.guru === filterGuru)
        );
    }

    // Render Widget Status (Sedang Belajar apa?)
    renderStatusWidget(data, dayName);

    // Render Tabel
    tbody.innerHTML = '';
    
    if(!data || data.length === 0) { 
        if(tbody.parentElement) tbody.parentElement.style.display='none'; 
        if(holidayMsg) holidayMsg.style.display='block'; 
        return; 
    }
    
    if(tbody.parentElement) tbody.parentElement.style.display='table'; 
    if(holidayMsg) holidayMsg.style.display='none';

    // Loop data untuk membuat baris tabel
    const now = new Date();
    const curMins = now.getHours() * 60 + now.getMinutes();
    const isToday = currentDayIdx === now.getDay();

    data.forEach((item, idx) => {
        let isActive = false;
        // Cek apakah mapel ini sedang berlangsung
        if (isToday) {
            const parts = item.time.split("-");
            if(parts.length >= 2) {
                const s = parts[0].trim().replace('.', ':').split(':').map(Number);
                const e = parts[1].trim().split(" ")[0].replace('.', ':').split(':').map(Number);
                const sMins = s[0]*60+s[1];
                const eMins = e[0]*60+e[1];
                if(curMins >= sMins && curMins < eMins) isActive = true;
            }
        }
        
        const noteKey = `${dayName}_${idx}`;
        const hasNote = cachedData.scheduleNotes && cachedData.scheduleNotes[noteKey];
        
        // Tombol-tombol aksi
        const noteBtnClass = hasNote ? "btn-note has-content" : "btn-note";
        const noteIcon = hasNote ? "fas fa-check-square" : "fas fa-sticky-note";
        const noteElem = `<button class="${noteBtnClass}" onclick="openMapelNote('${dayName}', ${idx})"><i class="${noteIcon}"></i> ${hasNote ? "Ada Catatan" : "Catatan"}</button>`;
        const editElem = `<button class="btn-edit-round" onclick="openScheduleEdit('${dayName}',${idx})"><i class="fas fa-pencil-alt"></i></button>`;
        
        tbody.innerHTML += `
            <tr class="${isActive?'active-row':''}">
                <td>
                    <b>${escapeHtml(item.mapel)}</b><br>
                    <small style="color:var(--text-sub)">${escapeHtml(item.guru || '')}</small>
                </td>
                <td>${escapeHtml(item.time)}</td>
                <td>${noteElem}</td>
                <td>${editElem}</td>
            </tr>`;
    });
}

function renderStatusWidget(data, dayName) {
    let statusWidget = document.getElementById('liveStatusWidget');
    // Inject widget jika belum ada
    if (!statusWidget) {
        const statusBar = document.querySelector('.schedule-status-bar');
        if(statusBar) {
             statusBar.innerHTML = `<div id="liveStatusWidget" class="live-status-widget"><div class="status-icon-box"><i class="fas fa-bolt" id="statusIcon"></i></div><div class="status-content"><h4 id="statusLabel">STATUS SAAT INI</h4><p id="statusText">Memuat...</p></div></div>`;
             statusWidget = document.getElementById('liveStatusWidget');
        }
    }
    
    if(!statusWidget) return;

    const now = new Date();
    const curMins = now.getHours() * 60 + now.getMinutes();
    const isToday = currentDayIdx === now.getDay();
    
    let statusText = `Jadwal ${dayName}`;
    let statusClass = "live-status-widget status-chill"; 
    let iconClass = "fas fa-calendar-alt";

    if (data.length === 0) {
        statusText = "Tidak ada jadwal (Libur/Kosong)";
    } else if (isToday) {
        if (now.getHours() >= 17) {
            statusText = "Selesai. Sampai jumpa besok!";
            statusClass = "live-status-widget status-chill";
            iconClass = "fas fa-moon";
        } else {
            let ongoing = false;
            data.forEach(item => {
                const parts = item.time.split("-");
                if(parts.length >= 2) {
                    const s = parts[0].trim().replace('.', ':').split(':').map(Number);
                    const e = parts[1].trim().split(" ")[0].replace('.', ':').split(':').map(Number);
                    const sMins = s[0]*60+s[1];
                    const eMins = e[0]*60+e[1];

                    if(curMins >= sMins && curMins < eMins) { 
                        statusText = `Sedang: ${item.mapel}`; 
                        statusClass = "live-status-widget status-busy"; 
                        iconClass = "fas fa-book-reader";
                        ongoing = true;
                    }
                }
            });
            if (!ongoing) {
                 if(curMins > 7*60 && curMins < 15*60) {
                     statusText = "Istirahat / Pergantian Jam";
                     statusClass = "live-status-widget status-chill";
                     iconClass = "fas fa-coffee";
                 } else {
                     statusText = "Menunggu Jam Masuk";
                 }
            }
        }
    }

    document.getElementById('statusText').innerText = statusText;
    document.getElementById('statusIcon').className = iconClass;
    statusWidget.className = statusClass;
}

// --- REMINDER JADWAL ---
export function checkReminders() { 
    if(!cachedData.jadwal) return;
    const now=new Date(); const m=now.getHours()*60+now.getMinutes(); const d=days[now.getDay()]; 
    let displayType = currentWeekType === 'auto' ? ((getWeekNumber(new Date()) % 2 !== 0) ? 'umum' : 'produktif') : currentWeekType;
    
    if(cachedData.jadwal[displayType] && cachedData.jadwal[displayType][d]) {
        const data=cachedData.jadwal[displayType][d]; 
        data.forEach(i => { 
            const p=i.time.split("-"); 
            if(p.length>=2) { 
                const s=p[0].trim().replace(/\./g,':').split(':').map(Number); 
                if(m === (s[0]*60+s[1])-5) showToast(`🔔 5 Menit lagi: ${i.mapel}`, 'info'); 
            } 
        }); 
    }
}

// --- MODAL FUNCTIONS (TAMBAH/EDIT) ---

export function openAddScheduleModal() { 
    document.getElementById('addScheduleDay').value = days[currentDayIdx]; 
    document.getElementById('addScheduleModal').style.display = 'flex'; 
}

// [FIX UTAMA] FUNGSI SIMPAN JADWAL
export function saveNewSchedule() {
    const w = document.getElementById('addScheduleWeekType').value;
    const d = document.getElementById('addScheduleDay').value;
    const m = document.getElementById('addScheduleMapel').value;
    const g = document.getElementById('addScheduleGuru').value;
    const t = document.getElementById('addScheduleTime').value;
    const ty = document.getElementById('addScheduleType').value;
    
    if(!m || !t) return showToast("Mata Pelajaran & Waktu Wajib diisi!", "error");
    
    // [SAFETY] Inisialisasi jika data jadwal belum ada sama sekali
    if (!cachedData.jadwal) {
        cachedData.jadwal = JSON.parse(JSON.stringify(defaultJadwalData));
    }
    
    // Pastikan path object aman
    if (!cachedData.jadwal[w]) cachedData.jadwal[w] = {};
    if (!cachedData.jadwal[w][d]) cachedData.jadwal[w][d] = [];
    
    // Push data baru
    cachedData.jadwal[w][d].push({ mapel: m, guru: g, time: t, type: ty });
    
    // Sort berdasarkan waktu agar rapi
    cachedData.jadwal[w][d].sort((a, b) => a.time.localeCompare(b.time));
    
    // Simpan ke DB & Render
    saveDB('jadwalData', cachedData.jadwal);
    renderSchedule();
    
    document.getElementById('addScheduleModal').style.display = 'none';
    
    // Reset Form
    document.getElementById('addScheduleMapel').value = '';
    document.getElementById('addScheduleGuru').value = '';
    document.getElementById('addScheduleTime').value = '';
    
    showToast("Jadwal Berhasil Ditambahkan! 🎉", "success");
}

export function openScheduleEdit(day, idx) {
    currentScheduleEdit = { day, idx };
    // Cari data yang mau diedit
    let displayType = currentWeekType === 'auto' ? ((getWeekNumber(new Date()) % 2 !== 0) ? 'umum' : 'produktif') : currentWeekType;
    
    // Fallback ke default jika data belum siap
    let jadwalData = cachedData.jadwal || defaultJadwalData;
    
    if(jadwalData[displayType] && jadwalData[displayType][day] && jadwalData[displayType][day][idx]) {
        const item = jadwalData[displayType][day][idx];
        document.getElementById('editMapelName').value = item.mapel;
        document.getElementById('editMapelTime').value = item.time;
        document.getElementById('editMapelType').value = item.type;
        document.getElementById('scheduleEditModal').style.display = 'flex';
    } else {
        showToast("Data jadwal tidak ditemukan!", "error");
    }
}

export function saveScheduleChanges() {
    const n = document.getElementById('editMapelName').value;
    const t = document.getElementById('editMapelTime').value;
    const type = document.getElementById('editMapelType').value;
    
    if (!n || !t) return showToast("Isi semua data!", "error");
    
    const { day, idx } = currentScheduleEdit;
    let displayType = currentWeekType === 'auto' ? ((getWeekNumber(new Date()) % 2 !== 0) ? 'umum' : 'produktif') : currentWeekType;
    
    // Pastikan data di cache ada
    if (!cachedData.jadwal) cachedData.jadwal = JSON.parse(JSON.stringify(defaultJadwalData));

    if(cachedData.jadwal[displayType] && cachedData.jadwal[displayType][day]) {
        // Update item
        cachedData.jadwal[displayType][day][idx] = { 
            ...cachedData.jadwal[displayType][day][idx], 
            mapel: n, 
            time: t, 
            type: type 
        };
        
        saveDB('jadwalData', cachedData.jadwal);
        document.getElementById('scheduleEditModal').style.display = 'none';
        showToast("Jadwal Diupdate!", "success");
        renderSchedule();
    }
}

export function deleteSchedule() {
    if (!currentScheduleEdit) return;
    if(confirm("Yakin hapus jadwal ini?")) {
        const { day, idx } = currentScheduleEdit;
        let displayType = currentWeekType === 'auto' ? ((getWeekNumber(new Date()) % 2 !== 0) ? 'umum' : 'produktif') : currentWeekType;
        
        if(cachedData.jadwal && cachedData.jadwal[displayType] && cachedData.jadwal[displayType][day]) {
            cachedData.jadwal[displayType][day].splice(idx, 1);
            saveDB('jadwalData', cachedData.jadwal);
            renderSchedule();
            closeScheduleEditModal();
            showToast("Jadwal Dihapus.", "info");
        }
    }
}

export function closeScheduleEditModal() { document.getElementById('scheduleEditModal').style.display = 'none'; }

// --- CATATAN MAPEL ---
export function openMapelNote(day, idx) {
    currentNoteTarget = `${day}_${idx}`;
    const savedNote = (cachedData.scheduleNotes && cachedData.scheduleNotes[currentNoteTarget]) ? cachedData.scheduleNotes[currentNoteTarget] : "";
    
    document.getElementById('noteModalInput').value = savedNote;
    document.getElementById('noteModalTitle').innerText = "📝 Catatan Mapel";
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
    showToast("Catatan Disimpan!", "success");
}

export function deleteNote() {
    if(!currentNoteTarget) return;
    if(confirm("Hapus catatan?")) {
        if(cachedData.scheduleNotes) delete cachedData.scheduleNotes[currentNoteTarget];
        saveDB('scheduleNotes', cachedData.scheduleNotes);
        document.getElementById('noteModalInput').value = "";
        closeNoteModal();
        renderSchedule();
        showToast("Catatan Dihapus.", "info");
    }
}
export function closeNoteModal() { document.getElementById('noteModal').style.display = 'none'; currentNoteTarget = null; }