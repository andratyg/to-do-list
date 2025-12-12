// js/utils.js
import { motivationalQuotes, getCurrentUser } from './config.js';

export function showToast(m, t) { 
    const b = document.getElementById('toastBox'); 
    const d = document.createElement('div'); 
    d.className = `toast ${t}`; 
    d.innerHTML = `<i class="fas fa-${t==='success'?'check-circle':t==='info'?'bell':'exclamation-circle'}"></i> ${m}`; 
    b.appendChild(d); 
    setTimeout(()=>d.remove(), 3000); 
}

export function escapeHtml(text) { 
    if (!text) return text; 
    return String(text).replace(/[&<>"']/g, function(m) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[m]; }); 
}

export function formatDateIndo(dateString) { 
    if(!dateString) return ""; 
    return new Date(dateString).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' }); 
}

export function formatTime(s) {
    const m = Math.floor(s / 60);
    const rs = s % 60;
    return `${String(m).padStart(2, '0')}:${String(rs).padStart(2, '0')}`;
}

export function getDaysRemaining(dateString) { 
    if (!dateString) return null; 
    const target = new Date(dateString); target.setHours(0,0,0,0); 
    const today = new Date(); today.setHours(0,0,0,0); 
    return Math.ceil((target - today) / (1000 * 60 * 60 * 24)); 
}

export function getWeekNumber(d) {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    var yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
export function playSuccessSound(type = 'ding') {
    const uid = window.auth.currentUser ? window.auth.currentUser.uid : null;
    let soundPreference = 'bell';
    if(uid) soundPreference = localStorage.getItem(`${uid}_soundPreference`) || 'bell'; 

    if (soundPreference === 'silent') return;
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.connect(g);
    g.connect(audioCtx.destination);
    const now = audioCtx.currentTime;
    
    if (type === 'ding') {
        o.type = 'sine'; o.frequency.setValueAtTime(1200, now); o.frequency.exponentialRampToValueAtTime(600, now + 0.5); 
        g.gain.setValueAtTime(0.1, now); g.gain.exponentialRampToValueAtTime(0.0001, now + 0.5); 
        o.start(); o.stop(now + 0.5);
    } else if (type === 'coin') {
        o.type = 'triangle'; o.frequency.setValueAtTime(900, now);
        g.gain.setValueAtTime(0.1, now); g.gain.linearRampToValueAtTime(0.0001, now + 0.3);
        o.start(); o.stop(now + 0.3);
    } else if (type === 'bell') {
        o.type = 'sawtooth'; o.frequency.setValueAtTime(440, now);
        g.gain.setValueAtTime(0.15, now); g.gain.exponentialRampToValueAtTime(0.0001, now + 1.5);
        o.start(); o.stop(now + 1.5);
    }
}

export function updateGreeting() { 
    const h = new Date().getHours(); 
    let greet = h < 11 ? 'Selamat Pagi' : h < 15 ? 'Selamat Siang' : h < 18 ? 'Selamat Sore' : 'Selamat Malam';
    const userDisplay = getCurrentUser() || 'User';
    document.getElementById('greeting').innerHTML = `${greet}, <span class="text-gradient">${escapeHtml(userDisplay)}</span>!`; 
}

export function updateHeaderDate() { 
    document.getElementById('headerDate').innerHTML = `<i class="far fa-calendar"></i> ${new Date().toLocaleDateString('id-ID', {weekday:'long', day:'numeric', month:'long', year:'numeric'})}`; 
}

export function startClock() { 
    setInterval(() => { 
        const n=new Date(); 
        document.getElementById('clockTime').innerText=n.toLocaleTimeString('id-ID', {hour:'2-digit', minute:'2-digit'}); 
    }, 1000); 
}

export function loadRandomQuote() {
    if(document.getElementById('motivationQuote')) {
        document.getElementById('motivationQuote').innerText = `"${motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]}"`;
    }
}

export function toggleDarkMode() { 
    document.body.classList.toggle('dark-mode'); 
    const theme = document.body.classList.contains('dark-mode')?'dark':'light';
    // Kita butuh saveSetting dari db.js, tapi untuk menghindari circular dependency, kita handle di main atau simpan manual sementara/trigger event
    // Untuk simplifikasi, kita asumsikan global access atau nanti di-wire di main.
    // Solusi bersih: return theme agar caller menyimpan
    return theme;
}

export function applyTheme(theme) {
    if(theme === 'dark') document.body.classList.add('dark-mode');
    else document.body.classList.remove('dark-mode');
}

export function toggleSettings() { document.getElementById('settingsDropdown').classList.toggle('active'); }
export function selectWallet(id, el) { document.getElementById('selectedWallet').value = id; document.querySelectorAll('.wallet-card').forEach(c => c.classList.remove('active')); el.classList.add('active'); }

export function confirmClearUserData() {
    const input = document.getElementById('clearDataConfirmationInput').value;
    if (input === 'HAPUS') {
        if(confirm("Yakin hapus data lokal dan logout?")) {
            localStorage.clear();
            window.authSignOut(window.auth).then(() => location.reload());
        }
    } else {
        alert("Ketik HAPUS dengan benar untuk mengonfirmasi.");
    }
}

export function openClearDataModal() {
    document.getElementById('clearDataConfirmationInput').value = "";
    document.getElementById('clearDataModal').style.display = 'flex';
}

export function exportData(cachedData) { 
    const b=new Blob([JSON.stringify(cachedData)],{type:"application/json"}); 
    const a=document.createElement('a'); a.href=URL.createObjectURL(b); a.download=`${getCurrentUser()}_backup.json`; a.click(); 
}

export function importData(input, callback) {
    const f = input.files[0]; if (!f) return;
    const r = new FileReader();
    r.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            callback(data);
            showToast("Restored!", "success");
            setTimeout(() => location.reload(), 1000);
        } catch (err) { showToast("File rusak!", "error"); }
    };
    r.readAsText(f);
}