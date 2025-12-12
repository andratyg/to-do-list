// js/auth.js
import { setCurrentUser, cachedData } from './config.js';
import { showToast, updateGreeting } from './utils.js';

export function initAuthListener(onLoginSuccess) {
    setTimeout(() => {
        if (!window.authListener) return;

        window.authListener(window.auth, (user) => {
            if (user) {
                let rawName = user.displayName || user.email.split('@')[0];
                const displayName = rawName.replace(/[0-9]/g, '').replace(/^\s+|\s+$/g, ''); 
                
                setCurrentUser(displayName);
                const uid = user.uid; 
                
                document.getElementById('loginOverlay').style.display = 'none';
                document.getElementById('mainContent').style.display = 'block';
                
                document.getElementById('displayUsername').innerText = displayName; 
                updateGreeting(); 
                document.getElementById('loginStatusText').innerText = "Online";
                
                if(onLoginSuccess) onLoginSuccess(uid);
            } else {
                setCurrentUser(null);
                document.getElementById('loginOverlay').style.display = 'flex';
                document.getElementById('mainContent').style.display = 'none';
            }
        });
    }, 1000);
}

export function switchAuthMode(mode) {
    const loginView = document.getElementById('loginView');
    const registerView = document.getElementById('registerView');
    if (mode === 'register') { loginView.style.display = 'none'; registerView.style.display = 'block'; }
    else { loginView.style.display = 'block'; registerView.style.display = 'none'; }
}

export function handleLogin() {
    const email = document.getElementById('loginEmail').value;
    const pass = document.getElementById('loginPass').value;
    if(!email || !pass) { document.getElementById('authErrorMsg').innerText = "Isi email dan password!"; return; }
    window.authSignIn(window.auth, email, pass).catch((e) => { document.getElementById('authErrorMsg').innerText = "Gagal: Email/Password salah."; });
}

export function handleGoogleLogin() { 
    window.authSignInGoogle(window.auth, window.googleProvider).then(res => showToast(`Masuk: ${res.user.displayName}`, "success")).catch(e => console.error(e)); 
}

export function handleRegister() {
    const u = document.getElementById('regUsername').value; const e = document.getElementById('regEmail').value; const p = document.getElementById('regPass').value;
    if(!u || !e || !p) return alert("Lengkapi data!");
    window.authSignUp(window.auth, e, p).then(c => { window.authUpdateProfile(c.user, { displayName: u }).then(() => location.reload()); }).catch(e => alert(e.message));
}

export function logoutUser() { if(confirm("Keluar?")) window.authSignOut(window.auth).then(() => location.reload()); }

export function editUsername() { 
    const u = window.auth.currentUser; 
    if(u) { 
        document.getElementById('newUsernameInput').value = u.displayName || ""; 
        document.getElementById('usernameModal').style.display = 'flex'; 
    } 
}

export function saveUsername() { 
    const n = document.getElementById('newUsernameInput').value.trim(); 
    if(n) window.authUpdateProfile(window.auth.currentUser, { displayName: n }).then(() => { 
        document.getElementById('displayUsername').innerText = n; 
        updateGreeting(); 
        document.getElementById('usernameModal').style.display = 'none'; 
    }); 
}