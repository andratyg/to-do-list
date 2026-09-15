import React, { useState, useEffect } from "react";
import motivationalQuotes from "../../data/quotes";
import { Quote, Sparkles, RefreshCw } from "lucide-react";

export default function QuoteBanner() {
  const [currentQuote, setCurrentQuote] = useState("");

  const getRandomQuote = () => {
    if (!motivationalQuotes || motivationalQuotes.length === 0) {
      return "Fokus 25 menit, hasilnya 100%. Kamu bisa! 💪";
    }
    const idx = Math.floor(Math.random() * motivationalQuotes.length);
    return motivationalQuotes[idx];
  };

  useEffect(() => {
    setCurrentQuote(getRandomQuote());
  }, []);

  const handleRefresh = () => {
    setCurrentQuote(getRandomQuote());
  };

  return (
    <div className="quote-modern fade-in-up">
      <div className="quote-icon">
        <Quote size={20} />
      </div>
      <div className="quote-text-wrapper">
        <p className="quote-text">"{currentQuote}"</p>
      </div>
      <button
        onClick={handleRefresh}
        className="quote-refresh-btn"
        title="Ganti Motivasi"
      >
        <RefreshCw size={15} />
      </button>
      <div className="quote-deco">
        <Sparkles size={18} color="#eab308" />
      </div>
    </div>
  );
}
