// js/db.js
import { cachedData, defaultJadwalData, setCurrentUser } from './config.js';
import { checkAchievements } from './gamification.js'; 
import { applyTheme } from './utils.js';

export function saveDB(key, data) {
    if (!window.auth.currentUser) return;
    const uid = window.auth.currentUser.uid;
    
    if(key === 'tasks') cachedData.tasks = data;
    if(key === 'transactions') cachedData.transactions = data;
    if(key === 'gamification') cachedData.gamification = data;
    if(key === 'streak') cachedData.streak = data;
    if(key === 'focusLogs') cachedData.focusLogs = data;
    if(key === 'scheduleNotes') cachedData.scheduleNotes = data;
    if(key === 'unlockedAchievements') cachedData.unlockedAchievements = data;
    if(key === 'jadwalData') { cachedData.jadwal = data; } 
    if(key === 'budgets') cachedData.budgets = data;
    if(key === 'subscriptions') cachedData.subscriptions = data;

    // Save to Firebase (window.dbSet from HTML)
    return window.dbSet(window.dbRef(window.db, `users/${uid}/${key}`), data)
        .then(() => { checkAchievements(); }) // Call checkAchievements after save
        .catch(err => console.error("Save Error:", err));
}

export function saveSetting(key, val) { 
    const uid = window.auth.currentUser.uid; 
    window.dbSet(window.dbRef(window.db, `users/${uid}/settings/${key}`), val); 
}

export function saveAllToCloud(dataToSave) {
    const data = dataToSave || cachedData;
    const uid = window.auth.currentUser ? window.auth.currentUser.uid : null;
    if(uid) window.dbSet(window.dbRef(window.db, `users/${uid}`), data);
}

export function startFirebaseListener(uid, renderCallback, checkStreakCallback) {
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
            cachedData.unlockedAchievements = data.unlockedAchievements || [];
            cachedData.budgets = data.budgets || {};
            cachedData.subscriptions = data.subscriptions || [];

            if (data.jadwal && data.jadwal.umum) {
                cachedData.jadwal = data.jadwal;
            } else { 
                cachedData.jadwal = defaultJadwalData; 
                saveDB('jadwalData', defaultJadwalData); 
            }

            if(data.settings) {
                if(data.settings.theme) applyTheme(data.settings.theme);
                if(data.settings.weekType) cachedData.settings.weekType = data.settings.weekType; // Sync setting
                if(data.settings.target) localStorage.setItem(`${uid}_target`, data.settings.target);
                if(data.settings.isExamMode) cachedData.settings.isExamMode = data.settings.isExamMode;
            }

            // Callback untuk cek streak (butuh logika di gamification.js)
            if(checkStreakCallback) checkStreakCallback();

        } else {
            cachedData.jadwal = defaultJadwalData;
            saveAllToCloud(uid); 
        }
        
        // Render UI
        if(renderCallback) renderCallback();
    });
}