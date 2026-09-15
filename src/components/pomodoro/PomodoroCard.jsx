import React, { useState, useEffect, useRef } from "react";
import { useData } from "../../context/DataContext";
import { formatTimeSeconds } from "../../utils/helpers";
import { playSuccessSound } from "../../utils/sound";
import {
  Clock,
  Play,
  Pause,
  RotateCcw,
  ShieldAlert,
  GraduationCap,
  Award,
  Sparkles,
  Coffee
} from "lucide-react";

export default function PomodoroCard() {
  const { addXP, settings, showToast } = useData();

  const [selectedDuration, setSelectedDuration] = useState(25 * 60); // 25m default
  const [breakDuration, setBreakDuration] = useState(5 * 60);
  const [isWorking, setIsWorking] = useState(true);
  const [isPaused, setIsPaused] = useState(true);
  const [isStrictMode, setIsStrictMode] = useState(false);
  const [blurCount, setBlurCount] = useState(0);

  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);

  const timerRef = useRef(null);

  // Preset selector
  const handleSelectPreset = (minutes) => {
    const secs = minutes * 60;
    setSelectedDuration(secs);
    setBreakDuration(minutes >= 50 ? 10 * 60 : 5 * 60);
    setIsPaused(true);
    setIsWorking(true);
    setTimeLeft(secs);
    showToast(`⏰ Durasi fokus diatur ke ${minutes} menit`, "info");
  };

  // Timer Tick
  useEffect(() => {
    if (!isPaused) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, isWorking, selectedDuration, breakDuration]);

  const handleTimerComplete = () => {
    playSuccessSound("bell", settings?.sound);

    if (isWorking) {
      const earnedXP = selectedDuration >= 50 * 60 ? 50 : 25;
      addXP(earnedXP);
      setSessionsCompleted((prev) => prev + 1);
      showToast(`🎯 Sesi Fokus Selesai! Selamat kamu dapat (+${earnedXP} XP)`, "success");
      setIsWorking(false);
      setTimeLeft(breakDuration);
      setIsPaused(false);
    } else {
      showToast("☕ Waktu Istirahat Selesai! Siap fokus lagi?", "info");
      setIsWorking(true);
      setTimeLeft(selectedDuration);
      setIsPaused(true);
    }
  };

  // Strict Mode Tab Blur Detection
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (isStrictMode && !isPaused && isWorking && document.hidden) {
        setBlurCount((prev) => {
          const newCount = prev + 1;
          showToast(`⚠️ Kamu berpindah tab saat mode fokus! (Pelanggaran: ${newCount}x)`, "error");
          return newCount;
        });
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [isStrictMode, isPaused, isWorking, showToast]);

  const toggleStartPause = () => {
    setIsPaused(!isPaused);
  };

  const handleReset = () => {
    setIsPaused(true);
    setTimeLeft(isWorking ? selectedDuration : breakDuration);
  };

  const totalDuration = isWorking ? selectedDuration : breakDuration;
  const progressPct = Math.round(((totalDuration - timeLeft) / totalDuration) * 100);

  return (
    <div id="pomodoro-section" className={`card pomodoro-section fade-in-up ${!isWorking ? "mode-break" : ""}`}>
      {/* Header */}
      <div className="card-header">
        <div className="title-with-icon">
          <div className="icon-box red">
            <Clock size={20} />
          </div>
          <div>
            <h3>Mode Fokus (Pomodoro)</h3>
            <p className="card-subtitle">
              {isWorking ? "Fokus belajar efektif tanpa distraksi" : "Istirahat santai sejenak"}
            </p>
          </div>
        </div>

        {/* Preset Duration Pills */}
        <div className="pomodoro-presets-bar">
          <button
            onClick={() => handleSelectPreset(15)}
            className={`preset-pill ${selectedDuration === 15 * 60 && isWorking ? "active" : ""}`}
          >
            15m
          </button>
          <button
            onClick={() => handleSelectPreset(25)}
            className={`preset-pill ${selectedDuration === 25 * 60 && isWorking ? "active" : ""}`}
          >
            25m
          </button>
          <button
            onClick={() => handleSelectPreset(50)}
            className={`preset-pill ${selectedDuration === 50 * 60 && isWorking ? "active" : ""}`}
          >
            50m (Ujian)
          </button>
        </div>
      </div>

      {/* Timer Body */}
      <div className="pomodoro-body">
        <div className="timer-circle-wrapper">
          <div className="timer-badge">
            {isWorking ? (
              <span className="badge-work">
                <Sparkles size={12} /> MODE FOKUS
              </span>
            ) : (
              <span className="badge-break">
                <Coffee size={12} /> ISTIRAHAT SANTAI
              </span>
            )}
          </div>

          <h1 className="timer-numbers">{formatTimeSeconds(timeLeft)}</h1>

          <div className="timer-progress-bar">
            <div
              className={`timer-progress-fill ${!isPaused ? "pulsing-glow" : ""}`}
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* Timer Control Buttons */}
        <div className="timer-controls">
          <button
            onClick={toggleStartPause}
            className={`btn-timer-main ${!isPaused ? "btn-pause" : "btn-play"}`}
          >
            {!isPaused ? <Pause size={18} /> : <Play size={18} />}
            <span>{!isPaused ? "Jeda Timer" : "Mulai Belajar"}</span>
          </button>

          <button onClick={handleReset} className="btn-timer-reset" title="Reset Waktu">
            <RotateCcw size={18} />
          </button>
        </div>

        {/* Footer info: Strict Mode & Completed sessions */}
        <div className="pomodoro-footer-strip">
          <label className="strict-mode-toggle" title="Memberi peringatan jika Anda meninggalkan tab saat timer berjalan">
            <input
              type="checkbox"
              checked={isStrictMode}
              onChange={(e) => setIsStrictMode(e.target.checked)}
            />
            <ShieldAlert size={15} className={isStrictMode ? "text-warning" : "text-sub"} />
            <span>Strict Focus (Anti-Alt+Tab)</span>
          </label>

          <div className="sessions-counter">
            <Award size={15} className="text-primary" />
            <span>{sessionsCompleted} Sesi Selesai</span>
          </div>
        </div>

        {isStrictMode && blurCount > 0 && (
          <p className="strict-warning-note">
            ⚠️ Terdeteksi {blurCount} kali meninggalkan tab ini saat timer berjalan!
          </p>
        )}
      </div>
    </div>
  );
}
