export function formatRupiah(number) {
  if (number === null || number === undefined || isNaN(number)) return "Rp 0";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(number);
}

export function formatTimeSeconds(totalSeconds) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function getLevelTitle(level) {
  if (level >= 50) return "Immortal 💀";
  if (level >= 40) return "Mythic 🔮";
  if (level >= 30) return "Legend 🐉";
  if (level >= 20) return "Grandmaster ⚔️";
  if (level >= 10) return "Sepuh 👑";
  if (level >= 5) return "Bintang Kelas 🌟";
  if (level >= 2) return "Murid Teladan 📚";
  return "Murid Baru 🌱";
}

export function getXpNeeded(level) {
  return level * 100;
}

export function getGreeting(name) {
  const hour = new Date().getHours();
  let timeGreeting = "Halo";
  if (hour >= 4 && hour < 11) timeGreeting = "Selamat Pagi";
  else if (hour >= 11 && hour < 15) timeGreeting = "Selamat Siang";
  else if (hour >= 15 && hour < 18) timeGreeting = "Selamat Sore";
  else timeGreeting = "Selamat Malam";

  return `${timeGreeting}, ${name || "Siswa"}! 👋`;
}

export function getFormattedDate() {
  const options = {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  };
  return new Date().toLocaleDateString("id-ID", options);
}
