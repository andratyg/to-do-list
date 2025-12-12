// js/gamification.js
import { cachedData } from './config.js';
import { saveDB } from './db.js';
import { showToast, playSuccessSound } from './utils.js';

// --- Helper Achievements ---
const getTotalFocus = (d) => d.focusLogs ? Object.values(d.focusLogs).reduce((a, b) => a + b, 0) : 0;
const getBalance = (d) => d.transactions ? d.transactions.reduce((acc, t) => t.type === 'in' ? acc + t.amount : acc - t.amount, 0) : 0;
const getTxCount = (d) => d.transactions ? d.transactions.length : 0;
const getTaskCount = (d) => d.tasks ? d.tasks.filter(t => t.completed).length : 0;
const hasCategory = (d, cat) => d.transactions && d.transactions.some(t => t.category === cat);
const isNight = () => { const h = new Date().getHours(); return h >= 22 || h < 4; };
const isMorning = () => { const h = new Date().getHours(); return h >= 4 && h < 8; };

// DATA ACHIEVEMENTS LENGKAP
export const achievementsData = [
    // --- 1. PROGRESS & LEVEL ---
    { id: 'newbie', title: 'Murid Baru', desc: 'Login pertama kali.', icon: 'fas fa-baby', xp: 50, check: (d) => true },
    { id: 'lvl_2', title: 'Naik Kelas', desc: 'Capai Level 2.', icon: 'fas fa-arrow-up', xp: 100, check: (d) => d.gamification.level >= 2 },
    { id: 'lvl_5', title: 'Bintang Kelas', desc: 'Capai Level 5.', icon: 'fas fa-star', xp: 200, check: (d) => d.gamification.level >= 5 },
    { id: 'lvl_10', title: 'Sepuh', desc: 'Capai Level 10.', icon: 'fas fa-crown', xp: 500, check: (d) => d.gamification.level >= 10 },
    { id: 'lvl_20', title: 'Grandmaster', desc: 'Capai Level 20.', icon: 'fas fa-chess-king', xp: 1000, check: (d) => d.gamification.level >= 20 },
    { id: 'lvl_30', title: 'Legend', desc: 'Capai Level 30.', icon: 'fas fa-dragon', xp: 1500, check: (d) => d.gamification.level >= 30 },
    { id: 'lvl_40', title: 'Mythic', desc: 'Capai Level 40.', icon: 'fas fa-dungeon', xp: 2000, check: (d) => d.gamification.level >= 40 },
    { id: 'lvl_50', title: 'Immortal', desc: 'Capai Level 50.', icon: 'fas fa-skull-crossbones', xp: 5000, check: (d) => d.gamification.level >= 50 },
    { id: 'lvl_60', title: 'Godlike', desc: 'Capai Level 60.', icon: 'fas fa-bolt', xp: 6000, check: (d) => d.gamification.level >= 60 },
    { id: 'lvl_75', title: 'Overlord', desc: 'Capai Level 75.', icon: 'fas fa-globe', xp: 7500, check: (d) => d.gamification.level >= 75 },
    { id: 'lvl_100', title: 'The Chosen One', desc: 'Capai Level 100.', icon: 'fas fa-infinity', xp: 10000, check: (d) => d.gamification.level >= 100 },
    { id: 'xp_500', title: 'Pemburu XP I', desc: 'Total 500 XP.', icon: 'fas fa-scroll', xp: 100, check: (d) => d.gamification.xp >= 500 },
    { id: 'xp_1000', title: 'Pemburu XP II', desc: 'Total 1.000 XP.', icon: 'fas fa-scroll', xp: 200, check: (d) => d.gamification.xp >= 1000 },
    { id: 'xp_5000', title: 'Pemburu XP III', desc: 'Total 5.000 XP.', icon: 'fas fa-scroll', xp: 500, check: (d) => d.gamification.xp >= 5000 },
    { id: 'xp_10000', title: 'Sultan XP', desc: 'Total 10.000 XP.', icon: 'fas fa-gem', xp: 1000, check: (d) => d.gamification.xp >= 10000 },

    // --- 2. TASKS / TUGAS ---
    { id: 'task_1', title: 'Langkah Awal', desc: 'Selesaikan 1 tugas.', icon: 'fas fa-check', xp: 20, check: (d) => getTaskCount(d) >= 1 },
    { id: 'task_5', title: 'Si Rajin', desc: 'Selesaikan 5 tugas.', icon: 'fas fa-check-double', xp: 50, check: (d) => getTaskCount(d) >= 5 },
    { id: 'task_10', title: 'Produktif', desc: 'Selesaikan 10 tugas.', icon: 'fas fa-list-ol', xp: 100, check: (d) => getTaskCount(d) >= 10 },
    { id: 'task_25', title: 'Mesin Tugas', desc: 'Selesaikan 25 tugas.', icon: 'fas fa-robot', xp: 250, check: (d) => getTaskCount(d) >= 25 },
    { id: 'task_50', title: 'Workaholic', desc: 'Selesaikan 50 tugas.', icon: 'fas fa-briefcase', xp: 500, check: (d) => getTaskCount(d) >= 50 },
    { id: 'task_100', title: 'Task Master', desc: 'Selesaikan 100 tugas.', icon: 'fas fa-medal', xp: 1000, check: (d) => getTaskCount(d) >= 100 },
    { id: 'task_500', title: 'Legenda Tugas', desc: 'Selesaikan 500 tugas.', icon: 'fas fa-trophy', xp: 5000, check: (d) => getTaskCount(d) >= 500 },
    { id: 'task_clean', title: 'Inbox Zero', desc: 'Semua tugas selesai.', icon: 'fas fa-sparkles', xp: 50, check: (d) => d.tasks.length > 0 && d.tasks.filter(t => !t.completed).length === 0 },
    { id: 'task_high', title: 'Prioritas Tinggi', desc: 'Selesaikan 1 tugas Prioritas Tinggi.', icon: 'fas fa-exclamation-circle', xp: 30, check: (d) => d.tasks.some(t => t.completed && t.priority === 'High') },
    { id: 'task_3_high', title: 'Manajemen Krisis', desc: 'Selesaikan 3 tugas Prioritas Tinggi.', icon: 'fas fa-fire-extinguisher', xp: 100, check: (d) => d.tasks.filter(t => t.completed && t.priority === 'High').length >= 3 },
    { id: 'task_student', title: 'Pelajar Teladan', desc: 'Selesaikan tugas dengan kata "Belajar" atau "PR".', icon: 'fas fa-book', xp: 50, check: (d) => d.tasks.some(t => t.completed && /belajar|pr|tugas|ujian/i.test(t.text)) },
    { id: 'task_shop', title: 'Anak Belanja', desc: 'Selesaikan tugas dengan kata "Beli".', icon: 'fas fa-shopping-cart', xp: 30, check: (d) => d.tasks.some(t => t.completed && /beli|belanja/i.test(t.text)) },
    { id: 'task_deadline', title: 'Just in Time', desc: 'Selesaikan tugas tepat di hari deadline.', icon: 'fas fa-stopwatch', xp: 50, check: (d) => d.tasks.some(t => t.completed && t.date === new Date().toLocaleDateString('en-CA')) },
    { id: 'task_overdue', title: 'Better Late', desc: 'Selesaikan tugas yang sudah lewat deadline.', icon: 'fas fa-history', xp: 20, check: (d) => d.tasks.some(t => t.completed && new Date(t.date) < new Date().setHours(0,0,0,0)) },
    
    // --- 3. FOKUS / POMODORO ---
    { id: 'focus_25', title: 'Fokus Pemula', desc: 'Fokus total 25 menit.', icon: 'fas fa-clock', xp: 30, check: (d) => getTotalFocus(d) >= 25 },
    { id: 'focus_60', title: 'Satu Jam', desc: 'Fokus total 1 jam.', icon: 'fas fa-hourglass-start', xp: 60, check: (d) => getTotalFocus(d) >= 60 },
    { id: 'focus_300', title: 'Deep Work', desc: 'Fokus total 5 jam.', icon: 'fas fa-brain', xp: 300, check: (d) => getTotalFocus(d) >= 300 },
    { id: 'focus_600', title: 'Dedikasi', desc: 'Fokus total 10 jam.', icon: 'fas fa-hourglass-half', xp: 600, check: (d) => getTotalFocus(d) >= 600 },
    { id: 'focus_1500', title: 'Grindset', desc: 'Fokus total 25 jam (Sehari Penuh!).', icon: 'fas fa-calendar-day', xp: 1500, check: (d) => getTotalFocus(d) >= 1500 },
    { id: 'focus_3000', title: 'Master Fokus', desc: 'Fokus total 50 jam.', icon: 'fas fa-calendar-week', xp: 3000, check: (d) => getTotalFocus(d) >= 3000 },
    { id: 'focus_6000', title: 'Zen Mode', desc: 'Fokus total 100 jam.', icon: 'fas fa-yin-yang', xp: 5000, check: (d) => getTotalFocus(d) >= 6000 },
    { id: 'focus_exam', title: 'Mode Ujian', desc: 'Aktifkan Mode Ujian sekali.', icon: 'fas fa-graduation-cap', xp: 20, check: (d) => d.settings && d.settings.isExamMode },
    { id: 'focus_night', title: 'Night Owl', desc: 'Fokus di atas jam 10 malam.', icon: 'fas fa-moon', xp: 50, check: (d) => getTotalFocus(d) > 0 && isNight() },
    { id: 'focus_morning', title: 'Early Bird', desc: 'Fokus sebelum jam 8 pagi.', icon: 'fas fa-sun', xp: 50, check: (d) => getTotalFocus(d) > 0 && isMorning() },
    
    // --- 4. KEUANGAN ---
    { id: 'rich_100k', title: 'Tabungan Awal', desc: 'Saldo mencapai Rp 100.000.', icon: 'fas fa-coins', xp: 50, check: (d) => getBalance(d) >= 100000 },
    { id: 'rich_500k', title: 'Calon Sultan', desc: 'Saldo mencapai Rp 500.000.', icon: 'fas fa-money-bill-wave', xp: 100, check: (d) => getBalance(d) >= 500000 },
    { id: 'rich_1m', title: 'Jutawan', desc: 'Saldo mencapai Rp 1.000.000.', icon: 'fas fa-sack-dollar', xp: 200, check: (d) => getBalance(d) >= 1000000 },
    { id: 'rich_5m', title: 'High Class', desc: 'Saldo mencapai Rp 5.000.000.', icon: 'fas fa-gem', xp: 500, check: (d) => getBalance(d) >= 5000000 },
    { id: 'rich_10m', title: 'Crazy Rich', desc: 'Saldo mencapai Rp 10.000.000.', icon: 'fas fa-crown', xp: 1000, check: (d) => getBalance(d) >= 10000000 },
    { id: 'tx_1', title: 'Transaksi Pertama', desc: 'Catat 1 transaksi.', icon: 'fas fa-pen', xp: 10, check: (d) => getTxCount(d) >= 1 },
    { id: 'tx_10', title: 'Pencatat Rutin', desc: 'Catat 10 transaksi.', icon: 'fas fa-book-open', xp: 50, check: (d) => getTxCount(d) >= 10 },
    { id: 'tx_50', title: 'Akuntan', desc: 'Catat 50 transaksi.', icon: 'fas fa-calculator', xp: 250, check: (d) => getTxCount(d) >= 50 },
    { id: 'tx_100', title: 'Bendahara', desc: 'Catat 100 transaksi.', icon: 'fas fa-file-invoice-dollar', xp: 500, check: (d) => getTxCount(d) >= 100 },
    { id: 'cat_jajan', title: 'Tukang Jajan', desc: 'Catat pengeluaran kategori Jajan.', icon: 'fas fa-utensils', xp: 20, check: (d) => hasCategory(d, 'Jajan') },
    { id: 'cat_nabung', title: 'Rajin Menabung', desc: 'Catat pemasukan kategori Tabungan.', icon: 'fas fa-piggy-bank', xp: 50, check: (d) => hasCategory(d, 'Tabungan') },
    { id: 'cat_transport', title: 'Anak Motor', desc: 'Catat pengeluaran kategori Transport.', icon: 'fas fa-motorcycle', xp: 20, check: (d) => hasCategory(d, 'Transport') },
    { id: 'wallet_dana', title: 'Digital User', desc: 'Pakai dompet DANA/OVO/GOPAY.', icon: 'fas fa-mobile-alt', xp: 30, check: (d) => d.transactions && d.transactions.some(t => ['dana','ovo','gopay'].includes(t.wallet)) },
    { id: 'broke_af', title: 'Krisis Moneter', desc: 'Saldo 0 atau minus.', icon: 'fas fa-heart-broken', xp: 10, check: (d) => getBalance(d) <= 0 },
    { id: 'transfer_king', title: 'Raja Transfer', desc: 'Lakukan Transfer antar dompet.', icon: 'fas fa-exchange-alt', xp: 30, check: (d) => d.transactions && d.transactions.some(t => t.category === 'Transfer') },
    
    // --- 5. STREAK / KONSISTENSI ---
    { id: 'streak_3', title: 'Pemanasan', desc: 'Login 3 hari berturut-turut.', icon: 'fas fa-fire', xp: 30, check: (d) => d.streak.count >= 3 },
    { id: 'streak_7', title: 'On Fire!', desc: 'Login 1 minggu berturut-turut.', icon: 'fas fa-fire-alt', xp: 70, check: (d) => d.streak.count >= 7 },
    { id: 'streak_14', title: 'Dua Minggu', desc: 'Login 14 hari berturut-turut.', icon: 'fas fa-calendar-check', xp: 140, check: (d) => d.streak.count >= 14 },
    { id: 'streak_30', title: 'Sebulan Penuh', desc: 'Login 30 hari berturut-turut.', icon: 'fas fa-calendar-alt', xp: 300, check: (d) => d.streak.count >= 30 },
    { id: 'streak_60', title: 'Dua Bulan', desc: 'Login 60 hari berturut-turut.', icon: 'fas fa-medal', xp: 600, check: (d) => d.streak.count >= 60 },
    { id: 'streak_90', title: 'Tiga Bulan', desc: 'Login 90 hari berturut-turut.', icon: 'fas fa-trophy', xp: 900, check: (d) => d.streak.count >= 90 },
    { id: 'streak_100', title: 'Century Club', desc: 'Login 100 hari berturut-turut.', icon: 'fas fa-crown', xp: 1000, check: (d) => d.streak.count >= 100 },
    { id: 'streak_180', title: 'Setengah Tahun', desc: 'Login 180 hari berturut-turut.', icon: 'fas fa-star-half-alt', xp: 2000, check: (d) => d.streak.count >= 180 },
    { id: 'streak_365', title: 'Setahun Penuh', desc: 'Login 365 hari berturut-turut.', icon: 'fas fa-sun', xp: 5000, check: (d) => d.streak.count >= 365 },

    // --- 6. SCHEDULE & NOTES ---
    { id: 'custom_sched', title: 'Manager Jadwal', desc: 'Tambah jadwal manual.', icon: 'fas fa-edit', xp: 30, check: (d) => true }, 
    { id: 'note_taker', title: 'Pencatat', desc: 'Simpan catatan pada mapel.', icon: 'fas fa-sticky-note', xp: 20, check: (d) => Object.keys(d.scheduleNotes || {}).length >= 1 },
    { id: 'note_pro', title: 'Rajin Mencatat', desc: 'Simpan 5 catatan mapel.', icon: 'fas fa-book', xp: 100, check: (d) => Object.keys(d.scheduleNotes || {}).length >= 5 },
    { id: 'week_prod', title: 'Minggu Produktif', desc: 'Ganti ke Minggu Produktif.', icon: 'fas fa-briefcase', xp: 20, check: (d) => d.settings && d.settings.weekType === 'produktif' },
    { id: 'week_chill', title: 'Minggu Santai', desc: 'Ganti ke Minggu Umum.', icon: 'fas fa-coffee', xp: 20, check: (d) => d.settings && d.settings.weekType === 'umum' },
    
    // --- 7. SUBSCRIPTION & BUDGET ---
    { id: 'sub_1', title: 'Langganan', desc: 'Punya 1 langganan aktif.', icon: 'fas fa-receipt', xp: 30, check: (d) => d.subscriptions && d.subscriptions.length >= 1 },
    { id: 'sub_3', title: 'Kolektor Tagihan', desc: 'Punya 3 langganan aktif.', icon: 'fas fa-file-invoice', xp: 100, check: (d) => d.subscriptions && d.subscriptions.length >= 3 },
    { id: 'budget_set', title: 'Perencana', desc: 'Set anggaran (budget) bulanan.', icon: 'fas fa-chart-pie', xp: 50, check: (d) => d.budgets && Object.values(d.budgets).some(v => v > 0) },
    { id: 'target_saver', title: 'Punya Mimpi', desc: 'Set target tabungan.', icon: 'fas fa-bullseye', xp: 50, check: (d) => localStorage.getItem(window.auth.currentUser?.uid + '_target') > 0 },

    // --- 8. EXTRAS & FUN ---
    { id: 'dark_mode', title: 'Dark Side', desc: 'Gunakan Tema Gelap.', icon: 'fas fa-moon', xp: 20, check: (d) => document.body.classList.contains('dark-mode') },
    { id: 'sound_on', title: 'Audiophile', desc: 'Ganti suara notifikasi.', icon: 'fas fa-volume-up', xp: 20, check: (d) => localStorage.getItem(window.auth.currentUser?.uid + '_soundPreference') !== 'bell' },
    { id: 'backup_data', title: 'Safety First', desc: 'Backup data kamu.', icon: 'fas fa-download', xp: 50, check: (d) => true },
    { id: 'change_name', title: 'Rebranding', desc: 'Ganti nama panggilan.', icon: 'fas fa-id-card', xp: 50, check: (d) => true },
    { id: 'music_lover', title: 'Music Lover', desc: 'Buka widget musik.', icon: 'fas fa-music', xp: 10, check: (d) => document.getElementById('musicFrame') && !document.getElementById('musicFrame').classList.contains('hidden-music') }
];

export function getLevelTitle(level) {
    if (level >= 50) return "Immortal 💀";
    if (level >= 40) return "Mythic 🔮";
    if (level >= 30) return "Legend 🐉";
    if (level >= 20) return "Grandmaster ⚔️";
    if (level >= 10) return "Sepuh 👑";
    if (level >= 5)  return "Bintang Kelas 🌟";
    if (level >= 2)  return "Murid Teladan 📚";
    return "Murid Baru 🌱";
}

export function addXP(amount) {
    if (!cachedData.gamification) cachedData.gamification = { xp: 0, level: 1 };
    let stats = cachedData.gamification;
    stats.xp += amount;
    const xpNeeded = stats.level * 100;
    
    if (stats.xp >= xpNeeded) {
        stats.xp -= xpNeeded;
        stats.level++;
        const newTitle = getLevelTitle(stats.level);
        showToast(`🎉 LEVEL UP! Sekarang Level ${stats.level} (${newTitle})`, "success");
        playSuccessSound('bell'); 
    }
    saveDB('gamification', stats);
    updateGamificationUI();
}

export function updateGamificationUI() {
    const stats = cachedData.gamification || { xp: 0, level: 1 };
    const xpNeeded = stats.level * 100;
    const pct = Math.min((stats.xp / xpNeeded) * 100, 100);
    
    const xpBar = document.getElementById('xpBarFill'); 
    if(xpBar) xpBar.style.width = `${pct}%`;
    
    const xpText = document.getElementById('xpText');
    if(xpText) xpText.innerText = `${stats.xp} / ${xpNeeded} XP`;
    
    const userLevel = document.getElementById('userLevel');
    if(userLevel) userLevel.innerText = stats.level;
    
    const rankElement = document.getElementById('userRank');
    if(rankElement) {
        rankElement.innerText = getLevelTitle(stats.level);
    }
}

export function checkStreak() {
    const now = new Date();
    const today = now.toLocaleDateString('en-CA'); 

    if (!cachedData.streak) cachedData.streak = { count: 0, lastLogin: null };
    let streak = cachedData.streak;

    if (streak.lastLogin !== today) {
        const yesterdayDate = new Date(now);
        yesterdayDate.setDate(yesterdayDate.getDate() - 1);
        const yesterdayStr = yesterdayDate.toLocaleDateString('en-CA');

        if (streak.lastLogin === yesterdayStr) {
            streak.count++;
        } else {
            streak.count = 1;
        }
        
        streak.lastLogin = today;
        saveDB('streak', streak);
        
        setTimeout(() => {
            addXP(10); 
            showToast(`🔥 Streak Harian: ${streak.count} Hari! (+10 XP)`, "success");
            playSuccessSound('coin'); 
        }, 2500);
    }
    
    const streakBadge = document.getElementById('streakCount');
    if(streakBadge) streakBadge.innerText = streak.count;
}

export function checkAchievements() {
    if (!cachedData.unlockedAchievements) cachedData.unlockedAchievements = [];
    let newUnlock = false;

    achievementsData.forEach(ach => {
        const isUnlocked = ach.check(cachedData);
        const alreadyClaimed = cachedData.unlockedAchievements.includes(ach.id);

        if (isUnlocked && !alreadyClaimed) {
            addXP(ach.xp); 
            cachedData.unlockedAchievements.push(ach.id); 
            showToast(`🏆 Achievement: ${ach.title} (+${ach.xp} XP)`, "success");
            playSuccessSound('coin');
            newUnlock = true;
        }
    });

    if (newUnlock) {
        const uid = window.auth.currentUser.uid;
        window.dbSet(window.dbRef(window.db, `users/${uid}/unlockedAchievements`), cachedData.unlockedAchievements);
    }
}

export function openAchievementModal() {
    const listContainer = document.getElementById('achievementList');
    const badge = document.getElementById('achievelmentCountBadge');
    
    if (!cachedData.unlockedAchievements) cachedData.unlockedAchievements = [];

    listContainer.innerHTML = ''; 
    let unlockedCount = 0;

    achievementsData.forEach(ach => {
        const isUnlocked = cachedData.unlockedAchievements.includes(ach.id) || ach.check(cachedData); 
        if(isUnlocked) unlockedCount++;

        const itemClass = isUnlocked ? 'unlocked' : 'locked';
        const statusIcon = isUnlocked ? '<i class="fas fa-check-circle ach-status"></i>' : '<i class="fas fa-lock ach-status lock-icon"></i>';
        const titleColor = isUnlocked ? 'var(--primary)' : 'inherit';
        const xpBadge = `<span style="font-size:0.7rem; background:rgba(99,102,241,0.1); color:var(--primary); padding:2px 6px; border-radius:4px; margin-left:5px;">+${ach.xp} XP</span>`;

        const html = `
            <div class="ach-item ${itemClass}">
                <div class="ach-icon">
                    <i class="${ach.icon}"></i>
                </div>
                <div class="ach-info">
                    <h4 style="color:${titleColor}">${ach.title} ${xpBadge}</h4>
                    <p>${ach.desc}</p>
                </div>
                ${statusIcon}
            </div>
        `;
        listContainer.innerHTML += html;
    });

    badge.innerText = `${unlockedCount}/${achievementsData.length}`;
    document.getElementById('achievementModal').style.display = 'flex';
    
    if(document.getElementById('settingsDropdown')) {
        document.getElementById('settingsDropdown').classList.remove('active');
    }
}