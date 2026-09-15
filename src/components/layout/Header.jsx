import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useData } from "../../context/DataContext";
import { useTheme } from "../../context/ThemeContext";
import { getLevelTitle, getXpNeeded, getGreeting, getFormattedDate } from "../../utils/helpers";
import { Menu, Moon, Sun, Flame, CloudSun, User } from "lucide-react";

export default function Header({ onOpenSidebar, onOpenProfileModal }) {
  const { currentUser } = useAuth();
  const { gamification, streak } = useData();
  const { isDarkMode, toggleTheme } = useTheme();

  const [timeStr, setTimeStr] = useState("00:00");
  const [weather, setWeather] = useState({ temp: "--", icon: "fas fa-cloud" });

  // Clock interval
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const h = String(now.getHours()).padStart(2, "0");
      const m = String(now.getMinutes()).padStart(2, "0");
      setTimeStr(`${h}:${m}`);
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch real-time weather from Open-Meteo
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          fetchWeather(pos.coords.latitude, pos.coords.longitude);
        },
        () => {
          // Default to Jakarta
          fetchWeather(-6.2, 106.8);
        }
      );
    } else {
      fetchWeather(-6.2, 106.8);
    }
  }, []);

  const fetchWeather = async (lat, lon) => {
    try {
      const res = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`
      );
      const data = await res.json();
      if (data?.current_weather) {
        const temp = Math.round(data.current_weather.temperature);
        setWeather({ temp: `${temp}°C`, icon: "fas fa-cloud-sun" });
      }
    } catch (e) {
      console.log("Weather fetch fallback:", e);
    }
  };

  const level = gamification?.level || 1;
  const xp = gamification?.xp || 0;
  const xpNeeded = getXpNeeded(level);
  const xpPct = Math.min(100, Math.round((xp / xpNeeded) * 100));
  const rank = getLevelTitle(level);

  return (
    <header className="header-modern">
      {/* Profile & Greeting Section */}
      <div className="header-profile-section">
        <button
          className="icon-btn-glass menu-toggle-btn"
          onClick={onOpenSidebar}
          title="Buka Menu"
        >
          <Menu size={20} />
        </button>

        <div className="avatar-container" onClick={onOpenProfileModal} title="Ganti Nama">
          <div className="avatar-hexagon">
            <User size={22} />
          </div>
          <div className="level-badge-floating">Lvl {level}</div>
        </div>

        <div className="text-info">
          <p className="mini-date">{getFormattedDate()}</p>
          <h1 className="greeting-text">
            {getGreeting(currentUser?.displayName || "Siswa")}
          </h1>
        </div>
      </div>

      {/* Gamification Stats: XP & Streak */}
      <div className="header-stats-section">
        <div className="xp-box">
          <div className="xp-info">
            <span className="xp-label">{rank}</span>
            <span className="xp-val">{xp} / {xpNeeded} XP</span>
          </div>
          <div className="xp-track">
            <div className="xp-fill" style={{ width: `${xpPct}%` }}>
              <div className="xp-glow"></div>
            </div>
          </div>
        </div>

        <div className="streak-box" title="Streak Login Berturut-turut">
          <Flame className="flame-anim" size={24} color="#f97316" />
          <div className="streak-info">
            <span className="streak-num">{streak?.count || 0}</span>
            <span className="streak-label">Streak</span>
          </div>
        </div>
      </div>

      {/* Action Section: Clock, Weather, Theme Toggle */}
      <div className="header-action-section">
        <div className="weather-widget" title="Cuaca Saat Ini">
          <CloudSun size={18} className="weather-icon-inline" />
          <span className="weather-temp">{weather.temp}</span>
        </div>

        <div className="digital-clock">
          <span>{timeStr}</span>
        </div>

        <div className="action-buttons">
          <button
            className="icon-btn-glass"
            onClick={toggleTheme}
            title={isDarkMode ? "Ganti ke Mode Terang" : "Ganti ke Mode Gelap"}
          >
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </div>
    </header>
  );
}
