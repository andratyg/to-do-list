import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Mail, Lock, User, LogIn, UserPlus, AlertCircle } from "lucide-react";

export default function AuthModal() {
  const { login, register, loginWithGoogle } = useAuth();

  const [mode, setMode] = useState("login"); // "login" | "register"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        if (!username.trim()) {
          throw new Error("Mohon masukkan nama panggilan kamu!");
        }
        if (password.length < 6) {
          throw new Error("Password minimal 6 karakter!");
        }
        await register(email, password, username.trim());
      }
    } catch (err) {
      console.error(err);
      let msg = err.message;
      if (err.code === "auth/invalid-credential" || err.code === "auth/wrong-password") {
        msg = "Email atau password yang Anda masukkan salah!";
      } else if (err.code === "auth/email-already-in-use") {
        msg = "Email ini sudah terdaftar! Silakan login.";
      } else if (err.code === "auth/weak-password") {
        msg = "Password terlalu lemah, buat minimal 6 karakter.";
      } else if (err.code === "auth/invalid-email") {
        msg = "Format email tidak valid!";
      }
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setErrorMsg("");
    setLoading(true);
    try {
      await loginWithGoogle();
    } catch (err) {
      console.error(err);
      if (err.code !== "auth/popup-closed-by-user") {
        setErrorMsg("Gagal login dengan Google: " + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="background-shapes" />
      <div className="login-card fade-in-up">
        {mode === "login" ? (
          <div className="auth-view">
            <div className="login-header">
              <div className="icon-pulse">👋</div>
              <h1>Selamat Datang</h1>
              <p>Masuk ke Student Workspace Pro</p>
            </div>

            <form onSubmit={handleEmailAuth} className="login-form">
              <div className="input-group">
                <Mail size={18} className="input-icon" />
                <input
                  type="email"
                  placeholder="Email Siswa"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="input-group">
                <Lock size={18} className="input-icon" />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {errorMsg && (
                <div className="auth-error-box">
                  <AlertCircle size={16} />
                  <span>{errorMsg}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-primary glow btn-block"
              >
                {loading ? "Memproses..." : "Masuk"} <LogIn size={16} />
              </button>

              <div className="divider">
                <span>ATAU</span>
              </div>

              <button
                type="button"
                onClick={handleGoogleAuth}
                disabled={loading}
                className="btn-google"
              >
                <img
                  src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                  alt="Google"
                />
                Masuk dengan Google
              </button>

              <p className="auth-switch">
                Belum punya akun?{" "}
                <a onClick={() => { setMode("register"); setErrorMsg(""); }}>
                  Daftar Sekarang
                </a>
              </p>
            </form>
          </div>
        ) : (
          <div className="auth-view">
            <div className="login-header">
              <div className="icon-pulse">🚀</div>
              <h1>Buat Akun Baru</h1>
              <p>Mulai perjalanan produktifmu hari ini</p>
            </div>

            <form onSubmit={handleEmailAuth} className="login-form">
              <div className="input-group">
                <User size={18} className="input-icon" />
                <input
                  type="text"
                  placeholder="Nama Panggilan Kamu"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>

              <div className="input-group">
                <Mail size={18} className="input-icon" />
                <input
                  type="email"
                  placeholder="Email Aktif"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="input-group">
                <Lock size={18} className="input-icon" />
                <input
                  type="password"
                  placeholder="Password (Min. 6 Karakter)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {errorMsg && (
                <div className="auth-error-box">
                  <AlertCircle size={16} />
                  <span>{errorMsg}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-primary glow btn-block"
              >
                {loading ? "Mendaftarkan..." : "Daftar Akun"} <UserPlus size={16} />
              </button>

              <p className="auth-switch">
                Sudah punya akun?{" "}
                <a onClick={() => { setMode("login"); setErrorMsg(""); }}>
                  Login di sini
                </a>
              </p>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
