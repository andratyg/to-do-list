// ==================== SYSTEM & CONFIG ===================
// --- SISTEM KONFIRMASI MODERN ---
let confirmCallback = null;

function showCustomConfirm(message, callback) {
  document.getElementById("confirmMessage").innerText = message;
  document.getElementById("customConfirmModal").style.display = "flex";
  confirmCallback = callback;

  // Setup tombol 'Ya'
  const btnYes = document.getElementById("btnConfirmAction");
  btnYes.onclick = function () {
    if (confirmCallback) confirmCallback();
    closeCustomConfirm();
  };
}

function closeCustomConfirm() {
  document.getElementById("customConfirmModal").style.display = "none";
  confirmCallback = null;
}

// Expose ke global agar bisa dipanggil di HTML/onclick
window.showCustomConfirm = showCustomConfirm;
window.closeCustomConfirm = closeCustomConfirm;
let currentUser = null; // UID User

// Wadah Data Lokal
let cachedData = {
  tasks: [],
  transactions: [],
  stickyNote: "",
  jadwal: null,
  settings: {},
  gamification: { xp: 0, level: 1 },
  streak: { count: 0, lastLogin: null },
  focusLogs: {},
  scheduleNotes: {},
  unlockedAchievements: [],
  subscriptions: [], // TAMBAHKAN INI
  budgets: {},
};

// --- CONFIG LAINNYA ---
const WORK_DURATION_DEFAULT = 25 * 60;
const BREAK_DURATION_DEFAULT = 5 * 60;
const WORK_DURATION_EXAM = 50 * 60;
const BREAK_DURATION_EXAM = 10 * 60;

let timerInterval = null;
let isPaused = true;
let isWorking = true;
let timeLeft = WORK_DURATION_DEFAULT;

let lastTransaction = null;
let isExamMode = false;
let soundPreference = "bell";
let currentScheduleFilterGuru = "all";
let currentScheduleFilterCategory = "all";

// --- VARIABEL KONTROL FOKUS ---
let isFocusLocked = false;
let isTabBlurred = false;
let blurCount = 0;
let savedFocusTime = null;
let savedBreakTime = null;
let focusType = "strict";

// --- VARIABEL FITUR BARU ---
let currentNoteTarget = null;
let dragSrcEl = null;

// --- DATA JADWAL DEFAULT ---
const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
const defaultJadwalData = {
  umum: {
    Senin: [
      {
        mapel: "Koding & AI",
        guru: "Juliana Mansur, S.Kom",
        time: "08.20 - 09.40",
        type: "produktif",
      },
      {
        mapel: "PAI & Budi Pekerti",
        guru: "Hapid, S.Ag",
        time: "10.00 - 11.20",
        type: "umum",
      },
      {
        mapel: "Matematika",
        guru: "Wijiastuti, S.Pd",
        time: "11.20 - 13.20",
        type: "umum",
      },
    ],
    Selasa: [
      {
        mapel: "KOKURIKULER",
        guru: "Nurulia Aprilia, S.Si",
        time: "08.00 - 15.50",
        type: "kokurikuler",
      },
    ],
    Rabu: [
      {
        mapel: "Bahasa Indonesia",
        guru: "Lia Siti Sholehah, S.Pd",
        time: "08.00 - 09.20",
        type: "umum",
      },
    ],
    Kamis: [
      {
        mapel: "Sejarah",
        guru: "Yessy Novita D, S.Pd",
        time: "08.00 - 09.20",
        type: "umum",
      },
    ],
    Jumat: [
      {
        mapel: "Koding & AI",
        guru: "Juliana Mansur, S.Kom",
        time: "07.45 - 09.05",
        type: "produktif",
      },
    ],
  },
  produktif: {
    Senin: [
      { mapel: "DDPK (Juliana)", time: "08.20 - 09.40", type: "produktif" },
    ],
    Selasa: [
      {
        mapel: "Projek IPAS",
        guru: "Nurulia Aprilia, S.Si",
        time: "08.00 - 11.40",
        type: "umum",
      },
    ],
    Rabu: [
      {
        mapel: "Informatika",
        guru: "Nurdin",
        time: "08.00 - 09.20",
        type: "produktif",
      },
    ],
    Kamis: [
      {
        mapel: "DDPK (Full Day)",
        guru: "Iqbal Fajar Syahbana",
        time: "08.00 - 15.50",
        type: "produktif",
      },
    ],
    Jumat: [{ mapel: "DDPK (Duma)", time: "07.45 - 10.25", type: "produktif" }],
  },
};

let jadwalData = defaultJadwalData;
let currentDayIdx = new Date().getDay();
let currentWeekType = "umum";
let taskFilter = "all";
let editingTaskId = null;

// ==================== QUOTES ====================
const motivationalQuotes = [
  // --- MOTIVASI BELAJAR ---
  "Fokus 25 menit, hasilnya 100%. Kamu bisa! 💪",
  "Masa depanmu diciptakan oleh apa yang kamu lakukan hari ini, bukan besok.",
  "Jangan berhenti saat lelah, berhentilah saat selesai.",
  "Rasa sakit karena disiplin lebih baik daripada rasa sakit karena penyesalan.",
  "Satu jam belajar hari ini lebih berharga dari seribu jam penyesalan nanti.",
  "Versi terbaik dirimu sedang menunggumu di masa depan. Jemput dia!",
  "Kalau mimpimu tidak membuatmu takut, mungkin mimpimu kurang besar.",
  "Belajar itu memang berat, tapi kebodohan itu jauh lebih berat.",
  "Jadilah 1% lebih baik setiap harinya. Konsistensi > Intensitas.",
  "Jangan tunggu motivasi, ciptakan momentummu sendiri.",
  // --- PENGINGAT DISIPLIN ---
  "Scroll sosmed tidak akan membayarmu di masa depan.",
  "Tugas yang kamu tunda hari ini akan menjadi beban di esok hari.",
  "Sukses adalah jumlah dari usaha kecil yang diulang hari demi hari.",
  "Berhenti berharap, mulai kerjakan.",
  "Waktu tidak akan menunggu. Lakukan sekarang atau tidak sama sekali.",
  "Disiplin adalah melakukan apa yang harus dilakukan, bahkan saat kamu tidak ingin.",
  "Fokus pada proses, bukan hanya pada hasil.",
  "Jangan sibuk, tapi jadilah produktif.",
  "Musuh terbesarmu adalah dirimu yang kemarin.",
  "Keajaiban terjadi saat kamu keluar dari zona nyaman.",
  // --- KATA-KATA SANTAI & REALISTIS ---
  "Tarik napas. Kamu sudah melakukan yang terbaik sejauh ini. 🍃",
  "Ingat minum air putih. Otak butuh cairan biar nggak nge-lag.",
  "Istirahat itu bagian dari produktivitas. Jangan lupa tidur.",
  "Gapapa pelan-pelan, yang penting jalan terus.",
  "Hari ini sulit? Gapapa, besok kita coba lagi.",
  "Kamu lebih kuat dari deadline-mu. 🔥",
  "Jangan lupa apresiasi diri sendiri setelah tugas selesai.",
  "Rejeki nggak akan ketuker, tapi kalau nggak usaha ya nggak dapet.",
  "Hidup itu seperti koding; kalau error, coba cek lagi baris demi baris.",
  "Semangat! Cicilan masa depan (dan harapan orang tua) menanti.",
  // --- STOIC & MENTALITAS ---
  "Kita tidak bisa mengendalikan angin, tapi kita bisa mengendalikan layar.",
  "Fokus pada apa yang bisa kamu kendalikan.",
  "Kesulitan seringkali mempersiapkan orang biasa untuk takdir yang luar biasa.",
  "Jadilah seperti karang, tidak goyah meski dihantam ombak.",
  "Kebahagiaan bergantung pada dirimu sendiri.",
  // --- SHORT & PUNCHY ---
  "Gas terus! 🚀",
  "Just do it.",
  "Make it happen.",
  "Dream big, work hard.",
  "Stay hungry, stay foolish.",
  "Your only limit is you.",
  "Wake up and grind.",
  "Do it with passion or not at all.",
  "Action speaks louder.",
  "Finish what you started.",

  "Gas terus! Jangan kasih kendor! 🔥",
  "Mode serius: ON. Bantai semua tugas! 💪",
  "Tarik napas, minum air, lalu hajar! 🚀",
  "Jangan lembek! Masa depan butuh kamu yang kuat.",
  "Fokus 25 menit, hasilnya 100%. Let's go!",
  "Capek itu sementara, menyerah itu selamanya.",
  "Bangun! Mimpimu nggak bisa diraih sambil tidur.",
  "Kerjakan sekarang atau menyesal nanti.",
  "Buktikan kalau mereka salah menilai kamu.",
  "Jadilah versi terbaik dirimu hari ini.",
  "Sakit dalam perjuangan itu sementara.",
  "Jangan berhenti saat lelah, berhenti saat selesai.",
  "Kamu lebih kuat dari alasanmu untuk menyerah.",
  "Selesaikan apa yang sudah kamu mulai.",
  "Waktu tidak menunggu. Bergerak sekarang!",
  "Hari ini sulit? Besok kamu akan lebih kuat.",
  "Jadikan ragu-ragu sebagai musuhmu.",
  "Konsistensi adalah kunci. Tetap jalan!",
  "Jangan banyak mikir, banyakin aksi.",
  "Sukses butuh proses, bukan protes.",
  "Hajar tugasnya, nikmati hasilnya.",
  "Lemah itu pilihan, kuat itu keputusan.",
  "Jemput suksesmu, jangan tunggu dia datang.",
  "Keringat hari ini, senyum di masa depan.",
  "Lakukan dengan passion atau tidak sama sekali.",

  // 💎 MOTIVASI (WISDOM & DISIPLIN)
  "Satu jam belajar hari ini = investasi masa depan.",
  "Disiplin adalah jembatan antara tujuan dan pencapaian.",
  "Jangan bandingkan prosesmu dengan orang lain.",
  "Usaha tidak akan mengkhianati hasil. Percaya itu.",
  "Masa depanmu diciptakan oleh apa yang kamu lakukan hari ini.",
  "Belajar itu berat, tapi kebodohan lebih berat.",
  "Kalau mimpimu tidak membuatmu takut, itu kurang besar.",
  "Jadilah 1% lebih baik setiap harinya.",
  "Kesalahan adalah bukti kamu sedang mencoba.",
  "Sukses adalah jumlah dari usaha kecil yang diulang.",
  "Musuh terbesarmu adalah dirimu yang kemarin.",
  "Fokus pada proses, hasil akan mengikuti.",
  "Jangan sibuk, tapi jadilah produktif.",
  "Keajaiban terjadi di luar zona nyaman.",
  "Pendidikan adalah senjata paling mematikan.",
  "Investasi terbaik adalah leher ke atas (ilmu).",
  "Jangan menunggu motivasi, ciptakan disiplin.",
  "Bermimpilah besar, bekerja keraslah.",
  "Waktu adalah aset yang tidak bisa diputar ulang.",
  "Jadilah seperti karang, tak goyah dihantam ombak.",
  "Kebahagiaan bergantung pada dirimu sendiri.",
  "Hidup itu seperti koding, kalau error cek lagi.",
  "Prioritas menentukan kualitas hidupmu.",
  "Jangan takut gagal, takutlah tidak mencoba.",

  // 🥀 SAD & CAPEK (VALIDASI PERASAAN)
  "Nangis sebentar nggak apa-apa, habis itu bangkit lagi. 🌧️",
  "Gapapa pelan-pelan, yang penting nggak mundur. 🫂",
  "Hari ini berat ya? Kamu hebat sudah bertahan.",
  "Peluk jauh buat kamu yang lagi capek tapi tetap berusaha.",
  "Istirahatlah, jangan berhenti.",
  "Dunia kadang jahat, tapi kamu harus tetap baik.",
  "Tarik napas. Ini cuma satu hari yang buruk, bukan kehidupan yang buruk.",
  "Kadang 'oke' untuk tidak merasa 'oke'.",
  "Hati boleh patah, tapi mimpi jangan sampai kalah.",
  "Sendirian bukan berarti kesepian. Itu waktu untuk tumbuh.",
  "Lelah fisik bisa tidur, lelah hati butuh waktu.",
  "Gapapa kalau belum sampai, yang penting masih jalan.",
  "Menangis itu tanda kamu manusia, bukan tanda lemah.",
  "Badai pasti berlalu, pelangi menunggu.",
  "Maafkan dirimu yang kemarin, dia sudah berusaha.",
  "Jangan terlalu keras pada dirimu sendiri.",
  "Simpan sedihmu, tunjukkan senyummu.",
  "Setiap luka punya cerita, dan setiap cerita mendewasakan.",
  "Gelap malam akan berganti terang pagi.",
  "Kamu berharga, jangan biarkan siapapun meragukannya.",

  // 💔 GAMON (GALAU & CINTA)
  "Balas dendam terbaik adalah menjadi sukses. 😎",
  "Stop stalking, start studying. Upgrade dirimu!",
  "Dia masa lalu, kesuksesan adalah masa depan. Pilih mana?",
  "Jangan biarkan galau menghancurkan nilaimu. Rugi!",
  "Buktikan kamu bisa bahagia dan sukses tanpa dia.",
  "Jodoh pasti bertemu, tapi tugas harus selesai dulu.",
  "Fokus ke karir, cinta yang berkelas akan datang.",
  "Jangan nangisin orang yang lagi ketawa sama orang lain.",
  "Cinta boleh gagal, tapi studi harus final.",
  "Jadikan patah hati bahan bakar prestasimu.",
  "Dia nggak mikirin kamu, kenapa kamu mikirin dia?",
  "Move on itu proses, nikmati saja sambil belajar.",
  "Mantan itu alumni hati, sudah lulus jangan daftar lagi.",
  "Lebih baik capek belajar daripada capek berharap.",
  "Tunjukkan versi terbaikmu sampai dia menyesal.",
  "Cinta diri sendiri sebelum mencintai orang lain.",
  "Jangan turunkan standarmu, naikkan kualitasmu.",
  "Galau secukupnya, produktif selebihnya.",
  "Hati butuh waktu, otak butuh ilmu.",
  "Jomblo itu free trial masa depan sukses.",

  // 🌈 SENANG (HAPPY & BERSYUKUR)
  "Senyum dulu! Dunia butuh energi positifmu hari ini. ✨",
  "Hari ini indah, tugas lancar, rejeki aman. Alhamdulillah.",
  "Good mood = Good productivity. Yuk nikmati!",
  "Hidup lagi asik-asiknya. Jangan lupa bersyukur! 🥳",
  "Kamu keren banget hari ini! Pertahankan vibes-nya.",
  "Rejeki nggak akan ketuker, santai saja.",
  "Nikmati hal-hal kecil hari ini.",
  "Bahagia itu sederhana, tugas selesai contohnya.",
  "Terima kasih diriku, sudah berjuang sejauh ini.",
  "Energi positif menarik hasil positif.",
  "Hari ini adalah hadiah, makanya disebut Present.",
  "Tersenyumlah, itu ibadah termudah.",
  "Rayakan setiap kemenangan kecil.",
  "Hidup terlalu singkat untuk mengeluh.",
  "Bersyukur adalah magnet keajaiban.",
  "Semesta mendukungmu hari ini.",
  "Jadilah matahari bagi orang lain.",
  "Mood bagus, kerjaan beres, hati senang.",
  "Makan enak, tidur nyenyak, tugas kelar.",
  "Kamu adalah alasan seseorang tersenyum hari ini.",

  // ✨ RANDOM & LUCU (BONUS)
  "Ingat, cicilan masa depan menanti. Kerja! 💸",
  "Rebahan tidak akan membuatmu kaya.",
  "Otak butuh asupan, bukan cuma harapan.",
  "Jangan jadi beban keluarga, jadilah tulang punggung.",
  "Skincare mahal, makanya harus sukses.",
  "Belajar itu capek, tapi miskin lebih capek.",
  "Gas terus, rem blong!",
  "Pura-pura sibuk sampai beneran sukses.",
  "Ingat kata tukang parkir: Mundur, mundur (kalau nyerah).",
  "Tugas ini tidak seberat rindu, kok.",
  "Dompet tebal adalah motivasi terbaik.",
  "Jangan lupa napas, jangan lupa tugas.",
  "Wifi lancar, tugas harus kelar.",
  "Tetap ilmu padi abangkuh! 🌾",
  "Menyala tugasku! 🔥",

  // 🔥 MODE HYPE & AMBIS (PEMBAKAR SEMANGAT)
  "Jangan kasih kendor! Dunia nggak nungguin kamu siap.",
  "Capek? Istirahat. Nyerah? Bukan opsi.",
  "Buktikan kalau omongan mereka salah besar.",
  "Mimpimu terlalu mahal untuk diraih dengan rebahan.",
  "Gaspol! Rem blong! Tabrak semua tantangan!",
  "Hari ini berjuang, besok jadi pemenang.",
  "Kalau orang lain bisa, kamu harusnya lebih bisa.",
  "Jangan jadi rata-rata, jadilah luar biasa.",
  "Waktu terus berjalan, jangan mau ketinggalan.",
  "Fokus pada tujuan, bukan pada hambatan.",
  "Keringatmu hari ini adalah senyummu di masa depan.",
  "Jadilah singa, jangan mau jadi domba.",
  "Sukses itu balas dendam yang paling elegan.",
  "Bangun tidur, kejar mimpi, ulangi.",
  "Mental baja, hati sutra, rejeki lancar.",
  "Jangan banyak alasan, banyakin pembuktian.",
  "Tugas numpuk? Selesaikan satu per satu, bukan dipikirin doang.",
  "Disiplin itu berat, tapi penyesalan jauh lebih berat.",
  "Jadilah versi dirimu yang bikin mantan nyesel.",
  "Hajar terus sampai sukses jadi kebiasaan.",

  // 💡 WISDOM & NASEHAT (LEBIH BIJAK)
  "Ilmu adalah harta yang nggak bakal dicuri orang.",
  "Padi semakin berisi semakin merunduk. Tetap rendah hati.",
  "Proses tidak pernah mengkhianati hasil, sabar ya.",
  "Investasi terbaik adalah leher ke atas (belajar).",
  "Jangan takut salah, takutlah kalau nggak pernah nyoba.",
  "Kesuksesan adalah kumpulan kebiasaan kecil yang diulang.",
  "Hidup itu 10% kejadian, 90% respon kita.",
  "Bekerjalah dalam diam, biarkan kesuksesan yang berisik.",
  "Kualitas diri menentukan kualitas hidup.",
  "Jangan bandingkan bab 1-mu dengan bab 10 orang lain.",
  "Gagal itu bumbu kehidupan, sukses itu hidangan utamanya.",
  "Jadilah solusi, bukan polusi.",
  "Waktu adalah uang, tapi uang nggak bisa beli waktu.",
  "Sopan santun adalah mata uang yang berlaku di mana saja.",
  "Belajar bukan untuk ujian, tapi untuk kehidupan.",
  "Jangan menunggu sempurna untuk memulai.",
  "Jarak antara mimpi dan kenyataan adalah tindakan.",
  "Keberuntungan adalah pertemuan antara persiapan dan kesempatan.",
  "Hidup cuma sekali, buatlah berarti.",
  "Jadilah orang yang dirindukan, bukan yang dihindari.",

  // 🥀 GALAU & HEALING (VALIDASI EMOSI)
  "Nggak semua hari harus cerah, hujan pun punya peran.",
  "Gapapa nggak oke hari ini, besok kita coba lagi.",
  "Peluk diri sendiri, kamu sudah bertahan sejauh ini.",
  "Kadang menangis itu cara mata berbicara saat mulut terdiam.",
  "Istirahatlah, jiwamu juga butuh jeda.",
  "Jangan terlalu keras sama diri sendiri, kamu manusia bukan robot.",
  "Luka hari ini adalah kekuatan di masa depan.",
  "Tarik napas dalam-dalam, hembuskan bebanmu.",
  "Semua akan baik-baik saja, mungkin tidak sekarang, tapi nanti.",
  "Terima kasih sudah kuat sampai detik ini.",
  "Sendiri itu tenang, bukan berarti kesepian.",
  "Sembuhkan lukamu sebelum mencintai orang lain.",
  "Langit mendung bukan berarti akan hujan selamanya.",
  "Kadang melepaskan adalah cara terbaik untuk bertahan.",
  "Maafkan masa lalumu, dia sudah berlalu.",
  "Jangan pendam sendiri, bicaralah pada Tuhan atau sahabat.",
  "Kamu berhak bahagia, ingat itu.",
  "Gapapa jalan pelan, kura-kura pun sampai garis finish.",
  "Jatuh 7 kali, bangkit 8 kali.",
  "Hati yang hancur adalah celah bagi cahaya untuk masuk.",

  // 💔 GAMON & MOVE ON (ANTI GALAU CLUB)
  "Dia cuma satu bab dalam bukumu, bukan judul bukunya.",
  "Jangan stalking! Hatimu butuh proteksi.",
  "Mantan itu masa lalu, masa depanmu masih suci.",
  "Buang kenangannya, ambil pelajarannya.",
  "Jodoh orang lain jangan dipikirin terus.",
  "Cinta yang tepat nggak akan bikin kamu memelas.",
  "Fokus karir dulu, cinta berkelas akan mengikuti.",
  "Jangan nangisin orang yang lagi ketawa bareng orang lain.",
  "Upgrade diri biar dapet spek dewa/dewi.",
  "Logika harus jalan kalau hati mulai ugal-ugalan.",
  "Kamu terlalu berharga buat jadi opsi kedua.",
  "Putus cinta bukan akhir dunia, tapi awal kebebasan.",
  "Jomblo itu status, bahagia itu pilihan.",
  "Tuhan mematahkan hatimu untuk menyelamatkan jiwamu.",
  "Block kontaknya, buka lembaran baru.",
  "Rejeki nggak akan ketuker, apalagi jodoh.",
  "Dia rugi kehilanganmu, kamu untung kehilangan dia.",
  "Jangan turunkan standarmu karena kesepian.",
  "Cinta diri sendiri adalah cinta yang paling awet.",
  "Move on itu tanda kedewasaan.",

  // 🌈 SENANG & BERSYUKUR (POSITIVE VIBES)
  "Alhamdulillah, masih bisa napas gratis hari ini.",
  "Senyummu adalah sedekah termudah.",
  "Nikmati kopi/tehmu, hidup itu indah.",
  "Hari ini penuh berkah, yuk semangat!",
  "Energi positif menarik hal-hal positif.",
  "Bahagia itu sederhana, sesederhana tugas kelar.",
  "Terima kasih Tuhan untuk hari yang cerah ini.",
  "Kamu adalah alasan seseorang tersenyum hari ini.",
  "Rejeki hari ini: Sehat, waras, dan kenyang.",
  "Jadilah matahari yang menyinari sekitarmu.",
  "Good vibes only! 🌈",
  "Rayakan kemenangan kecilmu hari ini.",
  "Hidup itu asik kalau kita pandai bersyukur.",
  "Tebarkan kebaikan, tuai kebahagiaan.",
  "Kamu istimewa, jangan lupa itu.",
  "Mood bagus = Rejeki bagus.",
  "Fokus pada hal-hal baik.",
  "Syukuri apa yang ada, semangat untuk yang belum ada.",
  "Setiap detik adalah anugerah.",
  "Hidup ini indah, jangan dibuat rumit.",

  // 🤣 RANDOM & LUCU (PEMECIT TAWA)
  "Kerja keraslah sampai tetanggamu kira kamu pesugihan.",
  "Dompet kosong adalah motivasi terkuat.",
  "Jangan lupa napas, nanti mati.",
  "Rebahan sebentar, sukses kemudian (tapi boong).",
  "Hidup seperti Larry 🦞",
  "Mending turu daripada mumet.",
  "Tugas ini disponsori oleh air mata dan kopi instan.",
  "Ingat, cicilan nggak bisa dibayar pakai 'Terima Kasih'.",
  "Mau kaya tapi males? Mimpi!",
  "Kalau capek, coba lihat saldo ATM.",
  "Jodoh nggak ke mana, saingannya yang di mana-mana.",
  "Tetap ilmu padi: Semakin berisi, semakin merunduk (kalau ngantuk).",
  "Jangan jadi beban keluarga, minimal cuci piring sendiri.",
  "Skincare mahal woy, semangat kerjanya!",
  "Belajar itu berat, tapi lebih berat ngangkat beban hidup.",

  // 🔥 SEMANGAT & GRIND (KERJA KERAS)
  "Diam itu emas, tapi sukses itu berlian. Gas!",
  "Jangan mau kalah sama ayam, dia bangun pagi terus.",
  "Mimpimu nggak butuh penonton, butuhnya pemain.",
  "Kalau capek lari, jalan. Kalau capek jalan, merangkak. Jangan berhenti.",
  "Hasil tidak pernah berkhianat pada yang berkeringat.",
  "Jadilah bukti berjalan bahwa usaha itu nyata.",
  "Dunia ini keras, makanya kamu harus lebih keras.",
  "Tunda kesenanganmu sekarang, nikmati kemewahan nanti.",
  "Fokus! Notifikasi HP nggak bikin kamu kaya.",
  "Jadilah pemenang di ceritamu sendiri.",
  "Kerja keras sampai idola kamu jadi saingan kamu.",
  "Jangan kasih ruang buat rasa malas.",
  "Setiap detik yang kamu buang adalah keuntungan buat sainganmu.",
  "Bantai tugasnya sekarang, rebahan dengan tenang nanti.",
  "Mental juara itu dibentuk, bukan dilahirkan.",
  "Jangan cuma jadi penikmat, jadilah pencipta.",
  "Kalau jalannya mudah, mungkin kamu salah jalan.",
  "Kesuksesan ada di seberang tembok rasa takut.",
  "Berani bermimpi, berani eksekusi.",
  "Tugas numpuk? Itu tanda kamu sedang naik level.",

  // 💡 WISDOM & DEEP (BIJAKSANA)
  "Pohon yang tinggi anginnya pasti kencang. Sabar.",
  "Bukan seberapa cepat, tapi seberapa konsisten.",
  "Ilmu padi: Semakin berisi, semakin rendah hati.",
  "Jangan menilai buku dari sampulnya, bacalah isinya.",
  "Sabar itu ilmu tingkat tinggi, belajarnya setiap hari.",
  "Kejujuran adalah mata uang yang berlaku di mana saja.",
  "Hidup itu seni menggambar tanpa penghapus.",
  "Jangan menjelaskan dirimu pada orang yang tidak mau mengerti.",
  "Diam adalah jawaban terbaik untuk orang bodoh.",
  "Waktu akan menjawab apa yang tidak bisa dijawab logika.",
  "Lidahmu jangan kamu biarkan menyebut kekurangan orang lain.",
  "Kebaikan yang kamu tanam akan kamu tuai suatu hari nanti.",
  "Belajar mengalah sampai tak seorang pun bisa mengalahkanmu.",
  "Harta yang paling berharga adalah ketenangan hati.",
  "Jadilah seperti air, lembut tapi bisa memecah batu.",
  "Orang kuat bukan yang bisa membanting lawan, tapi yang bisa menahan amarah.",
  "Balaslah keburukan dengan kebaikan, itu kelas.",
  "Pendidikan bukan persiapan hidup, pendidikan adalah hidup itu sendiri.",
  "Jangan takut berjalan lambat, takutlah jika hanya berdiri diam.",
  "Pengalaman adalah guru yang paling sadis, ujian dulu baru pelajaran.",

  // 🥀 SAD VIBES (LAGI CAPEK)
  "Hujan di luar reda, hujan di mata kapan?",
  "Gapapa, hari ini kamu bertahan saja itu sudah prestasi.",
  "Kadang rumah bukan tempat pulang yang paling nyaman.",
  "Tarik selimut, lupakan dunia sejenak. Kamu butuh jeda.",
  "Terlalu banyak memikirkan perasaan orang lain sampai lupa diri sendiri.",
  "Lukanya nggak berdarah, tapi sakitnya sampai ke tulang.",
  "Menangislah, air mata itu doa saat mulut tak sanggup bicara.",
  "Sedang berada di fase 'yasudahlah' untuk segalanya.",
  "Ternyata pura-pura bahagia itu melelahkan ya.",
  "Malam adalah teman bagi mereka yang memendam rasa.",
  "Semoga hatimu segera membaik dari hal yang tak kau ceritakan.",
  "Kadang sepi itu menenangkan, tapi seringkali mencekam.",
  "Aku memaafkanmu, tapi aku tidak melupakan rasanya.",
  "Berlari dari kenyataan hanya akan membuatmu lelah di tempat.",
  "Langit tak selamanya abu-abu, sabar ya.",
  "Tidur adalah pelarian terbaik dari isi kepala yang berisik.",
  "Gapapa kalau nggak dapet validasi orang lain.",
  "Kamu berhak bilang 'nggak' kalau memang nggak sanggup.",
  "Lelah itu manusiawi, istirahatlah.",
  "Besok pagi, matahari akan terbit lagi. Kamu juga harus bangkit.",

  // 💔 GAMON & GALAU (EDISI MANTAN)
  "Cie yang masih stalking padahal udah diblokir.",
  "Kenangan itu kayak hantu, muncul pas lagi sendirian.",
  "Dia udah bahagia sama yang lain, kamu kapan?",
  "Move on itu bukan melupakan, tapi mengikhlaskan.",
  "Jangan cari dia di masa depan, dia tertinggal di masa lalu.",
  "Rindu yang tak tersampaikan akan jadi penyakit.",
  "Cinta boleh, bodoh jangan. Logika dipakai woy!",
  "Dia cuma singgah, bukan sungguh.",
  "Berhenti nunggu chat dari orang yang prioritasin orang lain.",
  "Mantan itu kayak sampah, jangan dipungut lagi.",
  "Lebih baik sendiri daripada berdua tapi kesepian.",
  "Tuhan memisahkan karena dia bukan yang terbaik buatmu.",
  "Fokus skripsi/kerjaan, jodoh di tangan Tuhan (dan usaha).",
  "Jangan jadi badut di kisah cinta orang lain.",
  "Cintailah orang yang mencintaimu, bukan yang menyakitimu.",
  "Hati-hati, rindu bisa bikin kamu chat duluan. Tahan!",
  "Dia happy story, kamu sad story. Nggak level.",
  "Upgrade diri biar dapet yang premium.",
  "Putus cinta satu, tumbuh seribu (masalah lain). Canda.",
  "Jomblo itu bukan nasib, itu prinsip (padahal nggak laku).",

  // 🌈 HAPPY & GRATEFUL (GOOD MOOD)
  "Wih, hari ini cakep banget! Semangat!",
  "Alhamdulillah, rejeki anak sholeh/sholehah.",
  "Senyum itu gratis, tapi efeknya mahal.",
  "Hari ini makan enak yuk, self-reward!",
  "Kamu adalah alasan seseorang bersyukur hari ini.",
  "Energi positifmu nular banget, pertahankan!",
  "Bahagia itu diciptakan, bukan dicari.",
  "Tugas kelar, hati mekar. Asik!",
  "Nikmati prosesnya, syukuri hasilnya.",
  "Dunia butuh senyum manismu.",
  "Rejeki hari ini: Internet lancar dan kopi enak.",
  "Jadilah pelangi di awan mendung orang lain.",
  "Hidup itu indah kalau kita nggak kebanyakan mikir.",
  "Semesta lagi berpihak padamu hari ini.",
  "Jangan lupa bahagia, itu kewajiban.",
  "Mood booster terbaik adalah saldo bertambah.",
  "Bersyukur bikin hidup terasa cukup.",
  "Ayo tertawa, biar awet muda.",
  "Kamu unik, kamu spesial, kamu berharga.",
  "Makan kenyang, hati senang, pikiran tenang.",

  // 🤣 RANDOM & RECEH (HIBURAN)
  "Kerja, kerja, kerja! Tipes.",
  "Duit nggak dibawa mati, tapi kalau nggak ada duit rasanya mau mati.",
  "Motivasi hari ini: Cicilan Paylater.", // Duplikasi di atas. Dibiarkan.
  "Mending rakit PC daripada rakit rumah tangga.",
  "Hidup itu seperti roda, kadang di atas, kadang diinjek.",
  "Jangan lupa napas, oksigen masih gratis.", // Duplikasi di atas. Dibiarkan.
  "Dompet menipis, harapan menipis, tapi perut tetep eksis.",
  "Kalau ada yang nyari, bilang aku lagi nyari duit.",
  "Rebahan adalah passion, sukses adalah obsession.",
  "Info loker: Jaga lilin, gaji UMR.",
  "Belajar itu perlu, tapi tidur itu candu.",
  "Manusia boleh berencana, saldo yang menentukan.", // Duplikasi di bawah. Dibiarkan.
  "Tetaplah hidup walau tidak berguna (eh berguna kok!).",
  "Kata dokter kurangin manis, makanya aku jangan ngaca terus.",
  "Otak: Belajar! Hati: Main HP! Mata: Tidur!",
  "Pura-pura kaya itu butuh modal gede.",
  "Masa depan cerah, secerah jidat saya.",
  "Capek kerja? Coba jadi rafathar.",
  "Hidup dibawa santai aja, kalau dibawa lari capek.",
  "Semangat! Ingat kuota internet makin mahal.",

  // 💸 REALITA & CUAN (JURUS BIAR GAK MALAS)
  "Ingat, check-out keranjang oren butuh dana, bukan cuma doa.",
  "Mau healing tapi dompet kering? Kerja dulu bestie.",
  "Jadilah kaya biar kalau sedih bisa nangis di Paris, bukan di pojokan kamar.",
  "Motivasi terbesar: Biar nggak dipandang sebelah mata sama tetangga.",
  "Rebahan itu enak, tapi punya duit sendiri itu lebih enak.",
  "Jangan nunggu mood, mood nggak bakal bayarin tagihanmu.",
  "Mimpi setinggi langit, tapi kalau males ya tetep napak tanah.",
  "Kerja keraslah sampai harga barang nggak jadi masalah.",
  "Kalau kamu berhenti sekarang, sainganmu bakal tepuk tangan.",
  "Ingat wajah orang tuamu, mereka layak dapat menantu sukses (eh, anak sukses).",
  "Duit bukan segalanya, tapi segalanya butuh duit. Fakta.",
  "Jangan jadi beban negara, minimal jangan jadi beban orang tua.",
  "Gaya elit, ekonomi sulit? Jangan sampai kejadian.",
  "Sukses itu wajib, biar kalau reuni nggak minder.",
  "Ayo bangun! Rejeki dipatok ayam kalau kesiangan (klise tapi bener).",
  "Tabungan masa depan nggak akan keisi sendiri.",
  "Mau traktir ortu makan enak kan? Yuk semangat!",
  "Fokus! Biar nanti bisa beli rumah cash, aamiin.",
  "Jangan sampai gaya hidupmu lebih tinggi dari kemampuanmu.",
  "Kesuksesanmu adalah tamparan terbaik buat yang pernah ngeremehin.",

  // 🧘 HEALING & SELF-CARE (PELUK JAUH)
  "Gapapa istirahat, baterai HP aja perlu dicas, apalagi kamu.",
  "Tarik napas... Masalah hari ini cukup untuk hari ini.",
  "Jangan lupa makan, lambungmu nggak sekuat mentalmu.",
  "Kamu udah keren banget lho bisa bertahan sampai hari ini.",
  "Dunia nggak akan runtuh cuma karena kamu salah dikit.",
  "Tidur yang cukup, mata pandamu butuh pertolongan.",
  "Minum air putih, biar ginjal aman, pikiran tenang.",
  "Nggak usah dengerin orang lain, mereka nggak bayarin hidupmu.",
  "Pelan-pelan asal kelakon. Nggak usah lari kalau kaki sakit.",
  "Sayangi dirimu sendiri sebelum berharap disayang orang lain.",
  "Kadang 'bodo amat' itu perlu demi kewarasan mental.",
  "Kamu cukup. Kamu berharga. Kamu bisa.",
  "Jangan overthinking, yang kamu takutin belum tentu kejadian.",
  "Hujan pasti reda, capek pasti ada obatnya.",
  "Kalau hari ini gagal, besok masih ada matahari terbit.",
  "Fisik boleh lelah, tapi harapan jangan sampai punah.",
  "Rayakan dirimu sekecil apapun progresnya.",
  "Jaga kesehatan, sakit itu mahal jendral!",
  "Luangkan waktu buat hobi, biar nggak stres melulu.",
  "Kamu berhak bilang 'tidak' kalau memang nggak mau.",

  // 💔 ANTI GALAU & LOGIKA (NO MORE DRAMA)
  "Dia udah update story sama yang lain, kamu masih pantengin profilnya?",
  "Jatuh cinta boleh, bodoh jangan. Pakai logikanya.",
  "Mending sibuk ngejar karir daripada ngejar orang yang nggak mau dikejar.",
  "Stop jadi badut buat orang yang cuma anggep kamu penonton.",
  "Kalau dia jodohmu, dia nggak akan bikin kamu ngemis perhatian.",
  "Prioritaskan yang memprioritaskanmu. Titik.",
  "Hapus chat-nya, arsip kenangannya, fokus ke depan.",
  "Kamu terlalu 'mahal' buat orang yang sukanya diskonan.",
  "Jomblo berkualitas lebih baik daripada pacaran makan hati.",
  "Cinta itu bonus, sukses itu harus.",
  "Jangan biarkan satu orang merusak masa depanmu.",
  "Mantan itu spion, sesekali dilirik boleh, tapi jangan dipelototin terus (nabrak!).",
  "Kebahagiaanmu bukan tanggung jawab pacar, tapi tanggung jawabmu.",
  "Semesta memisahkan karena kamu layak dapat yang lebih baik.",
  "Udah, nggak usah kode-kodean di story. Dia nggak peka.",
  "Investasi ke diri sendiri nggak akan pernah rugi, beda sama investasi ke doi.",
  "Fokus upgrade diri, nanti yang berkualitas bakal antri.",
  "Jangan buang air matamu buat orang yang nggak tau nilaimu.",
  "Sendiri itu bebas, bisa ngapain aja tanpa laporan.",
  "Hati-hati, kesepian sering bikin salah pilih orang.",

  // 🤪 JOKES RECEH & SARKAS (BIAR NYENGIR)
  "Hidup itu berat, yang ringan itu dosa.",
  "Kalau ada masalah, selesaikan. Kalau nggak bisa, tinggalkan tidur.",
  "Manusia merencanakan, saldo ATM yang menentukan.", // Duplikasi. Dibiarkan.
  "Kerja lah, emang mau nunggu warisan? Kalau ada sih enak.",
  "Jangan lupa senyum hari ini, biar yang iri makin panas.",
  "Tetaplah hidup walau beban hidup seberat gajah duduk.",
  "Motivasiku hari ini: Takut dimarahin emak.",
  "Mending ketinggalan mantan daripada ketinggalan diskon.",
  "Definisi dewasa: Banyak cicilan tapi tetap ketawa.",
  "Otak: 'Ayo produktif!', Badan: 'Kasur posesif banget nih'.",
  "Belajar itu emang bikin pusing, tapi kalau nggak belajar bikin pusing orang tua.",
  "Cita-cita jadi miliarder, hobi check-out barang nggak penting.",
  "Semangat! Ingat kuota internet nggak gratis.",
  "Kalau capek, inget ada orang yang nunggu kamu gagal. Jangan kasih kepuasan!",
  "Dompet makin tipis, harapan makin kritis, ayo optimis!",
  "Jangan kebanyakan mimpi, nanti tidurnya kebablasan.",
  "Hidup emang banyak cobaan, kalau banyak cucian itu laundry.",
  "Tetap santuy walau deadline menghantui.",
  "Uang nggak dibawa mati, tapi kalau nggak punya uang rasanya mau mati.",
  "Sabar itu ada batasnya, kalau nggak ada batasnya itu laut.",

  // 🔨 SARKAS & TAMPARAN KERAS (BIAR SADAR)
  "Mimpi doang, gerak kagak. Situ patung pancoran?",
  "Scroll TikTok 3 jam kuat, belajar 30 menit langsung bengek.",
  "Sainganmu lagi upgrade skill, kamu masih sibuk upgrade skin game.",
  "Jangan ngeluh capek kalau dari pagi cuma pindah posisi tidur.",
  "Mau sukses jalur instan? Mi instan aja perlu direbus dulu, Bestie.",
  "Kurangi gaya, banyakin karya. Dompetmu menangis tuh.",
  "Stop halu! Pangeran berkuda putih nggak bakal jemput orang yang belum mandi.",
  "Motivasi terbesar: Sadar diri bukan anak Sultan, jadi harus kerja keras.",
  "Rebahan tidak akan mengubah nasib, cuma mengubah bentuk badan.",
  "Jangan nunggu mood bagus, emangnya mood bisa bayar tagihan?", // Duplikasi. Dibiarkan.
  "Mental yupi (lembek) jangan harap dapet gaji besi.",
  "Kalau malas, jangan punya mimpi tinggi-tinggi. Nanti jatuh, sakit.",
  "Hidup itu keras, yang lunak cuma pipi kamu.",
  "Udah gede, masa masih jadi beban keluarga? Minimal cuci piring lah.",
  "Dunia nggak butuh alasanmu, dunia butuh hasil kerjamu.",
  "Gaya elit, ekonomi sulit. Tobat yuk bisa yuk.",
  "Jangan kebanyakan drama, hidupmu bukan sinetron indosiar.",
  "Fokus woy! Mantan udah mau nikah, kamu masih gini-gini aja?",
  "Sukses itu aksi, bukan cuma update status 'Bismillah' doang.",
  "Ingat, kuota internet nggak dibayar pakai daun.",

  // 🎓 AKADEMIK & KERJA (PEJUANG DEADLINE)
  "Deadline lebih seram daripada hantu, kerjain sekarang!",
  "Revisi adalah jalan ninjaku menuju kesuksesan (dan kebotakan).",
  "Skripsi/Tugas itu dikerjain, bukan diratapi tiap malam.",
  "Dosen/Bos nggak butuh 'maaf', butuhnya file dikirim.",
  "SKS: Sistem Kebut Semalam (Jangan ditiru, tapi seru sih).",
  "Otak: 'Ayo produktif!', Mata: '5 menit lagi ya tidurnya'.",
  "Wisuda/Gajian masih lama, tapi semangat harus ada sekarang.",
  "Nilai jelek bisa diperbaiki, tapi waktu yang hilang nggak bisa diganti.",
  "Jangan jadi mahasiswa kupu-kupu (kuliah pulang), jadilah kura-kura (kuliah rapat).",
  "Laptop udah nyala, tapi yang dibuka malah Youtube. Hayo ngaku!",
  "Ingat wajah orang tua pas bayar UKT/SPP. Masih tega malas?",
  "Kerja cerdas, bukan cuma kerja keras (biar nggak tipes).",
  "Presentasi besok? Tenang, panik aja dulu.",
  "Tugas numpuk itu seni, seni menahan emosi.",
  "Kalau error, jangan banting laptop. Cicilannya belum lunas.",

  // 😫 CAPEK DEWASA (ADULTING IS A TRAP)
  "Dewasa itu jebakan batman, isinya tagihan semua.",
  "Punggung encok adalah lambang kedewasaan sejati.",
  "Ingin kembali ke masa TK, beban terberat cuma PR mewarnai.",
  "Tidur adalah cuti singkat dari kejamnya dunia.",
  "Gaji cuma numpang lewat kayak iklan Youtube.",
  "Capek? Sama. Tapi kalau berhenti, siapa yang kasih makan kucing?",
  "Hidup lagi capek-capeknya, eh sampo habis, sabun habis.",
  "Definisi kaya: Check-out belanjaan tanpa mikir tanggal tua.",
  "Kadang pengen jadi batu aja, diam dan nggak punya cicilan.",
  "Manusia merencanakan, saldo ATM yang menentukan.", // Duplikasi. Dibiarkan.
  "Healing terbaik adalah transferan masuk.",
  "Pulang kerja pengennya disambut uang kaget, bukan cucian piring.",
  "Dewasa itu harus pinter akting: Pura-pura kuat, pura-pura punya duit.",
  "Liburan itu mitos, lembur itu fakta.",
  "Tetaplah bernapas walau rasanya sesak napas lihat pengeluaran.",

  // 🤡 RECEH & RANDOM (HIBURAN SINGKAT)
  "Hidup itu kayak angkot, ngetem mulu kapan jalannya?",
  "Jadilah seperti martabak: Spesial dan manis (tapi jangan dikacangin).",
  "Kalau ada yang nyariin, bilang aku lagi nyari wangsit.",
  "Tetap santuy walau dunia sedang tidak yoi.",
  "Motivasi hari ini: Pengen beli Seblak prasmanan bebas ambil.",
  "Jangan lupa napas, oksigen masih gratis (belum dipajakin).", // Duplikasi. Dibiarkan.
  "Mending turu (tidur) daripada tahu kenyataan.",
  "Dompet makin tipis, perut makin eksis. Hukum alam.",
  "Kalau jodoh nggak ke mana, tapi saingannya yang di mana-mana.", // Duplikasi. Dibiarkan.
  "Hidup berjalan seperti roda, kadang di atas, kadang bannya bocor.",
  "Kata dokter kurangin manis, makanya aku jarang ngaca.", // Duplikasi. Dibiarkan.
  "Masa depan cerah, secerah jidat saya kena lampu.",
  "Tetap ilmu padi: Semakin berisi, semakin merunduk (karena ngantuk).", // Duplikasi. Dibiarkan.
  "Jomblo itu prinsip. Prinsip belum laku.", // Duplikasi. Dibiarkan.
  "Semangat! Ingat, kamu belum punya pulau pribadi.",

  // 📱 MEDIA SOSIAL VS REALITA (ANTI INSECURE)
  "Jangan bandingkan 'Behind The Scene' hidupmu dengan 'Highlight' orang lain.",
  "Rumput tetangga lebih hijau karena dia pakai filter Instagram.",
  "Scroll TikTok boleh, tapi ingat jam dinding terus berputar.",
  "Dia sukses di umur 20? Keren. Kamu sukses di umur 30? Juga keren. Tiap orang punya zonanya.",
  "Berhenti stalking kehidupan orang yang nggak peduli sama kamu.",
  "HP canggih, kuota banyak, masa dompet kosong? Gunakan buat cuan!",
  "Likes di sosmed nggak bisa ditukar beras, fokus di dunia nyata.",
  "Jangan jadi penonton kesuksesan orang lain, mulailah syuting filmmu sendiri.",
  "Dunia maya itu panggung sandiwara, dunia nyata tempat kita bekerja.",
  "Matikan HP, nyalakan mimpi. Kerjakan tugasmu.",
  "FOMO (Fear Of Missing Out) itu penyakit dompet dan mental.",
  "Postingan bahagia belum tentu aslinya bahagia. Jangan iri.",
  "Jadilah influencer buat diri sendiri dulu sebelum influence orang lain.",
  "Notifikasi terbaik adalah notifikasi transferan masuk.",
  "Filter wajah boleh, tapi hati jangan diedit-edit.",

  // 🛌 KAUM REBAHAN TAPI AMBIS (SOLUSI MAGER)
  "Rebahan itu enak, tapi punya uang sendiri itu candu.",
  "Kasur emang posesif, tapi masa depanmu lebih agresif menuntut.",
  "Mau sukses jalur langit? Doa kenceng, usaha juga harus kenceng bestie.",
  "Cita-cita jadi CEO, hobi menunda pekerjaan. Lawak lu.",
  "Jangan sampai tuamu nanti cuma cerita 'Dulu aku sebenarnya bisa, tapi males'.",
  "Bangun! Rejeki nggak bakal ngetuk pintu kamar kalau kamu kunci dari dalam.",
  "Kalau malas, ingatlah harga tiket konser idola makin mahal.",
  "Sukses butuh konsistensi, bukan cuma motivasi pas lagi mood.",
  "Mending capek kerja sekarang daripada capek nyari lowongan nanti.",
  "Bergeraklah walau cuma satu inci, daripada diam jadi patung.",
  "Setan aja rajin ngegoda, masa manusia malas berusaha?",
  "Otak encer kalau nggak dipakai bakal beku juga.",
  "Tugas ini kecil, kemalasanmu yang membuatnya terlihat raksasa.",
  "Ayo produktif! Biar bisa pamer pencapaian, bukan pamer keluhan.",
  "Jatah gagalmu harus dihabiskan selagi muda, biar tua tinggal panen.",

  // ☕ KOPI & LOGIKA (PEMIKIRAN DEWASA)
  "Hidup itu murah, gengsi yang bikin mahal.",
  "Dewasa itu ketika kamu lebih milih tidur daripada nongkrong nggak jelas.",
  "Jangan menua tanpa arti, menualah dengan karya.",
  "Teman banyak itu asik, tapi teman yang ada pas susah itu langka.",
  "Lingkunganmu mempengaruhi masa depanmu. Pilih circle yang sehat.",
  "Uang bukan segalanya, tapi segalanya jadi ribet tanpa uang.",
  "Investasi leher ke atas (ilmu) return-nya seumur hidup.",
  "Jangan kerja keras cari muka, kerja keraslah cari nafkah.",
  "Sopan santun adalah kecantikan yang tidak akan tua.",
  "Janji manis orang lain seringkali mengandung diabetes (penyakit hati).",
  "Berhentilah menyalahkan keadaan, mulailah ciptakan peluang.",
  "Kadang kita harus tega sama diri sendiri biar bisa maju.",
  "Waktu adalah hakim yang paling adil.",
  "Jangan takut beda, takutlah kalau sama terus kayak orang lain.",
  "Keputusanmu hari ini menentukan siapa kamu 5 tahun lagi.",

  // 🎭 SARKAS RECEH (HIBURAN DI KALA STRES)
  "Hidup lagi capek-capeknya, eh ada yang ngajak MLM.",
  "Motivasi hari ini: Ingin beli rumah biar nggak diusir mertua (canda).",
  "Manusia boleh berencana, tapi saldo ATM kadang bercanda.",
  "Sabar itu ada batasnya, kalau nggak ada batasnya itu jalan tol.",
  "Ingin hati memeluk gunung, apa daya tangan masih megang HP.",
  "Mending turu, timbang mumet mikirin negara.",
  "Diet mulai besok (wacana abadi).",
  "Kalau ada yang ngomongin di belakang, kentutin aja.",
  "Dompetku seperti bawang, dibuka bikin nangis.",
  "Kerja bagai kuda, digaji kayak kura-kura. Semangat!",
  "Jangan lupa napas, oksigen masih gratis belum dipajakin.",
  "Tetaplah hidup walau cuma jadi beban (eh jangan dong).",
  "Cermin ajaib, katakan siapa yang paling rajin? (Bukan aku).",
  "Jodoh emang di tangan Tuhan, tapi kalau nggak diambil ya di tangan orang.",
  "Pura-pura bahagia itu butuh tenaga, mending makan.",

  // 🚫 ANTI WACANA (STOP NGOMONG DOANG)
  "Rencana liburan mulu, realisasi nol. Situ travel agent?",
  "Wacana adalah doa yang tertunda karena kemalasan.",
  "Jangan kebanyakan 'nanti dulu', nanti taunya udah tua.",
  "Sukses itu butuh aksi, bukan cuma update story 'Bismillah'.",
  "Mimpi boleh setinggi langit, tapi kalau kaki nggak gerak, ya tetep di bumi.",
  "Kurangi rapat (rapatkan barisan rebahan), perbanyak eksekusi.",
  "Ide 1 Miliar, Eksekusi 1 Rupiah. Rugi dong!",
  "Janji pada diri sendiri aja diingkari, apalagi janji ke orang lain.",
  "Diet mulai besok, belajar mulai lusa, suksesnya di akhirat?",
  "Jangan bangga jadi 'Idea Man' kalau nggak pernah jadi 'Action Man'.",
  "Tugas nggak akan selesai dengan dipandangi.",
  "Mending gagal pas nyoba, daripada nyesel nggak pernah nyoba.",
  "Stop bilang 'aku nggak bisa' sebelum nyoba minimal 5 kali.",
  "Rumus sukses: Mulai aja dulu, sempurnakan sambil jalan.",
  "Motivasi tanpa aksi itu cuma halusinasi.",

  // 👥 PERTEMANAN & SOCIAL LIFE (QUALITY OVER QUANTITY)
  "Teman itu ada masa kadaluarsanya, nggak usah kaget kalau ada yang pergi.",
  "Hati-hati curhat, screenshoot jahat berkeliaran.",
  "Circle kecil nggak masalah, yang penting isinya daging semua (berkualitas).",
  "Jangan jadi 'People Pleaser', kamu bukan badut ulang tahun.",
  "Teman yang baik itu yang ngajak sukses, bukan cuma ngajak nongkrong.",
  "Kalau dia cuma dateng pas butuh, kasih aja peta ke dinas sosial.",
  "Berhenti menyeberangi lautan buat orang yang nggak mau melompati genangan buat kamu.",
  "Dewasa itu sadar kalau nggak semua orang harus suka sama kita.",
  "Mending dimusuhi karena jujur, daripada disukai karena munafik.",
  "Jaga rahasiamu, bahkan bayanganmu meninggalkanmu saat gelap.",
  "Lingkungan toksik lebih bahaya dari limbah nuklir. Menjauhlah.",
  "Jangan takut kehilangan teman, takutlah kehilangan jati diri.",
  "Sahabat sejati itu langka, kalau nemu dijaga, jangan dipinjemin duit melulu.",
  "Filter temanmu seperti kamu filter foto Instagram.",
  "Sendiri lebih baik daripada dikelilingi orang yang bikin mental down.",

  // 🛡️ MENTAL HEALTH & BOUNDARIES (JAGA DIRI)
  "Bilang 'Nggak' itu hak asasi, jangan merasa bersalah.",
  "Kesehatan mentalmu lebih penting dari deadline (tapi deadline tetep dikerjain ya).",
  "Validasi terbaik datang dari cermin, bukan dari likes.",
  "Jangan bakar dirimu cuma buat ngangetin orang lain.",
  "Marah boleh, dendam jangan. Nanti keriput.",
  "Overthinking cuma bikin masalah yang sebenernya nggak ada.",
  "Maafkan diri sendiri karena pernah membiarkan orang lain menyakitimu.",
  "Istirahatlah sebelum tubuhmu memaksamu istirahat (sakit).",
  "Bahagia itu tanggung jawab masing-masing, jangan nitip ke orang lain.",
  "Hidup nggak harus selalu estetik, yang penting asik.",
  "Kadang obat terbaik adalah tidur 8 jam tanpa alarm.",
  "Jangan biarkan komentar 5 detik merusak mood 24 jam-mu.",
  "Kamu berhak menjauh dari apa pun yang bikin ribet.",
  "Damai itu mahal, jangan ditukar sama drama murah.",
  "Fokus pada apa yang bisa kamu kendalikan (pikiranmu), bukan cuaca atau omongan tetangga.",

  // ❤️ CINTA YANG REALISTIS (LOGIKA ON)
  "Cinta itu buta, tapi tagihan listrik tetep harus dibaca.",
  "Jangan cari yang sempurna, cari yang mau berjuang bareng (dan punya visi).",
  "Kalau dia serius, dia bakal cari jalan. Kalau main-main, dia cari alasan.",
  "Trauma masa lalu bukan alasan buat nyakitin orang baru.",
  "Pasangan itu partner, bukan ATM berjalan atau pembantu.",
  "Komunikasi adalah kunci, kode-kodean itu buat pramuka.",
  "Cinta tak harus memiliki, tapi harus menghidupi (minimal jajan bakso).",
  "Setia itu mahal, makanya nggak bisa dilakukan orang murahan.",
  "Jangan nikah karena kesepian, nikahlah karena kesiapan.",
  "Jomblo fisabilillah, menanti jodoh yang lillah.",
  "Hati-hati, kenyamanan sesaat bisa jadi jebakan seumur hidup.",
  "Cinta produk dalam negeri, cintai dirimu sendiri.",
  "Mending jomblo berkelas daripada pacaran berkualitas rendah.",
  "Jodoh itu cerminan diri. Mau dapet yang baik? Jadilah baik dulu.",
  "Move on jalur prestasi, biar mantan nyesel sampai ke ulu hati.",

  // 🤪 JOKES BAPAK-BAPAK & ABSURD (HIHIHI)
  "Sayur apa yang jago nyanyi? Kolplay.",
  "Orang sibuk belum tentu kaya, bisa jadi sibuk nyari pinjeman.",
  "Motivasi hari ini: Ingin kaya biar bisa beli omongan tetangga.",
  "Kenapa zombie kalau nyerang bareng-bareng? Karena kalau sendiri namanya zomblo.",
  "Dompetku sama bawang merah sama aja, bikin nangis.",
  "Tadi mau nabung, eh ada bakso lewat. Ya udah, nabung lemak dulu.",
  "Hidup itu seperti angry birds, kalau gagal ada aja babi yang ketawa.",
  "Jangan lupa sarapan, karena sarapan lebih enak dari harapan.",
  "Cita-cita kurus, hobi ngemil. Lawak.",
  "Kalau ada masalah, senyumin aja. Biar masalahnya bingung.",
  "Uang tidak bisa membeli kebahagiaan, tapi bisa beli nasi padang (sama aja).",
  "Mending telat nikah daripada telat angkat jemuran (kehujanan).",
  "Kerja keraslah sampai kamu nggak perlu liat harga pas beli kerupuk.",
  "Hidup itu pilihan. Mau mandi sekarang atau nanti sore?",
  "Semangat! Cicilan panci belum lunas.",
];

const funWords = [
  "Menyala Abangkuh! 🔥",
  "Gacor Parah! 🦅",
  "Kelas Pejabat! 🎩",
  "Savage! ⚔️",
  "Ez Lemon Squeezy 🍋",
  "Mantap Jiwa! 👻",
  "GG Gaming! 🎮",
  "Auto Kaya! 💸",
  "Mulus Banget 🧈",
  "Slayyy! 💅",
  "Top Global 🌍",
  "Gak Ada Obat! 💊",
  "Ilmu Padi 🌾",
  "Tetap Ilmu Padi 🌾",
  "Kasih Paham! 🧠",
  "Aura Magis! 🪄",
  "King Indo! 👑",
  "Sepuh Turun Gunung 🏔️",
  "Suhu! 🙏",
  "Ampun Suhu! 🙇",
  "Panutan! 🌟",
  "Idola Cilik 🎤",
  "Valid No Debat 🔨",
  "No Counter! 🛡️",
  "Damage Nggak Ngotak 💥",
  "Full Senyum 🌝",
  "Full Power! ⚡",
  "Mode Serius 😈",
  "Mode Pesawat ✈️",
  "Minggir Wir! 🌪️",

  // --- GAMING / KOMPETISI ---
  "Headshot! 🎯",
  "First Blood! 🩸",
  "Maniac! 👹",
  "Victory! 🏆",
  "Defeat... 🥀",
  "Winstreak! 🚀",
  "Losestreak... 📉",
  "Push Rank Terus! 🪜",
  "Mekanik Dewa 🦾",
  "Fast Hand ⚡",
  "Aim Bot? 🤖",
  "Cheater Pasti! 🚫",
  "Lag Njir! 📶",
  "Sinyal 4G+ 🗼",
  "Anti Lag Club 🚀",
  "Gendong Tim 🎒",
  "Beban Keluarga 🗿",
  "Beban Tim 🗑️",
  "Turu Deck 🛌",
  "Afk Moment ⏸️",
  "Comeback Is Real! 🔄",
  "Epic Comeback! 🎬",
  "Blunder Bos! ❌",
  "Kena Mental 🧠",
  "Mental Baja 🛡️",
  "Ulti Ratata! 🔫",
  "Spam Skill! 🌀",
  "Cooldown Dulu ⏳",
  "Mana Habis 💧",
  "Darah Sekarat 🩸",
  "Recall Recall 🏠",
  "Tas Tas Tas! 🎒",
  "Emot Dulu Bos 😜",
  "Taunting Tipis 🤏",
  "Jagoan Neon 💡",

  // --- HOKI / REZEKI ---
  "Hoki Seumur Hidup 🍀",
  "Gacor Kang! 🎰",
  "Jackpot! 🎰",
  "Sensasional! ✨",
  "Super Win! 💰",
  "Mega Win! 💎",
  "Max Win! 🚀",
  "Pecah Telor 🥚",
  "Cuan Ngalir 🌊",
  "Dompet Tebal 👛",
  "Rezeki Anak Soleh 😇",
  "Sedekah CF 🪙",
  "Info Chip? 🍟",
  "Bagi Dikit Dong 🤲",
  "Pinjam Dulu Seratus 💯",
  "Bayar Utang! 💳",
  "Auto Sultan 👳",
  "Sultan Mah Bebas 🤴",
  "Mendadak Kaya 💵",
  "Uang Kaget 😲",
  "Rungkad Sayang 💔",
  "Rungkad Maneh 📉",
  "Boncos Bos! 📉",
  "Miskin Issue 💸",
  "Tabungan Aman 🔒",

  // --- GAUL / REAKSI ---
  "Anjay Mabar 🤙",
  "Ashiap! 💂",
  "Slebew! 🤙",
  "Kurang Garing 🍪",
  "Lucu Bingit 😆",
  "Ngakak Abiez 🤣",
  "Receh Banget 🪙",
  "Cringe Dikit 😬",
  "Tapi Boong 🤥",
  "Kena Tipu! 🤡",
  "Chuaks! 🤪",
  "Yoi Mamen 🤙",
  "Sabi Lah! 👍",
  "Gaspol! 🏍️",
  "Rem Blong 🚨",
  "Tabrak Aja 🐂",
  "Sikat Miring! 🧹",
  "Hantam Kromo 👊",
  "Santuy Aja 🌴",
  "Kaum Rebahan 🛌",
  "Healing Dulu 🏖️",
  "Staycation 🏨",
  "Otw Gan! 🛵",
  "Masih Di Jalan 🛣️",
  "Bohong Dikit 🤫",
  "Jujurly... 🤐",
  "Sebenarnya... 🧐",
  "Malah Teybel 🦁",
  "Malah Nanya ❓",
  "Bercyandaaa! 🤪",
  "Info Loker? 📄",
  "Info Mabar? 🎮",
  "Info Janda? 💃",
  "Info Tournament 🏆",
  "Info Kopdar ☕",
  "Ngopi Dulu ☕",
  "Udud Dulu 🚬",
  "Sarapan Dulu 🥣",
  "Makan Bang! 🍽️",
  "Besok Diet 🍔",

  // --- PERASAAN / VIBES ---
  "Sad Vibes 🌧️",
  "Galau Brutal 😭",
  "Gamon Terus 💔",
  "Move On Dong 🏃",
  "Happy Kiyowo 🌸",
  "Gemoy Bet 🧸",
  "Kiyowo! 🥺",
  "Uwu Banget 🥰",
  "Luv Luv ❤️",
  "Bucin Akut 💑",
  "Jomblo Fisabilillah ☝️",
  "Jomblo Ngenes 🌵",
  "Ditolak... ✋",
  "Diterima! 🤝",
  "Friendzone 🚧",
  "Kakak Adik Zone 👫",
  "Ghosting 👻",
  "Hilang Ditelan Bumi 🌍",
  "Capek Banget 😮‍💨",
  "Lelah Hayati 😫",
  "Semangat Kakak! 💪",
  "Jangan Menyerah! 🏳️",
  "Tetap Semangat! 🔥",
  "Kamu Pasti Bisa! 🌟",
  "Percaya Proses ⏳",
  "Nikmati Hasil 🎁",
  "Bersyukur 🙏",
  "Alhamdulillah 🤲",
  "Masyaallah 🕌",
  "Astaghfirullah 📿",
  "Subhanallah 🌌",
  "Gokil Abis! 🤪",
  "Edan Poool! 🤯",
  "Gila Sih Ini 😵",
  "Speechless 😶",
];
// ==================== B. AUTHENTICATION LOGIC ====================

// ==================== B. AUTHENTICATION LOGIC (DIPERBAIKI) ====================

document.addEventListener("DOMContentLoaded", () => {
  // Coba inisialisasi auth segera setelah DOM siap
  initAuthListener();
});

function initAuthListener() {
  // Gunakan interval untuk memastikan Firebase SDK sudah termuat sepenuhnya
  // Terkadang koneksi lambat membuat window.auth belum tersedia instan
  const checkFirebase = setInterval(() => {
    // Cek apakah objek auth dari module Firebase sudah tersedia di window
    if (window.auth && window.authListener) {
      clearInterval(checkFirebase); // Stop checking

      // --- PENTING: SET PERSISTENCE ---
      // Secara default Firebase Web SDK menggunakan LOCAL persistence,
      // tapi kita pastikan lagi di sini agar sesi tidak hilang saat refresh.
      // (Biasanya sudah otomatis, tapi ini untuk memastikan)

      // Jalankan listener utama status autentikasi
      window.authListener(window.auth, (user) => {
        if (user) {
          // === USER SUDAH LOGIN (SESI TERSIMPAN) ===
          console.log("User terdeteksi:", user.email);

          let rawName = user.displayName || user.email.split("@")[0];
          const displayName = rawName
            .replace(/[0-9]/g, "")
            .replace(/^\s+|\s+$/g, "");

          currentUser = displayName;
          const uid = user.uid;

          // Update UI: Sembunyikan login, tampilkan konten
          const loginOverlay = document.getElementById("loginOverlay");
          const mainContent = document.getElementById("mainContent");

          if (loginOverlay) loginOverlay.style.display = "none";
          if (mainContent) mainContent.style.display = "block";

          // Update Header Info
          const displayUserEl = document.getElementById("displayUsername");
          const statusTextEl = document.getElementById("loginStatusText");

          if (displayUserEl) displayUserEl.innerText = displayName;
          if (statusTextEl) statusTextEl.innerText = "Online";
          // Di dalam initAuthListener, blok if (user) { ... }

          // --- UPDATE SIDEBAR INFO ---
          const sbUser = document.getElementById("sidebarUsername");
          const sbEmail = document.getElementById("sidebarEmail");

          if (sbUser) sbUser.innerText = displayName; // Nama
          if (sbEmail && user.email) sbEmail.innerText = user.email; // Email

          updateGreeting();

          // Load Data Realtime
          startFirebaseListener(uid);
          initApp(uid);

          // [TAMBAHAN: SIMPAN NAMA USER UNTUK ADMIN]
          if (window.dbUpdate && window.db && window.dbRef) {
            window
              .dbUpdate(window.dbRef(window.db, `users/${uid}`), {
                username: displayName,
                email: user.email,
                lastSeen: new Date().toLocaleString(),
              })
              .catch((err) => console.log("Update Profil Skip:", err));
          }
        } else {
          // === USER BELUM LOGIN / LOGOUT ===
          console.log("Tidak ada user login.");
          currentUser = null;

          const loginOverlay = document.getElementById("loginOverlay");
          const mainContent = document.getElementById("mainContent");

          if (loginOverlay) loginOverlay.style.display = "flex";
          if (mainContent) mainContent.style.display = "none";
        }
      });
    }
  }, 100); // Cek setiap 100ms
}

window.switchAuthMode = function (mode) {
  const loginView = document.getElementById("loginView");
  const registerView = document.getElementById("registerView");
  if (mode === "register") {
    loginView.style.display = "none";
    registerView.style.display = "block";
  } else {
    loginView.style.display = "block";
    registerView.style.display = "none";
  }
};
window.handleLogin = function () {
  const email = document.getElementById("loginEmail").value;
  const pass = document.getElementById("loginPass").value;
  if (!email || !pass) {
    document.getElementById("authErrorMsg").innerText =
      "Isi email dan password!";
    return;
  }
  window.authSignIn(window.auth, email, pass).catch((e) => {
    document.getElementById("authErrorMsg").innerText =
      "Gagal: Email/Password salah.";
  });
};
window.handleGoogleLogin = function () {
  window
    .authSignInGoogle(window.auth, window.googleProvider)
    .then((res) => showToast(`Masuk: ${res.user.displayName}`, "success"))
    .catch((e) => console.error(e));
};
window.handleRegister = function () {
  const u = document.getElementById("regUsername").value;
  const e = document.getElementById("regEmail").value;
  const p = document.getElementById("regPass").value;
  if (!u || !e || !p) return alert("Lengkapi data!");
  window
    .authSignUp(window.auth, e, p)
    .then((c) => {
      window
        .authUpdateProfile(c.user, { displayName: u })
        .then(() => location.reload());
    })
    .catch((e) => alert(e.message));
};
window.logoutUser = function () {
  showCustomConfirm("Apakah Anda yakin ingin keluar?", () => {
    window.authSignOut(window.auth).then(() => location.reload());
  });
};
window.editUsername = function () {
  const u = window.auth.currentUser;
  if (u) {
    document.getElementById("newUsernameInput").value = u.displayName || "";
    document.getElementById("usernameModal").style.display = "flex";
  }
};
window.saveUsername = function () {
  const n = document.getElementById("newUsernameInput").value.trim();
  if (n)
    window
      .authUpdateProfile(window.auth.currentUser, { displayName: n })
      .then(() => {
        document.getElementById("displayUsername").innerText = n;
        updateGreeting();
        document.getElementById("usernameModal").style.display = "none";
      });
};

// ==================== C. FIREBASE DATA LOGIC ====================

function startFirebaseListener(uid) {
  // Cek apakah database sudah siap
  if (!window.db || !window.dbOnValue) return;
  

  const userPath = "users/" + uid;

  // Dengarkan perubahan data secara realtime
  window.dbOnValue(window.dbRef(window.db, userPath), (snapshot) => {
    const data = snapshot.val();

    if (data) {
      // 1. Load Data Utama
      // ... data lainnya ...
  
      
      // TAMBAHKAN BARIS INI:
      cachedData.calendarEvents = data.calendarEvents || []; // Data acara manual
      cachedData.tasks = data.tasks || [];
      cachedData.transactions = data.transactions || [];
      cachedData.gamification = data.gamification || { xp: 0, level: 1 };
      cachedData.streak = data.streak || { count: 0, lastLogin: null };
      cachedData.focusLogs = data.focusLogs || {};
      cachedData.scheduleNotes = data.scheduleNotes || {};
      cachedData.unlockedAchievements = data.unlockedAchievements || [];
      cachedData.moodLogs = data.moodLogs || {};
      cachedData.examCountdowns = data.examCountdowns || [];
      // Di dalam startFirebaseListener, tambahkan baris ini:
      cachedData.budgets = data.budgets || {};
      cachedData.subscriptions = data.subscriptions || [];
      // [BARU] Load Sticky Note
      cachedData.stickyNote = data.stickyNote || "";
      document.getElementById("globalStickyNote").value = cachedData.stickyNote;

      // 2. Load Jadwal
      if (data.jadwal && data.jadwal.umum) {
        cachedData.jadwal = data.jadwal;
      } else {
        cachedData.jadwal = defaultJadwalData;
        saveDB("jadwalData", defaultJadwalData);
      }

      // 3. Load Pengaturan (Settings)
      if (data.settings) {
        if (data.settings.theme) applyTheme(data.settings.theme);
        if (data.settings.weekType) currentWeekType = data.settings.weekType;
        if (data.settings.target)
          localStorage.setItem(`${uid}_target`, data.settings.target);
        if (data.settings.isExamMode) isExamMode = data.settings.isExamMode;
      }

      // [PERBAIKAN PENTING]
      // Cek Streak di sini, setelah data streak dari server masuk ke cachedData
      checkStreak();
    } else {
      // Jika pengguna baru (data kosong), simpan data default
      cachedData.jadwal = defaultJadwalData;
      saveAllToCloud(uid);
    }

    // 4. Update Tampilan (Render)
    jadwalData = cachedData.jadwal;
    renderAll();
    // --- TAMBAHAN: DENGARKAN PENGUMUMAN ADMIN ---
    // --- NOTIFIKASI RUNNING TEXT (UPDATE INI) ---
    // DI FILE: script.js (User)

    // --- NOTIFIKASI RUNNING TEXT (LOGIKA BARU DENGAN JADWAL) ---
    const systemRef = window.dbRef(window.db, "system/announcement");

    window.dbOnValue(systemRef, (snapshot) => {
      const data = snapshot.val();
      const widget = document.getElementById("broadcastWidget");
      const textEl = document.getElementById("broadcastText");

      // Safety check
      if (!widget || !textEl) return;

      // Logika Validasi Waktu
      const now = Date.now();
      let showAnnouncement = false;

      if (data) {
        if (data.startTime && data.endTime) {
          // [LOGIKA BARU] Cek Range Waktu (Jadwal)
          // Tampil hanya jika: Sekarang >= Mulai DAN Sekarang <= Selesai
          if (now >= data.startTime && now <= data.endTime) {
            showAnnouncement = true;
          }
        } else if (data.timestamp) {
          // [LOGIKA LAMA/FALLBACK] Cek 24 Jam dari timestamp
          if (now - data.timestamp < 86400000) {
            showAnnouncement = true;
          }
        }
      }

      // Tampilkan atau Sembunyikan
      if (showAnnouncement) {
        widget.style.display = "flex";

        // Format Teks
        textEl.innerText = `${data.title.toUpperCase()}  —  ${data.message}    *** `;

        // Reset animasi biar mulus
        textEl.style.animation = "none";
        textEl.offsetHeight;

        // Atur kecepatan
        const duration = Math.max(10, textEl.innerText.length / 5);
        textEl.style.animation = `marquee ${duration}s linear infinite`;

        // Bunyi ting hanya jika widget baru muncul (opsional)
        if (widget.style.display === "none") playSuccessSound("bell");
      } else {
        widget.style.display = "none";
      }
    });

    // Fungsi Tutup Notifikasi Manual (Taruh di luar startFirebaseListener atau di global)
    window.closeBroadcast = function () {
      const widget = document.getElementById("broadcastWidget");
      if (widget) widget.style.display = "none";
    };
  });
  
}

function saveDB(key, data) {
  if (!window.auth.currentUser) return;
  const uid = window.auth.currentUser.uid;

  if (key === "tasks") cachedData.tasks = data;
  if (key === "transactions") cachedData.transactions = data;
  if (key === "gamification") cachedData.gamification = data;
  if (key === "streak") cachedData.streak = data;
  if (key === "focusLogs") cachedData.focusLogs = data;
  if (key === "scheduleNotes") cachedData.scheduleNotes = data;
  if (key === "unlockedAchievements") cachedData.unlockedAchievements = data;
  if (key === "jadwalData") {
    cachedData.jadwal = data;
    jadwalData = data;
    key = "jadwal";
  }

  window
    .dbSet(window.dbRef(window.db, `users/${uid}/${key}`), data)
    .then(() => {
      checkAchievements();
    })
    .catch((err) => console.error("Save Error:", err));
}

function saveSetting(key, val) {
  const uid = window.auth.currentUser.uid;
  window.dbSet(window.dbRef(window.db, `users/${uid}/settings/${key}`), val);
}

function saveAllToCloud(uid) {
  const targetUid =
    uid || (window.auth.currentUser ? window.auth.currentUser.uid : null);
  if (targetUid)
    window.dbSet(window.dbRef(window.db, `users/${targetUid}`), cachedData);
}

function getDB(key) {
  if (key === "tasks") return cachedData.tasks || [];
  if (key === "transactions") return cachedData.transactions || [];
  return [];
}

// ==================== D. APP FEATURES LOGIC ====================

function initApp(uid) {
  // 1. Inisialisasi Fitur Dasar
  startClock();
  initWeather();
  updateGreeting();
  initChatListener(); // <--- TAMBAHKAN INI
  updateHeaderDate();
  loadScheduleFilters();
  loadSoundSettings();
  loadRandomQuote();
  updateTimerDisplay();
  injectNewUI();
  listenGlobalConfig();
}
// 2. Shortcut Keyboard (Ctrl + T/S/D/A)
document.addEventListener("keydown", (e) => {
  // ✅ BENAR: Kurung tutup dihapus di sini
  // Di dalam event listener keydown...
  if ((e.key === "a" || e.key === "A") && (e.ctrlKey || e.metaKey)) {
    // Cek Ctrl+A
    // [FIX] Cek apakah user sedang mengetik di Input atau Textarea
    const target = e.target.tagName.toLowerCase();
    if (target === "input" || target === "textarea") {
      return; // JANGAN blokir jika sedang mengetik
    }

    // Blokir hanya jika TIDAK sedang mengetik
    e.preventDefault();
    showToast("🚫 Select All dimatikan!", "error");
    return;
  }
  // ------------------------------------------

  // Shortcut lain (Ctrl + T/S/D) biasanya butuh e.ctrlKey, pastikan logika Anda benar
  // Jika shortcut di bawah ini TIDAK menggunakan Ctrl, biarkan seperti ini:
  if (e.key === "t" && e.ctrlKey) {
    // Sebaiknya pakai Ctrl+T agar tidak terpencet saat ngetik biasa
    e.preventDefault();
    document.getElementById("taskInput").focus();
  } else if (e.key === "s" && e.ctrlKey) {
    // Ctrl+S
    e.preventDefault();
    document.getElementById("startPauseBtn").click();
  } else if (e.key === "d" && e.ctrlKey) {
    // Ctrl+D
    e.preventDefault();
    toggleDarkMode();
  }
}); // ✅ BENAR: Kurung tutup penutup ada di sini
// 3. Cek Reminder Jadwal setiap 1 menit
setInterval(checkReminders, 60000);
setTimeout(checkSubscriptionReminders, 3000); // Delay sedikit agar tidak bertumpuk

// 4. Deteksi Pindah Tab (Blur/Focus)
window.addEventListener("blur", handleTabBlur);
window.addEventListener("focus", handleTabFocus);
window.addEventListener("beforeunload", handleBeforeUnload);

// 5. PROTEKSI KLIK KANAN (ANTI-CHEAT)
// Kode ini akan memblokir menu klik kanan jika Mode Ujian AKTIF
document.addEventListener("contextmenu", (event) => {
  if (isExamMode) {
    event.preventDefault(); // Mencegah menu muncul
    showToast("🚫 Klik Kanan dimatikan selama Mode Ujian!", "error");
    playSuccessSound("coin");
  }
});

function injectNewUI() {
  // Inject XP container removed - handled by main HTML structure now
  if (!document.getElementById("musicWidget")) {
    const musicHTML = `
            <div id="musicWidget" style="position: fixed; bottom: 20px; left: 20px; z-index: 1000; background: var(--card-bg); padding: 10px; border-radius: 15px; box-shadow: var(--shadow-lg); border: 1px solid var(--border-color); width: 200px; transition: 0.3s;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 5px;">
                    <span style="font-weight:700; font-size:0.8rem;"><i class="fas fa-music"></i> Lo-Fi Radio</span>
                    <button onclick="document.getElementById('musicFrame').classList.toggle('hidden-music')" style="background:none; color:var(--text-sub);"><i class="fas fa-chevron-down"></i></button>
                </div>
                <div id="musicFrame" style="height: 100px; overflow: hidden; border-radius: 10px;">
                     <iframe width="100%" height="100%" src="https://www.youtube.com/embed/jfKfPfyJRdk?controls=0&autoplay=0" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                </div>
                <style>.hidden-music { height: 0 !important; }</style>
            </div>
        `;
    document.body.insertAdjacentHTML("beforeend", musicHTML);
  }

  const pomodoroCard = document.querySelector(".pomodoro-card");
  if (pomodoroCard && !document.getElementById("focusChartSection")) {
    const chartHTML = `
            <div id="focusChartSection" style="margin-top: 20px; background: rgba(0,0,0,0.1); padding: 15px; border-radius: 12px; text-align: left;">
                <h4 style="font-size: 0.9rem; margin-bottom: 10px; color: white;">📊 Statistik Fokus Minggu Ini</h4>
                <div id="focusChart" style="display: flex; gap: 5px; align-items: flex-end; height: 80px; padding-bottom: 5px;">
                    </div>
            </div>
        `;
    pomodoroCard.appendChild(document.createElement("div")).innerHTML =
      chartHTML;
  }
}

// --- GAMIFICATION & RANK LOGIC ---

// Fungsi Baru: Mendapatkan Judul Berdasarkan Level
function getLevelTitle(level) {
  if (level >= 50) return "Immortal 💀";
  if (level >= 40) return "Mythic 🔮";
  if (level >= 30) return "Legend 🐉";
  if (level >= 20) return "Grandmaster ⚔️";
  if (level >= 10) return "Sepuh 👑";
  if (level >= 5) return "Bintang Kelas 🌟";
  if (level >= 2) return "Murid Teladan 📚";
  return "Murid Baru 🌱";
}

function addXP(amount) {
  if (!cachedData.gamification) cachedData.gamification = { xp: 0, level: 1 };
  let stats = cachedData.gamification;
  stats.xp += amount;
  const xpNeeded = stats.level * 100;

  // Level Up Logic
  if (stats.xp >= xpNeeded) {
    stats.xp -= xpNeeded;
    stats.level++;
    const newTitle = getLevelTitle(stats.level);
    showToast(
      `🎉 LEVEL UP! Sekarang Level ${stats.level} (${newTitle})`,
      "success",
    );
    playSuccessSound("bell");
  }
  saveDB("gamification", stats);
  updateGamificationUI();
}

function updateGamificationUI() {
  const stats = cachedData.gamification || { xp: 0, level: 1 };
  const xpNeeded = stats.level * 100;
  const pct = Math.min((stats.xp / xpNeeded) * 100, 100);

  // Update Progress Bar
  const xpBar = document.getElementById("xpBarFill");
  if (xpBar) xpBar.style.width = `${pct}%`;

  // Update XP Text
  const xpText = document.getElementById("xpText");
  if (xpText) xpText.innerText = `${stats.xp} / ${xpNeeded} XP`;

  // Update Level Badge
  const userLevel = document.getElementById("userLevel");
  if (userLevel) userLevel.innerText = stats.level;

  // [BARU] Update Rank Title Text
  const rankElement = document.getElementById("userRank");
  if (rankElement) {
    rankElement.innerText = getLevelTitle(stats.level);
  }

  // Legacy support (jika masih ada elemen lama)
  const legacyBar = document.getElementById("userXPBar");
  if (legacyBar) legacyBar.style.width = `${pct}%`;
  const legacyText = document.getElementById("userXPText");
  if (legacyText) legacyText.innerText = `${stats.xp} / ${xpNeeded} XP`;
}

// --- STREAK ---
// --- STREAK SYSTEM (FIXED) ---
function checkStreak() {
  // 1. Ambil Tanggal Hari Ini (Sesuai Waktu Lokal Device)
  // Format 'en-CA' menghasilkan YYYY-MM-DD yang konsisten
  const now = new Date();
  const today = now.toLocaleDateString("en-CA");

  // 2. Pastikan data ada
  if (!cachedData.streak) cachedData.streak = { count: 0, lastLogin: null };
  let streak = cachedData.streak;

  // 3. Logika Cek Login
  if (streak.lastLogin !== today) {
    // Hitung Tanggal Kemarin
    const yesterdayDate = new Date(now);
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterdayStr = yesterdayDate.toLocaleDateString("en-CA");

    if (streak.lastLogin === yesterdayStr) {
      // Jika login terakhir adalah kemarin -> LANJUT STREAK
      streak.count++;
    } else {
      // Jika login terakhir bukan kemarin (terlewat) -> RESET JADI 1
      // Kecuali jika ini login pertama kali (lastLogin null)
      streak.count = 1;
    }

    // Simpan Data Terbaru
    streak.lastLogin = today;
    saveDB("streak", streak);

    // Berikan Reward (Delay sedikit agar tidak bertumpuk dengan notifikasi login)
    setTimeout(() => {
      addXP(10);
      showToast(`🔥 Streak Harian: ${streak.count} Hari! (+10 XP)`, "success");
      playSuccessSound("coin");
    }, 2500);
  }

  // 4. Update Tampilan Badge
  const streakBadge = document.getElementById("streakCount");
  if (streakBadge) streakBadge.innerText = streak.count;
}

// --- FOCUS STATS ---
function logFocusTime(minutes) {
  if (minutes <= 0) return;
  const today = new Date().toISOString().split("T")[0];
  let logs = cachedData.focusLogs;
  if (!logs[today]) logs[today] = 0;
  logs[today] += minutes;
  saveDB("focusLogs", logs);
  renderFocusChart();
}

function renderFocusChart() {
  const chart = document.getElementById("focusChart");
  if (!chart) return;
  chart.innerHTML = "";

  let html =
    '<div style="display: flex; gap: 5px; align-items: flex-end; height: 80px; padding-bottom: 5px; width:100%;">';
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    const dayName = days[d.getDay()].substring(0, 3);
    const minutes = cachedData.focusLogs[dateStr] || 0;
    let heightPct = (minutes / 120) * 100;
    if (heightPct > 100) heightPct = 100;
    if (heightPct < 5 && minutes > 0) heightPct = 5;

    html += `
            <div style="flex:1; display:flex; flex-direction:column; align-items:center; justify-content:flex-end; height:100%;">
                <div style="width:80%; background:rgba(255,255,255,0.5); height:${heightPct}%; border-radius:4px; position:relative; min-height: ${
                  minutes > 0 ? 4 : 0
                }px;" title="${minutes} Menit"></div>
                <small style="font-size:0.6rem; color:white; margin-top:4px;">${dayName}</small>
            </div>
        `;
  }
  html += "</div>";
  chart.innerHTML = html;
}
function renderAll() {
  // 1. Update UI yang sudah ada
  const weekSelector = document.getElementById("weekTypeSelector");
  if (weekSelector) weekSelector.value = currentWeekType;

  checkExamMode();
  renderSchedule();
  loadTasks();
  loadTransactions();
  loadTarget();
  loadPomodoroTasks();
  updateGamificationUI();
  renderFocusChart();
  renderCalendar();




  // 2. [PERBAIKAN] Panggil fungsi ini agar Widget BARU muncul saat refresh
  if (typeof renderCountdowns === "function") renderCountdowns();
  if (typeof renderMoodWidget === "function") renderMoodWidget();

  // 3. Update Streak
  if (document.getElementById("streakCount")) {
    document.getElementById("streakCount").innerText =
      cachedData.streak.count || 0;
  }
}
// --- MODE FOKUS ---
function setFocusType(type) {
  if (!isPaused) return showToast("Jeda timer dulu untuk ganti mode!", "error");
  focusType = type;
  document.getElementById("btnModeStrict").className =
    type === "strict" ? "mode-btn active" : "mode-btn";
  document.getElementById("btnModeChill").className =
    type === "chill" ? "mode-btn active" : "mode-btn";
  if (type === "strict")
    showToast("Mode Ketat: Pindah tab = Timer Pause 🔒", "info");
  else showToast("Mode Santai: Bebas buka tab lain ☕", "success");
}

function setFocusLock(lock) {
  isFocusLocked = lock && focusType === "strict";
  const focusModeElement = document.getElementById("focusModeLockText");
  if (focusModeElement) {
    focusModeElement.style.display = isFocusLocked ? "block" : "none";
  }
}

function handleTabBlur() {
  // --- LOGIKA BARU: DETEKSI KECURANGAN UJIAN ---
  if (isExamMode) {
    // Munculkan notifikasi merah (error)
    showToast("⚠️ PERINGATAN: Dilarang pindah tab saat Ujian!", "error");

    // Bunyikan suara peringatan (opsional, pakai sound yang ada)
    playSuccessSound("coin");

    // (Opsional) Di sini Anda bisa menambahkan logika penalti, misal: kurangi XP
    // addXP(-50);
  }

  // --- LOGIKA LAMA: MODE FOKUS STRICT ---
  // Cek apakah Mode Strict aktif
  if (focusType === "strict" && isFocusLocked && !isPaused && isWorking) {
    isTabBlurred = true;
    blurCount++;
    pauseTimer();
    showToast(`❌ MODE KETAT: Timer dijeda karena pindah tab!`, "error");
  }
}
function handleTabFocus() {
  if (focusType === "strict" && isFocusLocked && isTabBlurred) {
    isTabBlurred = false;
  }
}

function handleBeforeUnload(event) {
  if (!isPaused && isWorking) {
    event.preventDefault();
    event.returnValue = "Timer sedang berjalan!";
    return "Timer sedang berjalan!";
  }
}

// --- UTILS UI ---
function updateGreeting() {
  const h = new Date().getHours();
  let greet =
    h < 11
      ? "Selamat Pagi"
      : h < 15
        ? "Selamat Siang"
        : h < 18
          ? "Selamat Sore"
          : "Selamat Malam";
  const userDisplay = currentUser || "User";
  document.getElementById("greeting").innerHTML =
    `${greet}, <span class="text-gradient">${escapeHtml(userDisplay)}</span>!`;
}

function updateHeaderDate() {
  document.getElementById("headerDate").innerHTML =
    `<i class="far fa-calendar"></i> ${new Date().toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    })}`;
}
function startClock() {
  setInterval(() => {
    const n = new Date();
    document.getElementById("clockTime").innerText = n.toLocaleTimeString(
      "id-ID",
      { hour: "2-digit", minute: "2-digit" },
    );
  }, 1000);
}
function showToast(m, t) {
  const b = document.getElementById("toastBox");
  const d = document.createElement("div");
  d.className = `toast ${t}`;
  d.innerHTML = `<i class="fas fa-${
    t === "success"
      ? "check-circle"
      : t === "info"
        ? "bell"
        : "exclamation-circle"
  }"></i> ${m}`;
  b.appendChild(d);
  setTimeout(() => d.remove(), 3000);
}
function toggleDarkMode() {
  document.body.classList.toggle("dark-mode");
  const theme = document.body.classList.contains("dark-mode")
    ? "dark"
    : "light";
  saveSetting("theme", theme);
}
function applyTheme(theme) {
  if (theme === "dark") document.body.classList.add("dark-mode");
  else document.body.classList.remove("dark-mode");
}

// --- POMODORO ---
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
function playSuccessSound(type = "ding") {
  if (soundPreference === "silent") return;
  if (audioCtx.state === "suspended") audioCtx.resume();
  const o = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  o.connect(g);
  g.connect(audioCtx.destination);
  const now = audioCtx.currentTime;

  if (type === "ding") {
    o.type = "sine";
    o.frequency.setValueAtTime(1200, now);
    o.frequency.exponentialRampToValueAtTime(600, now + 0.5);
    g.gain.setValueAtTime(0.1, now);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);
    o.start();
    o.stop(now + 0.5);
  } else if (type === "coin") {
    o.type = "triangle";
    o.frequency.setValueAtTime(900, now);
    g.gain.setValueAtTime(0.1, now);
    g.gain.linearRampToValueAtTime(0.0001, now + 0.3);
    o.start();
    o.stop(now + 0.3);
  } else if (type === "bell") {
    o.type = "sawtooth";
    o.frequency.setValueAtTime(440, now);
    g.gain.setValueAtTime(0.15, now);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 1.5);
    o.start();
    o.stop(now + 1.5);
  }
}

function formatTime(s) {
  const m = Math.floor(s / 60);
  const rs = s % 60;
  return `${String(m).padStart(2, "0")}:${String(rs).padStart(2, "0")}`;
}

function updateTimerDisplay() {
  document.getElementById("timerDisplay").innerText = formatTime(timeLeft);
  const card = document.querySelector(".pomodoro-card");
  if (isWorking) {
    document.getElementById("timerMode").innerText = "FOKUS";
    document.getElementById("timerMessage").innerText =
      "Waktunya Bekerja Keras";
    card.classList.remove("mode-break");
    if (!isPaused) {
      document.getElementById("startPauseBtn").innerText = "Jeda";
      document
        .getElementById("startPauseBtn")
        .setAttribute("onclick", "pauseTimer()");
    } else {
      document.getElementById("startPauseBtn").innerText = "Mulai";
      document
        .getElementById("startPauseBtn")
        .setAttribute("onclick", "startTimer()");
    }
  } else {
    document.getElementById("timerMode").innerText = "ISTIRAHAT";
    document.getElementById("timerMessage").innerText = "Istirahat Sejenak";
    card.classList.add("mode-break");
    if (!isPaused) {
      document.getElementById("startPauseBtn").innerText = "Skip";
      document
        .getElementById("startPauseBtn")
        .setAttribute("onclick", "resumeFocus()");
    } else {
      document.getElementById("startPauseBtn").innerText = "Lanjut";
      document
        .getElementById("startPauseBtn")
        .setAttribute("onclick", "resumeFocus()");
    }
  }
  if (timeLeft === 0) toggleMode();
}

function startTimer() {
  if (!isPaused) return;
  isPaused = false;
  if (isWorking) setFocusLock(true);
  updateTimerDisplay();
  timerInterval = setInterval(() => {
    timeLeft--;
    updateTimerDisplay();
  }, 1000);
}

function pauseTimer() {
  if (isPaused) return;
  isPaused = true;
  clearInterval(timerInterval);
  if (isWorking) {
    savedFocusTime = timeLeft;
    const durationSetting = isExamMode
      ? WORK_DURATION_EXAM
      : WORK_DURATION_DEFAULT;
    const workedMinutes = Math.floor((durationSetting - timeLeft) / 60);
    if (workedMinutes > 0) logFocusTime(workedMinutes);
    isWorking = false;
    if (savedBreakTime !== null && savedBreakTime > 0)
      timeLeft = savedBreakTime;
    else timeLeft = isExamMode ? BREAK_DURATION_EXAM : BREAK_DURATION_DEFAULT;
    showToast("Fokus dijeda. Istirahat dulu!", "info");
    updateTimerDisplay();
    startTimer();
  }
  setFocusLock(false);
}

function resumeFocus() {
  savedBreakTime = timeLeft;
  clearInterval(timerInterval);
  isPaused = true;
  isWorking = true;
  if (savedFocusTime !== null && savedFocusTime > 0) {
    timeLeft = savedFocusTime;
    showToast("Melanjutkan Fokus...", "success");
  } else {
    timeLeft = isExamMode ? WORK_DURATION_EXAM : WORK_DURATION_DEFAULT;
    showToast("Mulai Fokus Baru", "success");
  }
  savedFocusTime = null;
  updateTimerDisplay();
  startTimer();
}

function resetTimer() {
  clearInterval(timerInterval);
  isPaused = true;
  isWorking = true;
  timeLeft = isExamMode ? WORK_DURATION_EXAM : WORK_DURATION_DEFAULT;
  savedFocusTime = null;
  savedBreakTime = null;
  updateTimerDisplay();
  setFocusLock(false);
}

function toggleMode() {
  clearInterval(timerInterval);
  isPaused = true;
  if (isWorking) {
    const durationSetting = isExamMode
      ? WORK_DURATION_EXAM
      : WORK_DURATION_DEFAULT;
    const workedMinutes = Math.floor(durationSetting / 60);
    logFocusTime(workedMinutes);
    addXP(20);
    isWorking = false;
    savedBreakTime = null;
    timeLeft = isExamMode ? BREAK_DURATION_EXAM : BREAK_DURATION_DEFAULT;
    showToast("Waktunya ISTIRAHAT! ☕ (+20 XP)", "info");
  } else {
    isWorking = true;
    savedFocusTime = null;
    timeLeft = isExamMode ? WORK_DURATION_EXAM : WORK_DURATION_DEFAULT;
    showToast("Kembali FOKUS! 🔔", "info");
  }
  playSuccessSound("bell");
  updateTimerDisplay();
  startTimer();
}

function loadPomodoroTasks() {
  const s = document.getElementById("pomodoroTaskSelector");
  if (!s) return;
  s.innerHTML = '<option value="">-- Pilih Tugas untuk Fokus --</option>';
  cachedData.tasks
    .filter((t) => !t.completed)
    .forEach((t) => {
      const o = document.createElement("option");
      o.value = t.id;
      o.innerText = t.text;
      s.appendChild(o);
    });
}

// --- JADWAL ---
function changeDay(dir) {
  currentDayIdx += dir;
  if (currentDayIdx > 6) currentDayIdx = 0;
  if (currentDayIdx < 0) currentDayIdx = 6;
  renderSchedule();
}
function changeWeekType() {
  currentWeekType = document.getElementById("weekTypeSelector").value;
  saveSetting("weekType", currentWeekType);
  renderSchedule();
}
function loadScheduleFilters() {
  const guruSet = new Set();
  const guruSelector = document.getElementById("scheduleFilterGuru");
  if (!guruSelector || !jadwalData) return;
  Object.values(jadwalData).forEach((week) => {
    Object.values(week).forEach((dayData) => {
      dayData.forEach((item) => {
        if (item.guru) guruSet.add(item.guru);
      });
    });
  });
  guruSelector.innerHTML =
    '<option value="all">Filter Guru/Dosen (Semua)</option>';
  Array.from(guruSet)
    .sort()
    .forEach((guru) => {
      guruSelector.innerHTML += `<option value="${escapeHtml(
        guru,
      )}">${escapeHtml(guru)}</option>`;
    });
}
function getWeekNumber(d) {
  d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  var yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
}

function renderSchedule() {
  const dayName = days[currentDayIdx];
  document.getElementById("activeDayName").innerText = dayName.toUpperCase();
  let currentWeekDisplay = currentWeekType;
  if (currentWeekType === "auto")
    currentWeekDisplay =
      getWeekNumber(new Date()) % 2 !== 0 ? "umum" : "produktif";
  if (!jadwalData) return;

  // Safety check
  if (!jadwalData[currentWeekDisplay]) jadwalData[currentWeekDisplay] = {};

  let data = jadwalData[currentWeekDisplay][dayName];
  const tbody = document.getElementById("scheduleBody");
  const now = new Date();
  const curMins = now.getHours() * 60 + now.getMinutes();
  const isToday = currentDayIdx === now.getDay();
  tbody.innerHTML = "";
  const filterCat = document.getElementById("scheduleFilterCategory").value;
  const filterGuru = document.getElementById("scheduleFilterGuru").value;
  if (data)
    data = data.filter(
      (item) =>
        (filterCat === "all" || item.type === filterCat) &&
        (filterGuru === "all" || item.guru === filterGuru),
    );

  let statusWidget = document.getElementById("liveStatusWidget");
  if (!statusWidget) {
    const statusBar = document.querySelector(".schedule-status-bar");
    if (statusBar) {
      statusBar.innerHTML = `<div id="liveStatusWidget" class="live-status-widget"><div class="status-icon-box"><i class="fas fa-bolt" id="statusIcon"></i></div><div class="status-content"><h4 id="statusLabel">STATUS SAAT INI</h4><p id="statusText">Memuat...</p></div></div>`;
      statusWidget = document.getElementById("liveStatusWidget");
    }
  }

  if (!data || data.length === 0) {
    if (tbody.parentElement) tbody.parentElement.style.display = "none";
    document.getElementById("holidayMessage").style.display = "block";
    if (statusWidget) {
      document.getElementById("statusText").innerText =
        "Tidak ada jadwal (Libur)";
      statusWidget.className = "live-status-widget status-chill";
    }
    return;
  }

  if (tbody.parentElement) tbody.parentElement.style.display = "table";
  document.getElementById("holidayMessage").style.display = "none";
  let statusText = "Belum Mulai";
  let statusClass = "live-status-widget";
  let iconClass = "fas fa-clock";

  if (isToday) {
    if (now.getHours() >= 17) {
      statusText = "Selesai. Besok lagi!";
      statusClass += " status-chill";
      iconClass = "fas fa-moon";
    } else {
      let ongoing = false;
      data.forEach((item) => {
        const parts = item.time.split("-");
        if (parts.length >= 2) {
          const start = parts[0]
            .trim()
            .replace(".", ":")
            .split(":")
            .map(Number);
          const end = parts[1]
            .trim()
            .split(" ")[0]
            .replace(".", ":")
            .split(":")
            .map(Number);
          if (
            curMins >= start[0] * 60 + start[1] &&
            curMins < end[0] * 60 + end[1]
          ) {
            statusText = `Sedang: ${item.mapel}`;
            statusClass += " status-busy";
            iconClass = "fas fa-book-reader";
            ongoing = true;
          }
        }
      });
      if (!ongoing) {
        statusText = "Istirahat / Pergantian";
        statusClass += " status-chill";
        iconClass = "fas fa-coffee";
      }
    }
  } else {
    statusText = `Jadwal ${dayName}`;
    statusClass += " status-chill";
    iconClass = "fas fa-calendar-alt";
  }

  if (statusWidget) {
    document.getElementById("statusText").innerText = statusText;
    document.getElementById("statusIcon").className = iconClass;
    statusWidget.className = statusClass;
  }

  data.forEach((item, idx) => {
    let isActive = false;
    if (isToday && now.getHours() < 17) {
      const parts = item.time.split("-");
      if (parts.length >= 2) {
        const s = parts[0].trim().replace(".", ":").split(":").map(Number);
        const e = parts[1]
          .trim()
          .split(" ")[0]
          .replace(".", ":")
          .split(":")
          .map(Number);
        if (curMins >= s[0] * 60 + s[1] && curMins < e[0] * 60 + e[1])
          isActive = true;
      }
    }
    const noteKey = `${dayName}_${idx}`;
    const hasNote =
      cachedData.scheduleNotes && cachedData.scheduleNotes[noteKey];
    const noteBtnClass = hasNote ? "btn-note has-content" : "btn-note";
    const noteIcon = hasNote ? "fas fa-check-square" : "fas fa-sticky-note";
    const noteElem = `<button class="${noteBtnClass}" onclick="openMapelNote('${dayName}', ${idx})"><i class="${noteIcon}"></i> ${
      hasNote ? "Ada Catatan" : "Catatan"
    }</button>`;
    const editElem = `<button class="btn-edit-round" onclick="openScheduleEdit('${dayName}',${idx})"><i class="fas fa-pencil-alt"></i></button>`;
    tbody.innerHTML += `<tr class="${
      isActive ? "active-row" : ""
    }"><td><b>${escapeHtml(
      item.mapel,
    )}</b><br><small style="color:var(--text-sub)">${escapeHtml(
      item.guru || "",
    )}</small></td><td>${escapeHtml(
      item.time,
    )}</td><td>${noteElem}</td><td>${editElem}</td></tr>`;
  });
}

function openMapelNote(day, idx) {
  currentNoteTarget = `${day}_${idx}`;
  const savedNote = cachedData.scheduleNotes[currentNoteTarget] || "";
  document.getElementById("noteModalInput").value = savedNote;
  let displayType =
    currentWeekType === "auto"
      ? getWeekNumber(new Date()) % 2 !== 0
        ? "umum"
        : "produktif"
      : currentWeekType;
  if (jadwalData[displayType] && jadwalData[displayType][day]) {
    document.getElementById("noteModalTitle").innerText =
      `📝 Catatan: ${jadwalData[displayType][day][idx].mapel}`;
  }
  document.getElementById("noteModal").style.display = "flex";
}

window.saveNoteFromModal = function () {
  if (!currentNoteTarget) return;
  const val = document.getElementById("noteModalInput").value;
  if (!cachedData.scheduleNotes) cachedData.scheduleNotes = {};
  cachedData.scheduleNotes[currentNoteTarget] = val;
  saveDB("scheduleNotes", cachedData.scheduleNotes);
  closeNoteModal();
  renderSchedule();
  showToast("Catatan Mapel Disimpan!", "success");
};
window.deleteNote = function () {
  if (!currentNoteTarget) return;
  showCustomConfirm("Hapus catatan mata pelajaran ini?", () => {
    delete cachedData.scheduleNotes[currentNoteTarget];
    saveDB("scheduleNotes", cachedData.scheduleNotes);
    document.getElementById("noteModalInput").value = "";
    closeNoteModal();
    renderSchedule();
    showToast("Catatan dihapus.", "info");
  });
};
window.closeNoteModal = function () {
  document.getElementById("noteModal").style.display = "none";
  currentNoteTarget = null;
};

function formatDateIndo(dateString) {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString("id-ID", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
function getDaysRemaining(dateString) {
  if (!dateString) return null;
  const target = new Date(dateString);
  target.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.ceil((target - today) / (1000 * 60 * 60 * 24));
}
function filterTasks(type, btn) {
  taskFilter = type;
  document
    .querySelectorAll(".tab")
    .forEach((b) => b.classList.remove("active"));
  btn.classList.add("active");
  loadTasks();
}

function handleTaskButton() {
  const text = escapeHtml(document.getElementById("taskInput").value);
  const date = document.getElementById("taskDate").value;
  const priority = document.getElementById("taskPriority").value;
  if (!text || !date) return showToast("Lengkapi data tugas!", "error");

  let tasks = getDB("tasks");
  if (editingTaskId) {
    const idx = tasks.findIndex((t) => t.id === editingTaskId);
    if (idx !== -1) {
      tasks[idx].text = text;
      tasks[idx].date = date;
      tasks[idx].priority = priority;
      showToast("Tugas diupdate!", "success");
    }
    editingTaskId = null;
    document.getElementById("addTaskBtn").innerHTML = `Tambah Tugas`;
  } else {
    tasks.push({
      id: Date.now(),
      text,
      date: date,
      priority,
      completed: false,
    });
    addXP(5);
    playSuccessSound("ding");
    showToast("Tugas ditambah! (+5 XP)", "success");
  }
  saveDB("tasks", tasks);
  document.getElementById("taskInput").value = "";
  document.getElementById("taskDate").value = "";
  loadTasks();
}

function loadTaskToEdit(id) {
  const task = cachedData.tasks.find((t) => t.id === id);
  if (task) {
    document.getElementById("taskInput").value = task.text;
    document.getElementById("taskDate").value = task.date;
    document.getElementById("taskPriority").value = task.priority;
    editingTaskId = id;
    document.getElementById("addTaskBtn").innerHTML = `Simpan`;
    document.getElementById("taskInput").focus();
  }
}

function loadTasks() {
  const list = document.getElementById("taskList");
  const tasks = cachedData.tasks || [];
  list.innerHTML = "";
  const total = tasks.length;
  const done = tasks.filter((t) => t.completed).length;
  const pct = total ? Math.round((done / total) * 100) : 0;
  document.getElementById("taskProgressText").innerText = `${pct}%`;
  document.getElementById("taskProgressPath").style.strokeDasharray =
    `${pct}, 100`;

  const search = document.getElementById("searchTaskInput").value.toLowerCase();
  let filtered = tasks.filter((t) => {
    if (taskFilter === "pending") return !t.completed;
    if (taskFilter === "completed") return t.completed;
    return t.text.toLowerCase().includes(search);
  });

  if (filtered.length === 0) {
    list.innerHTML = `<div class="empty-message"><i class="fas fa-clipboard-check"></i><p>Tidak ada tugas.</p></div>`;
    renderUrgentDeadlines(tasks);
    return;
  }

  filtered.sort((a, b) => {
    if (a.completed !== b.completed) return a.completed - b.completed;
    return new Date(a.date) - new Date(b.date);
  });

  filtered.forEach((t) => {
    const daysLeft = getDaysRemaining(t.date);
    let dateDisplay = `<i class="far fa-calendar"></i> ${formatDateIndo(
      t.date,
    )}`;
    let badgeClass = "deadline-far";
    if (daysLeft !== null && !t.completed) {
      if (daysLeft < 0) {
        dateDisplay = `⚠️ Telat ${Math.abs(daysLeft)} hari`;
        badgeClass = "deadline-urgent";
      } else if (daysLeft === 0) {
        dateDisplay = `🔥 HARI INI`;
        badgeClass = "deadline-urgent";
      } else if (daysLeft === 1) {
        dateDisplay = `⏰ Besok`;
        badgeClass = "deadline-near";
      } else {
        dateDisplay = `📅 ${daysLeft} Hari Lagi`;
        badgeClass = daysLeft <= 3 ? "deadline-near" : "deadline-far";
      }
    }
    const randomWord = funWords[Math.floor(Math.random() * funWords.length)];
    const li = document.createElement("li");
    li.className = `task-item priority-${t.priority} ${
      t.completed ? "completed" : ""
    }`;
    li.draggable = true;
    li.dataset.id = t.id;
    li.innerHTML = `<div class="task-content" style="display:flex;align-items:center;width:100%;"><div class="check-btn" onclick="toggleTask(${
      t.id
    })"><i class="fas fa-check"></i></div><div class="task-text"><span>${escapeHtml(
      t.text,
    )}</span><small class="${badgeClass}">${dateDisplay} • ${
      t.priority
    }</small></div><span class="fun-badge">${randomWord}</span></div><div class="task-actions"><button class="action-btn" onclick="loadTaskToEdit(${
      t.id
    })"><i class="fas fa-pencil-alt"></i></button><button class="action-btn delete" onclick="deleteTask(${
      t.id
    })"><i class="fas fa-trash"></i></button><i class="fas fa-grip-lines" style="cursor:move; color:#ccc; margin-left:10px;"></i></div>`;

    // Drag Events
    li.addEventListener("dragstart", function (e) {
      dragSrcEl = this;
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/html", this.innerHTML);
      this.style.opacity = "0.4";
    });
    li.addEventListener("dragover", function (e) {
      if (e.preventDefault) e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      return false;
    });
    li.addEventListener("drop", handleDrop);
    li.addEventListener("dragend", function () {
      this.style.opacity = "1";
    });

    list.appendChild(li);
  });
  renderUrgentDeadlines(tasks);
}

function handleDrop(e) {
  if (e.stopPropagation) {
    e.stopPropagation();
  }
  if (dragSrcEl !== this) {
    const idSrc = parseInt(dragSrcEl.dataset.id);
    const idDest = parseInt(this.dataset.id);
    const tasks = cachedData.tasks;
    const idxSrc = tasks.findIndex((t) => t.id === idSrc);
    const idxDest = tasks.findIndex((t) => t.id === idDest);
    if (idxSrc > -1 && idxDest > -1) {
      const [movedItem] = tasks.splice(idxSrc, 1);
      tasks.splice(idxDest, 0, movedItem);
      saveDB("tasks", tasks);
      loadTasks();
    }
  }
  return false;
}

function renderUrgentDeadlines(tasks) {
  const urgentList = document.getElementById("urgentList");
  if (!urgentList) return;
  urgentList.innerHTML = "";
  const urgentTasks = tasks.filter((t) => {
    const days = getDaysRemaining(t.date);
    return !t.completed && days !== null && days >= 0 && days <= 3;
  });
  if (urgentTasks.length === 0)
    urgentList.innerHTML =
      '<div style="text-align:center;color:var(--text-sub);padding:10px;">Aman! Tidak ada deadline dekat. 🎉</div>';
  else {
    urgentTasks.forEach((t) => {
      const days = getDaysRemaining(t.date);
      let textDay =
        days === 0 ? "Hari Ini!" : days === 1 ? "Besok" : `${days} Hari`;
      urgentList.innerHTML += `<li class="urgent-item"><span>${escapeHtml(
        t.text,
      )}</span><span class="urgent-days">${textDay}</span></li>`;
    });
  }
}

function toggleTask(id) {
  const tasks = cachedData.tasks;
  const t = tasks.find((x) => x.id === id);
  if (t) {
    t.completed = !t.completed;
    if (t.completed) {
      playSuccessSound("ding");
      addXP(10);
      showToast("Tugas Selesai! (+10 XP)", "success");
    }
    saveDB("tasks", tasks);
    loadTasks();
  }
}
window.deleteTask = function (id) {
  showCustomConfirm("Hapus tugas ini secara permanen?", () => {
    const tasks = cachedData.tasks.filter((x) => x.id !== id);
    saveDB("tasks", tasks);
    loadTasks();
    showToast("Tugas dihapus", "success");
  });
};
window.clearCompletedTasks = function () {
  showCustomConfirm("Bersihkan semua tugas yang sudah selesai?", () => {
    const tasks = cachedData.tasks.filter((t) => !t.completed);
    saveDB("tasks", tasks);
    loadTasks();
    showToast("Tugas selesai dibersihkan", "success");
  });
};

function addTransaction(type) {
  const desc = escapeHtml(document.getElementById("moneyDesc").value);
  const amount = parseInt(document.getElementById("moneyAmount").value);
  const wallet = document.getElementById("selectedWallet").value;
  const category = document.getElementById("txnCategory").value;
  if (!desc || !amount || amount <= 0)
    return showToast("Data tidak valid!", "error");
  const newTxn = {
    id: Date.now(),
    desc,
    amount,
    type,
    wallet,
    category,
    date: new Date().toISOString().split("T")[0],
  };
  let txns = cachedData.transactions;
  txns.push(newTxn);
  if (type === "in") {
    addXP(5);
    playSuccessSound("coin");
  }
  saveDB("transactions", txns);
  document.getElementById("moneyDesc").value = "";
  document.getElementById("moneyAmount").value = "";
  showToast(
    `${type === "in" ? "Masuk" : "Keluar"} tercatat!`,
    type === "in" ? "success" : "error",
  );
  loadTransactions();
}

function loadTransactions() {
  const list = document.getElementById("transactionList");
  const txns = cachedData.transactions || [];
  const filter = document.getElementById("historyFilter").value;
  let bal = { total: 0, dana: 0, ovo: 0, gopay: 0, cash: 0 };
  list.innerHTML = "";
  txns.forEach((t) => {
    if (t.type === "in") {
      bal.total += t.amount;
      bal[t.wallet] += t.amount;
    } else {
      bal.total -= t.amount;
      bal[t.wallet] -= t.amount;
    }
  });
  txns
    .slice()
    .reverse()
    .forEach((t) => {
      let show =
        filter === "all" ||
        (filter === "in" && t.type === "in") ||
        (filter === "out" && t.type === "out");
      if (show) {
        const color = t.type === "in" ? "var(--green)" : "var(--red)";
        const sign = t.type === "in" ? "+" : "-";
        list.innerHTML += `<li class="txn-item"><div class="txn-left"><b>${escapeHtml(
          t.desc,
        )}</b><small>${t.wallet.toUpperCase()} • ${
          t.category
        }</small></div><div class="txn-right"><b style="color:${color}">${sign} Rp ${t.amount.toLocaleString(
          "id-ID",
        )}</b><button class="delete-txn-btn" onclick="delTxn(${
          t.id
        })"><i class="fas fa-trash"></i></button></div></li>`;
      }
    });
  document.getElementById("totalBalance").innerText =
    "Rp " + bal.total.toLocaleString("id-ID");
  ["dana", "ovo", "gopay", "cash"].forEach(
    (k) =>
      (document.getElementById(`saldo-${k}`).innerText =
        "Rp " + bal[k].toLocaleString("id-ID")),
  );
  renderExpenseChart(txns);
}
// --- LOGIKA SENSOR SALDO (PRIVACY) ---
let isBalanceHidden = localStorage.getItem("hideBalance") === "true";

function toggleBalanceVisibility() {
  isBalanceHidden = !isBalanceHidden;
  localStorage.setItem("hideBalance", isBalanceHidden); // Simpan preferensi
  applyBalancePrivacy();
}

function applyBalancePrivacy() {
  const icon = document.getElementById("eyeIcon");
  const targets = [
    "totalBalance",
    "saldo-dana",
    "saldo-ovo",
    "saldo-gopay",
    "saldo-cash",
  ];

  // Ubah Ikon Mata
  if (icon) {
    icon.className = isBalanceHidden ? "fas fa-eye-slash" : "fas fa-eye";
  }

  // Terapkan Efek Blur ke semua elemen saldo
  targets.forEach((id) => {
    const el = document.getElementById(id);
    if (el) {
      if (isBalanceHidden) {
        el.classList.add("balance-blur");
      } else {
        el.classList.remove("balance-blur");
      }
    }
  });
}
window.delTxn = function (id) {
  showCustomConfirm(
    "Hapus riwayat transaksi ini? Saldo akan dikembalikan.",
    () => {
      const t = cachedData.transactions.filter((x) => x.id !== id);
      saveDB("transactions", t);
      loadTransactions();
      showToast("Transaksi dihapus", "success");
    },
  );
};
window.exportFinanceReport = function () {
  const txns = cachedData.transactions || [];
  if (txns.length === 0) return showToast("Belum ada data keuangan!", "error");

  const userName = currentUser || "Pengguna";
  const dateStr = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // --- 1. SIAPKAN DATA ---
  let wallets = { dana: 0, ovo: 0, gopay: 0, cash: 0, lainnya: 0 };
  let categoryStats = {}; // [BARU] Variabel untuk menampung total per kategori
  let totalMasuk = 0;
  let totalKeluar = 0;

  // Header Style untuk Excel
  const styleTitle = {
    font: { bold: true, sz: 14, color: { rgb: "FFFFFF" } },
    fill: { fgColor: { rgb: "4F46E5" } },
    alignment: { horizontal: "center" },
  };
  const styleSubHeader = {
    font: { bold: true },
    fill: { fgColor: { rgb: "E5E7EB" } },
  };
  const styleHeaderCol = {
    font: { bold: true, color: { rgb: "FFFFFF" } },
    fill: { fgColor: { rgb: "6B7280" } },
    alignment: { horizontal: "center" },
  };

  // Baris Awal Excel
  let dataRows = [
    [{ v: "LAPORAN KEUANGAN: " + userName.toUpperCase(), s: styleTitle }],
    [{ v: "Tanggal: " + dateStr, s: { alignment: { horizontal: "center" } } }],
    [], // Spasi
  ];

  // --- 2. HITUNG RINGKASAN & KATEGORI ---
  txns.forEach((t) => {
    let w = t.wallet ? t.wallet.toLowerCase() : "lainnya";
    if (!wallets.hasOwnProperty(w)) w = "lainnya";

    if (t.type === "in") {
      wallets[w] += t.amount;
      totalMasuk += t.amount;
    } else {
      wallets[w] -= t.amount;
      totalKeluar += t.amount;

      // [BARU] Hitung Total Per Kategori (Hanya Pengeluaran)
      let cat = t.category || "Tanpa Kategori";
      categoryStats[cat] = (categoryStats[cat] || 0) + t.amount;
    }
  });

  // Masukkan Ringkasan Saldo ke Tabel
  dataRows.push([{ v: "RINGKASAN SALDO", s: styleSubHeader }]);
  dataRows.push([
    "Total Pemasukan",
    { v: totalMasuk, t: "n", z: '"Rp" #,##0' },
  ]);
  dataRows.push([
    "Total Pengeluaran",
    { v: totalKeluar, t: "n", z: '"Rp" #,##0' },
  ]);
  dataRows.push([
    "Saldo Bersih",
    {
      v: totalMasuk - totalKeluar,
      t: "n",
      z: '"Rp" #,##0',
      s: {
        font: {
          bold: true,
          color: { rgb: totalMasuk >= totalKeluar ? "10B981" : "EF4444" },
        },
      },
    },
  ]);
  dataRows.push([]); // Spasi

  // [BARU] Masukkan Ringkasan Kategori ke Tabel
  if (Object.keys(categoryStats).length > 0) {
    dataRows.push([
      { v: "RINCIAN PENGELUARAN PER KATEGORI", s: styleSubHeader },
    ]);

    // Urutkan dari pengeluaran terbesar
    Object.keys(categoryStats)
      .sort((a, b) => categoryStats[b] - categoryStats[a])
      .forEach((cat) => {
        dataRows.push([
          cat,
          { v: categoryStats[cat], t: "n", z: '"Rp" #,##0' },
        ]);
      });
    dataRows.push([]); // Spasi
  }

  // --- 3. RINCIAN TRANSAKSI PER DOMPET ---
  const walletKeys = ["cash", "dana", "ovo", "gopay"];

  walletKeys.forEach((w) => {
    const wTxns = txns.filter(
      (t) => (t.wallet || "lainnya").toLowerCase() === w,
    );

    if (wTxns.length > 0) {
      dataRows.push([
        {
          v: `DOMPET: ${w.toUpperCase()} (Sisa Saldo: Rp ${wallets[w].toLocaleString("id-ID")})`,
          s: { font: { bold: true, color: { rgb: "4F46E5" } } },
        },
      ]);

      dataRows.push([
        { v: "No", s: styleHeaderCol },
        { v: "Tanggal", s: styleHeaderCol },
        { v: "Keterangan", s: styleHeaderCol },
        { v: "Kategori", s: styleHeaderCol }, // Kolom Kategori sudah ada
        { v: "Tipe", s: styleHeaderCol },
        { v: "Jumlah", s: styleHeaderCol },
      ]);

      wTxns.reverse().forEach((t, idx) => {
        const isMasuk = t.type === "in";
        const color = isMasuk ? "10B981" : "EF4444";

        dataRows.push([
          { v: idx + 1, s: { alignment: { horizontal: "center" } } },
          { v: t.date, s: { alignment: { horizontal: "center" } } },
          { v: t.desc },
          { v: t.category }, // Kategori otomatis muncul sesuai input baru
          {
            v: isMasuk ? "Masuk" : "Keluar",
            s: { alignment: { horizontal: "center" } },
          },
          {
            v: t.amount,
            t: "n",
            z: '"Rp" #,##0',
            s: { font: { color: { rgb: color }, bold: true } },
          },
        ]);
      });
      dataRows.push([]);
    }
  });

  // --- 4. GENERATE FILE EXCEL ---
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(dataRows);

  ws["!cols"] = [
    { wch: 5 },
    { wch: 12 },
    { wch: 25 },
    { wch: 15 },
    { wch: 10 },
    { wch: 15 },
  ];
  ws["!merges"] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 5 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 5 } },
  ];

  XLSX.utils.book_append_sheet(wb, ws, "Laporan Keuangan");

  const fileName = `Laporan_${userName.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.xlsx`;
  XLSX.writeFile(wb, fileName);

  showToast("Laporan Excel Diperbarui & Didownload! 📊", "success");
  playSuccessSound("ding");
};
function loadTarget() {
  const uid = window.auth.currentUser ? window.auth.currentUser.uid : null;
  if (!uid) return;
  const target = parseInt(localStorage.getItem(`${uid}_target`) || 0);
  const saving = cachedData.transactions.reduce(
    (acc, t) =>
      t.category === "Tabungan"
        ? t.type === "in"
          ? acc + t.amount
          : acc - t.amount
        : acc,
    0,
  );
  document.getElementById("targetAmount").innerText =
    "Rp " + target.toLocaleString("id-ID");
  const pct =
    target > 0 ? Math.min((Math.max(saving, 0) / target) * 100, 100) : 0;
  document.getElementById("targetProgressBar").style.width = `${pct}%`;
  document.getElementById("targetPercentage").innerText = `${pct.toFixed(
    1,
  )}% (Rp ${Math.max(saving, 0).toLocaleString("id-ID")})`;
}

function loadSoundSettings() {
  const uid = window.auth.currentUser ? window.auth.currentUser.uid : null;
  if (uid)
    soundPreference = localStorage.getItem(`${uid}_soundPreference`) || "bell";
  if (document.getElementById("pomodoroSoundSelect"))
    document.getElementById("pomodoroSoundSelect").value = soundPreference;
}
function saveSoundSettings() {
  const uid = window.auth.currentUser.uid;
  soundPreference = document.getElementById("pomodoroSoundSelect").value;
  localStorage.setItem(`${uid}_soundPreference`, soundPreference);
  document.getElementById("soundModal").style.display = "none";
  showToast("Disimpan!", "success");
}
function showSoundSettings() {
  document.getElementById("soundModal").style.display = "flex";
}
function checkExamMode() {
  const financeCard = document.getElementById("financeCard");
  if (financeCard) financeCard.style.display = isExamMode ? "none" : "block";
  timeLeft = isExamMode ? WORK_DURATION_EXAM : WORK_DURATION_DEFAULT;
  updateTimerDisplay();
}
function toggleExamMode() {
  isExamMode = !isExamMode;
  saveSetting("isExamMode", isExamMode);
  checkExamMode();
  showToast(isExamMode ? "Mode Ujian AKTIF" : "Mode Ujian NONAKTIF", "info");
}
function checkReminders() {
  if (!jadwalData) return;
  const now = new Date();
  const m = now.getHours() * 60 + now.getMinutes();
  const d = days[now.getDay()];
  let displayType =
    currentWeekType === "auto"
      ? getWeekNumber(new Date()) % 2 !== 0
        ? "umum"
        : "produktif"
      : currentWeekType;
  if (jadwalData[displayType] && jadwalData[displayType][d]) {
    const data = jadwalData[displayType][d];
    data.forEach((i) => {
      const p = i.time.split("-");
      if (p.length >= 2) {
        const s = p[0].trim().replace(/\./g, ":").split(":").map(Number);
        if (m === s[0] * 60 + s[1] - 5)
          showToast(`🔔 5 Menit lagi: ${i.mapel}`, "info");
      }
    });
  }
}
function escapeHtml(text) {
  if (!text) return text;
  return String(text).replace(/[&<>"']/g, function (m) {
    return {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    }[m];
  });
}

function loadRandomQuote() {
  if (document.getElementById("motivationQuote")) {
    document.getElementById("motivationQuote").innerText = `"${
      motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]
    }"`;
  }
}

// [FIX] FUNGSI RESET DATA YANG SEBELUMNYA HILANG
window.confirmClearUserData = function () {
  const input = document.getElementById("clearDataConfirmationInput").value;
  if (input === "HAPUS") {
    if (confirm("Yakin hapus data lokal dan logout?")) {
      localStorage.clear();
      window.authSignOut(window.auth).then(() => location.reload());
    }
  } else {
    alert("Ketik HAPUS dengan benar untuk mengonfirmasi.");
  }
};

window.openClearDataModal = function () {
  document.getElementById("clearDataConfirmationInput").value = "";
  document.getElementById("clearDataModal").style.display = "flex";
};

function exportData() {
  const b = new Blob([JSON.stringify(cachedData)], {
    type: "application/json",
  });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(b);
  a.download = `${currentUser}_backup.json`;
  a.click();
}
window.toggleSettings = function () {
  document.getElementById("settingsDropdown").classList.toggle("active");
};
window.selectWallet = function (id, el) {
  document.getElementById("selectedWallet").value = id;
  document
    .querySelectorAll(".wallet-card")
    .forEach((c) => c.classList.remove("active"));
  el.classList.add("active");
};
window.importData = function (input) {
  const f = input.files[0];
  if (!f) return;
  const r = new FileReader();
  r.onload = function (e) {
    try {
      cachedData = JSON.parse(e.target.result);
      saveAllToCloud();
      showToast("Restored!", "success");
      setTimeout(() => location.reload(), 1000);
    } catch (err) {
      showToast("File rusak!", "error");
    }
  };
  r.readAsText(f);
};

let currentScheduleEdit = null;
function openScheduleEdit(day, idx) {
  currentScheduleEdit = { day, idx };
  let displayType =
    currentWeekType === "auto"
      ? getWeekNumber(new Date()) % 2 !== 0
        ? "umum"
        : "produktif"
      : currentWeekType;
  const item = jadwalData[displayType][day][idx];
  document.getElementById("editMapelName").value = item.mapel;
  document.getElementById("editMapelTime").value = item.time;
  document.getElementById("editMapelType").value = item.type;
  document.getElementById("scheduleEditModal").style.display = "flex";
}
function saveScheduleChanges() {
  const n = document.getElementById("editMapelName").value;
  const t = document.getElementById("editMapelTime").value;
  const type = document.getElementById("editMapelType").value;
  if (!n || !t) return showToast("Isi semua!", "error");
  const { day, idx } = currentScheduleEdit;
  let displayType =
    currentWeekType === "auto"
      ? getWeekNumber(new Date()) % 2 !== 0
        ? "umum"
        : "produktif"
      : currentWeekType;
  jadwalData[displayType][day][idx] = {
    ...jadwalData[displayType][day][idx],
    mapel: n,
    time: t,
    type,
  };
  saveDB("jadwalData", jadwalData);
  document.getElementById("scheduleEditModal").style.display = "none";
  showToast("Diupdate!", "success");
  renderSchedule();
}
function closeScheduleEditModal() {
  document.getElementById("scheduleEditModal").style.display = "none";
}
window.openAddScheduleModal = function () {
  document.getElementById("addScheduleDay").value = days[currentDayIdx];
  document.getElementById("addScheduleModal").style.display = "flex";
};
window.saveNewSchedule = function () {
  const w = document.getElementById("addScheduleWeekType").value;
  const d = document.getElementById("addScheduleDay").value;
  const m = document.getElementById("addScheduleMapel").value;
  const g = document.getElementById("addScheduleGuru").value;
  const t = document.getElementById("addScheduleTime").value;
  const ty = document.getElementById("addScheduleType").value;
  if (!m || !t) return showToast("Wajib isi!", "error");
  if (!jadwalData[w]) jadwalData[w] = {};
  if (!jadwalData[w][d]) jadwalData[w][d] = [];
  jadwalData[w][d].push({ mapel: m, guru: g, time: t, type: ty });
  jadwalData[w][d].sort((a, b) => a.time.localeCompare(b.time));
  saveDB("jadwalData", jadwalData);
  renderSchedule();
  document.getElementById("addScheduleModal").style.display = "none";
  showToast("Jadwal Baru!", "success");
};
window.deleteSchedule = function () {
  if (!currentScheduleEdit) return;
  showCustomConfirm("Hapus jadwal mata pelajaran ini?", () => {
    const { day, idx } = currentScheduleEdit;
    let displayType =
      currentWeekType === "auto"
        ? getWeekNumber(new Date()) % 2 !== 0
          ? "umum"
          : "produktif"
        : currentWeekType;

    if (jadwalData[displayType] && jadwalData[displayType][day]) {
      jadwalData[displayType][day].splice(idx, 1);
      saveDB("jadwalData", jadwalData);
      renderSchedule();
      closeScheduleEditModal();
      showToast("Jadwal berhasil dihapus!", "success");
    }
  });
};

// ==================== Z. ACHIEVEMENT SYSTEM (OPTIMIZED) ====================
// ==================== Z. ACHIEVEMENT SYSTEM (100 ITEMS) ====================

// Helper Functions untuk mempersingkat logic check
const getTotalFocus = (d) =>
  d.focusLogs ? Object.values(d.focusLogs).reduce((a, b) => a + b, 0) : 0;
const getBalance = (d) =>
  d.transactions
    ? d.transactions.reduce(
        (acc, t) => (t.type === "in" ? acc + t.amount : acc - t.amount),
        0,
      )
    : 0;
const getTxCount = (d) => (d.transactions ? d.transactions.length : 0);
const getTaskCount = (d) =>
  d.tasks ? d.tasks.filter((t) => t.completed).length : 0;
const hasCategory = (d, cat) =>
  d.transactions && d.transactions.some((t) => t.category === cat);
const isNight = () => {
  const h = new Date().getHours();
  return h >= 22 || h < 4;
};
const isMorning = () => {
  const h = new Date().getHours();
  return h >= 4 && h < 8;
};

const achievementsData = [
  // --- 1. PROGRESS & LEVEL (15 Items) ---
  {
    id: "newbie",
    title: "Murid Baru",
    desc: "Login pertama kali.",
    icon: "fas fa-baby",
    xp: 50,
    check: (d) => true,
  },
  {
    id: "lvl_2",
    title: "Naik Kelas",
    desc: "Capai Level 2.",
    icon: "fas fa-arrow-up",
    xp: 100,
    check: (d) => d.gamification.level >= 2,
  },
  {
    id: "lvl_5",
    title: "Bintang Kelas",
    desc: "Capai Level 5.",
    icon: "fas fa-star",
    xp: 200,
    check: (d) => d.gamification.level >= 5,
  },
  {
    id: "lvl_10",
    title: "Sepuh",
    desc: "Capai Level 10.",
    icon: "fas fa-crown",
    xp: 500,
    check: (d) => d.gamification.level >= 10,
  },
  {
    id: "lvl_20",
    title: "Grandmaster",
    desc: "Capai Level 20.",
    icon: "fas fa-chess-king",
    xp: 1000,
    check: (d) => d.gamification.level >= 20,
  },
  {
    id: "lvl_30",
    title: "Legend",
    desc: "Capai Level 30.",
    icon: "fas fa-dragon",
    xp: 1500,
    check: (d) => d.gamification.level >= 30,
  },
  {
    id: "lvl_40",
    title: "Mythic",
    desc: "Capai Level 40.",
    icon: "fas fa-dungeon",
    xp: 2000,
    check: (d) => d.gamification.level >= 40,
  },
  {
    id: "lvl_50",
    title: "Immortal",
    desc: "Capai Level 50.",
    icon: "fas fa-skull-crossbones",
    xp: 5000,
    check: (d) => d.gamification.level >= 50,
  },
  {
    id: "lvl_60",
    title: "Godlike",
    desc: "Capai Level 60.",
    icon: "fas fa-bolt",
    xp: 6000,
    check: (d) => d.gamification.level >= 60,
  },
  {
    id: "lvl_75",
    title: "Overlord",
    desc: "Capai Level 75.",
    icon: "fas fa-globe",
    xp: 7500,
    check: (d) => d.gamification.level >= 75,
  },
  {
    id: "lvl_100",
    title: "The Chosen One",
    desc: "Capai Level 100.",
    icon: "fas fa-infinity",
    xp: 10000,
    check: (d) => d.gamification.level >= 100,
  },
  {
    id: "xp_500",
    title: "Pemburu XP I",
    desc: "Total 500 XP.",
    icon: "fas fa-scroll",
    xp: 100,
    check: (d) => d.gamification.xp >= 500,
  },
  {
    id: "xp_1000",
    title: "Pemburu XP II",
    desc: "Total 1.000 XP.",
    icon: "fas fa-scroll",
    xp: 200,
    check: (d) => d.gamification.xp >= 1000,
  },
  {
    id: "xp_5000",
    title: "Pemburu XP III",
    desc: "Total 5.000 XP.",
    icon: "fas fa-scroll",
    xp: 500,
    check: (d) => d.gamification.xp >= 5000,
  },
  {
    id: "xp_10000",
    title: "Sultan XP",
    desc: "Total 10.000 XP.",
    icon: "fas fa-gem",
    xp: 1000,
    check: (d) => d.gamification.xp >= 10000,
  },

  // --- 2. TASKS / TUGAS (15 Items) ---
  {
    id: "task_1",
    title: "Langkah Awal",
    desc: "Selesaikan 1 tugas.",
    icon: "fas fa-check",
    xp: 20,
    check: (d) => getTaskCount(d) >= 1,
  },
  {
    id: "task_5",
    title: "Si Rajin",
    desc: "Selesaikan 5 tugas.",
    icon: "fas fa-check-double",
    xp: 50,
    check: (d) => getTaskCount(d) >= 5,
  },
  {
    id: "task_10",
    title: "Produktif",
    desc: "Selesaikan 10 tugas.",
    icon: "fas fa-list-ol",
    xp: 100,
    check: (d) => getTaskCount(d) >= 10,
  },
  {
    id: "task_25",
    title: "Mesin Tugas",
    desc: "Selesaikan 25 tugas.",
    icon: "fas fa-robot",
    xp: 250,
    check: (d) => getTaskCount(d) >= 25,
  },
  {
    id: "task_50",
    title: "Workaholic",
    desc: "Selesaikan 50 tugas.",
    icon: "fas fa-briefcase",
    xp: 500,
    check: (d) => getTaskCount(d) >= 50,
  },
  {
    id: "task_100",
    title: "Task Master",
    desc: "Selesaikan 100 tugas.",
    icon: "fas fa-medal",
    xp: 1000,
    check: (d) => getTaskCount(d) >= 100,
  },
  {
    id: "task_500",
    title: "Legenda Tugas",
    desc: "Selesaikan 500 tugas.",
    icon: "fas fa-trophy",
    xp: 5000,
    check: (d) => getTaskCount(d) >= 500,
  },
  {
    id: "task_clean",
    title: "Inbox Zero",
    desc: "Semua tugas selesai.",
    icon: "fas fa-sparkles",
    xp: 50,
    check: (d) =>
      d.tasks.length > 0 && d.tasks.filter((t) => !t.completed).length === 0,
  },
  {
    id: "task_high",
    title: "Prioritas Tinggi",
    desc: "Selesaikan 1 tugas Prioritas Tinggi.",
    icon: "fas fa-exclamation-circle",
    xp: 30,
    check: (d) => d.tasks.some((t) => t.completed && t.priority === "High"),
  },
  {
    id: "task_3_high",
    title: "Manajemen Krisis",
    desc: "Selesaikan 3 tugas Prioritas Tinggi.",
    icon: "fas fa-fire-extinguisher",
    xp: 100,
    check: (d) =>
      d.tasks.filter((t) => t.completed && t.priority === "High").length >= 3,
  },
  {
    id: "task_student",
    title: "Pelajar Teladan",
    desc: 'Selesaikan tugas dengan kata "Belajar" atau "PR".',
    icon: "fas fa-book",
    xp: 50,
    check: (d) =>
      d.tasks.some(
        (t) => t.completed && /belajar|pr|tugas|ujian/i.test(t.text),
      ),
  },
  {
    id: "task_shop",
    title: "Anak Belanja",
    desc: 'Selesaikan tugas dengan kata "Beli".',
    icon: "fas fa-shopping-cart",
    xp: 30,
    check: (d) =>
      d.tasks.some((t) => t.completed && /beli|belanja/i.test(t.text)),
  },
  {
    id: "task_deadline",
    title: "Just in Time",
    desc: "Selesaikan tugas tepat di hari deadline.",
    icon: "fas fa-stopwatch",
    xp: 50,
    check: (d) =>
      d.tasks.some(
        (t) => t.completed && t.date === new Date().toLocaleDateString("en-CA"),
      ),
  },
  {
    id: "task_overdue",
    title: "Better Late",
    desc: "Selesaikan tugas yang sudah lewat deadline.",
    icon: "fas fa-history",
    xp: 20,
    check: (d) =>
      d.tasks.some(
        (t) =>
          t.completed && new Date(t.date) < new Date().setHours(0, 0, 0, 0),
      ),
  },

  // --- 3. FOKUS / POMODORO (15 Items) ---
  {
    id: "focus_25",
    title: "Fokus Pemula",
    desc: "Fokus total 25 menit.",
    icon: "fas fa-clock",
    xp: 30,
    check: (d) => getTotalFocus(d) >= 25,
  },
  {
    id: "focus_60",
    title: "Satu Jam",
    desc: "Fokus total 1 jam.",
    icon: "fas fa-hourglass-start",
    xp: 60,
    check: (d) => getTotalFocus(d) >= 60,
  },
  {
    id: "focus_300",
    title: "Deep Work",
    desc: "Fokus total 5 jam.",
    icon: "fas fa-brain",
    xp: 300,
    check: (d) => getTotalFocus(d) >= 300,
  },
  {
    id: "focus_600",
    title: "Dedikasi",
    desc: "Fokus total 10 jam.",
    icon: "fas fa-hourglass-half",
    xp: 600,
    check: (d) => getTotalFocus(d) >= 600,
  },
  {
    id: "focus_1500",
    title: "Grindset",
    desc: "Fokus total 25 jam (Sehari Penuh!).",
    icon: "fas fa-calendar-day",
    xp: 1500,
    check: (d) => getTotalFocus(d) >= 1500,
  },
  {
    id: "focus_3000",
    title: "Master Fokus",
    desc: "Fokus total 50 jam.",
    icon: "fas fa-calendar-week",
    xp: 3000,
    check: (d) => getTotalFocus(d) >= 3000,
  },
  {
    id: "focus_6000",
    title: "Zen Mode",
    desc: "Fokus total 100 jam.",
    icon: "fas fa-yin-yang",
    xp: 5000,
    check: (d) => getTotalFocus(d) >= 6000,
  },
  {
    id: "focus_exam",
    title: "Mode Ujian",
    desc: "Aktifkan Mode Ujian sekali.",
    icon: "fas fa-graduation-cap",
    xp: 20,
    check: (d) => d.settings.isExamMode,
  },
  {
    id: "focus_night",
    title: "Night Owl",
    desc: "Fokus di atas jam 10 malam.",
    icon: "fas fa-moon",
    xp: 50,
    check: (d) => getTotalFocus(d) > 0 && isNight(),
  },
  {
    id: "focus_morning",
    title: "Early Bird",
    desc: "Fokus sebelum jam 8 pagi.",
    icon: "fas fa-sun",
    xp: 50,
    check: (d) => getTotalFocus(d) > 0 && isMorning(),
  },

  // --- 4. KEUANGAN (20 Items) ---
  {
    id: "rich_100k",
    title: "Tabungan Awal",
    desc: "Saldo mencapai Rp 100.000.",
    icon: "fas fa-coins",
    xp: 50,
    check: (d) => getBalance(d) >= 100000,
  },
  {
    id: "rich_500k",
    title: "Calon Sultan",
    desc: "Saldo mencapai Rp 500.000.",
    icon: "fas fa-money-bill-wave",
    xp: 100,
    check: (d) => getBalance(d) >= 500000,
  },
  {
    id: "rich_1m",
    title: "Jutawan",
    desc: "Saldo mencapai Rp 1.000.000.",
    icon: "fas fa-sack-dollar",
    xp: 200,
    check: (d) => getBalance(d) >= 1000000,
  },
  {
    id: "rich_5m",
    title: "High Class",
    desc: "Saldo mencapai Rp 5.000.000.",
    icon: "fas fa-gem",
    xp: 500,
    check: (d) => getBalance(d) >= 5000000,
  },
  {
    id: "rich_10m",
    title: "Crazy Rich",
    desc: "Saldo mencapai Rp 10.000.000.",
    icon: "fas fa-crown",
    xp: 1000,
    check: (d) => getBalance(d) >= 10000000,
  },
  {
    id: "tx_1",
    title: "Transaksi Pertama",
    desc: "Catat 1 transaksi.",
    icon: "fas fa-pen",
    xp: 10,
    check: (d) => getTxCount(d) >= 1,
  },
  {
    id: "tx_10",
    title: "Pencatat Rutin",
    desc: "Catat 10 transaksi.",
    icon: "fas fa-book-open",
    xp: 50,
    check: (d) => getTxCount(d) >= 10,
  },
  {
    id: "tx_50",
    title: "Akuntan",
    desc: "Catat 50 transaksi.",
    icon: "fas fa-calculator",
    xp: 250,
    check: (d) => getTxCount(d) >= 50,
  },
  {
    id: "tx_100",
    title: "Bendahara",
    desc: "Catat 100 transaksi.",
    icon: "fas fa-file-invoice-dollar",
    xp: 500,
    check: (d) => getTxCount(d) >= 100,
  },
  {
    id: "cat_jajan",
    title: "Tukang Jajan",
    desc: "Catat pengeluaran kategori Jajan.",
    icon: "fas fa-utensils",
    xp: 20,
    check: (d) => hasCategory(d, "Jajan"),
  },
  {
    id: "cat_nabung",
    title: "Rajin Menabung",
    desc: "Catat pemasukan kategori Tabungan.",
    icon: "fas fa-piggy-bank",
    xp: 50,
    check: (d) => hasCategory(d, "Tabungan"),
  },
  {
    id: "cat_transport",
    title: "Anak Motor",
    desc: "Catat pengeluaran kategori Transport.",
    icon: "fas fa-motorcycle",
    xp: 20,
    check: (d) => hasCategory(d, "Transport"),
  },
  {
    id: "wallet_dana",
    title: "Digital User",
    desc: "Pakai dompet DANA/OVO/GOPAY.",
    icon: "fas fa-mobile-alt",
    xp: 30,
    check: (d) =>
      d.transactions &&
      d.transactions.some((t) => ["dana", "ovo", "gopay"].includes(t.wallet)),
  },
  {
    id: "broke_af",
    title: "Krisis Moneter",
    desc: "Saldo 0 atau minus.",
    icon: "fas fa-heart-broken",
    xp: 10,
    check: (d) => getBalance(d) <= 0,
  },
  {
    id: "transfer_king",
    title: "Raja Transfer",
    desc: "Lakukan Transfer antar dompet.",
    icon: "fas fa-exchange-alt",
    xp: 30,
    check: (d) =>
      d.transactions && d.transactions.some((t) => t.category === "Transfer"),
  },

  // --- 5. STREAK / KONSISTENSI (10 Items) ---
  {
    id: "streak_3",
    title: "Pemanasan",
    desc: "Login 3 hari berturut-turut.",
    icon: "fas fa-fire",
    xp: 30,
    check: (d) => d.streak.count >= 3,
  },
  {
    id: "streak_7",
    title: "On Fire!",
    desc: "Login 1 minggu berturut-turut.",
    icon: "fas fa-fire-alt",
    xp: 70,
    check: (d) => d.streak.count >= 7,
  },
  {
    id: "streak_14",
    title: "Dua Minggu",
    desc: "Login 14 hari berturut-turut.",
    icon: "fas fa-calendar-check",
    xp: 140,
    check: (d) => d.streak.count >= 14,
  },
  {
    id: "streak_30",
    title: "Sebulan Penuh",
    desc: "Login 30 hari berturut-turut.",
    icon: "fas fa-calendar-alt",
    xp: 300,
    check: (d) => d.streak.count >= 30,
  },
  {
    id: "streak_60",
    title: "Dua Bulan",
    desc: "Login 60 hari berturut-turut.",
    icon: "fas fa-medal",
    xp: 600,
    check: (d) => d.streak.count >= 60,
  },
  {
    id: "streak_90",
    title: "Tiga Bulan",
    desc: "Login 90 hari berturut-turut.",
    icon: "fas fa-trophy",
    xp: 900,
    check: (d) => d.streak.count >= 90,
  },
  {
    id: "streak_100",
    title: "Century Club",
    desc: "Login 100 hari berturut-turut.",
    icon: "fas fa-crown",
    xp: 1000,
    check: (d) => d.streak.count >= 100,
  },
  {
    id: "streak_180",
    title: "Setengah Tahun",
    desc: "Login 180 hari berturut-turut.",
    icon: "fas fa-star-half-alt",
    xp: 2000,
    check: (d) => d.streak.count >= 180,
  },
  {
    id: "streak_365",
    title: "Setahun Penuh",
    desc: "Login 365 hari berturut-turut.",
    icon: "fas fa-sun",
    xp: 5000,
    check: (d) => d.streak.count >= 365,
  },

  // --- 6. SCHEDULE & NOTES (10 Items) ---
  {
    id: "custom_sched",
    title: "Manager Jadwal",
    desc: "Tambah jadwal manual.",
    icon: "fas fa-edit",
    xp: 30,
    check: (d) => true,
  }, // Logic triggered manually in code
  {
    id: "note_taker",
    title: "Pencatat",
    desc: "Simpan catatan pada mapel.",
    icon: "fas fa-sticky-note",
    xp: 20,
    check: (d) => Object.keys(d.scheduleNotes || {}).length >= 1,
  },
  {
    id: "note_pro",
    title: "Rajin Mencatat",
    desc: "Simpan 5 catatan mapel.",
    icon: "fas fa-book",
    xp: 100,
    check: (d) => Object.keys(d.scheduleNotes || {}).length >= 5,
  },
  {
    id: "week_prod",
    title: "Minggu Produktif",
    desc: "Ganti ke Minggu Produktif.",
    icon: "fas fa-briefcase",
    xp: 20,
    check: (d) => d.settings.weekType === "produktif",
  },
  {
    id: "week_chill",
    title: "Minggu Santai",
    desc: "Ganti ke Minggu Umum.",
    icon: "fas fa-coffee",
    xp: 20,
    check: (d) => d.settings.weekType === "umum",
  },

  // --- 7. SUBSCRIPTION & BUDGET (10 Items) ---
  {
    id: "sub_1",
    title: "Langganan",
    desc: "Punya 1 langganan aktif.",
    icon: "fas fa-receipt",
    xp: 30,
    check: (d) => d.subscriptions && d.subscriptions.length >= 1,
  },
  {
    id: "sub_3",
    title: "Kolektor Tagihan",
    desc: "Punya 3 langganan aktif.",
    icon: "fas fa-file-invoice",
    xp: 100,
    check: (d) => d.subscriptions && d.subscriptions.length >= 3,
  },
  {
    id: "budget_set",
    title: "Perencana",
    desc: "Set anggaran (budget) bulanan.",
    icon: "fas fa-chart-pie",
    xp: 50,
    check: (d) => d.budgets && Object.values(d.budgets).some((v) => v > 0),
  },
  {
    id: "target_saver",
    title: "Punya Mimpi",
    desc: "Set target tabungan.",
    icon: "fas fa-bullseye",
    xp: 50,
    check: (d) =>
      localStorage.getItem(window.auth.currentUser?.uid + "_target") > 0,
  },

  // --- 8. EXTRAS & FUN (5 Items) ---
  {
    id: "dark_mode",
    title: "Dark Side",
    desc: "Gunakan Tema Gelap.",
    icon: "fas fa-moon",
    xp: 20,
    check: (d) => document.body.classList.contains("dark-mode"),
  },
  {
    id: "sound_on",
    title: "Audiophile",
    desc: "Ganti suara notifikasi.",
    icon: "fas fa-volume-up",
    xp: 20,
    check: (d) =>
      localStorage.getItem(
        window.auth.currentUser?.uid + "_soundPreference",
      ) !== "bell",
  },
  {
    id: "backup_data",
    title: "Safety First",
    desc: "Backup data kamu.",
    icon: "fas fa-download",
    xp: 50,
    check: (d) => true,
  }, // Check manually
  {
    id: "change_name",
    title: "Rebranding",
    desc: "Ganti nama panggilan.",
    icon: "fas fa-id-card",
    xp: 50,
    check: (d) => true,
  }, // Check manually
  {
    id: "music_lover",
    title: "Music Lover",
    desc: "Buka widget musik.",
    icon: "fas fa-music",
    xp: 10,
    check: (d) =>
      !document.getElementById("musicFrame").classList.contains("hidden-music"),
  },
];

// [FIX] Cek achievement secara otomatis saat data disimpan
function checkAchievements() {
  if (!cachedData.unlockedAchievements) cachedData.unlockedAchievements = [];
  let newUnlock = false;

  achievementsData.forEach((ach) => {
    const isUnlocked = ach.check(cachedData);
    const alreadyClaimed = cachedData.unlockedAchievements.includes(ach.id);

    if (isUnlocked && !alreadyClaimed) {
      addXP(ach.xp);
      cachedData.unlockedAchievements.push(ach.id);
      showToast(`🏆 Achievement: ${ach.title} (+${ach.xp} XP)`, "success");
      playSuccessSound("coin");
      newUnlock = true;
    }
  });

  if (newUnlock) {
    const uid = window.auth.currentUser.uid;
    window.dbSet(
      window.dbRef(window.db, `users/${uid}/unlockedAchievements`),
      cachedData.unlockedAchievements,
    );
  }
}

window.openAchievementModal = function () {
  const listContainer = document.getElementById("achievementList");
  const badge = document.getElementById("achievementCountBadge");

  if (!cachedData.unlockedAchievements) cachedData.unlockedAchievements = [];

  listContainer.innerHTML = "";
  let unlockedCount = 0;

  achievementsData.forEach((ach) => {
    const isUnlocked =
      cachedData.unlockedAchievements.includes(ach.id) || ach.check(cachedData);
    if (isUnlocked) unlockedCount++;

    const itemClass = isUnlocked ? "unlocked" : "locked";
    const statusIcon = isUnlocked
      ? '<i class="fas fa-check-circle ach-status"></i>'
      : '<i class="fas fa-lock ach-status lock-icon"></i>';
    const titleColor = isUnlocked ? "var(--primary)" : "inherit";
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
  document.getElementById("achievementModal").style.display = "flex";

  if (document.getElementById("settingsDropdown")) {
    document.getElementById("settingsDropdown").classList.remove("active");
  }
};

// --- FITUR BUDGETING (MONE PLUS) ---

// 1. Buka Modal Setting Budget
window.openBudgetModal = function () {
  const cats = [
    "Jajan",
    "Transport",
    "Belanja",
    "Sedekah",
    "Tagihan",
    "Laundry",
    "Skincare",
    "Nongkrong",
    "Kondangan",
    "Parkir",
    "Hiburan",
    "Cicilan",
    "Lainnya",
  ];

  let html = "";

  if (!cachedData.budgets) cachedData.budgets = {};

  cats.forEach((c) => {
    const currentLimit = cachedData.budgets[c] || 0;
    html += `
            <div class="form-group" style="margin-bottom:0;">
                <label style="font-size:0.8rem; color:var(--text-sub); font-weight:600;">${c}</label>
                <input type="number" id="budget-${c}" value="${currentLimit}" placeholder="0" class="sub-input" style="padding:8px;">
            </div>
        `;
  });

  const modalContent = `
        <div id="budgetModal" class="modal-backdrop" style="display:flex;">
            <div class="modal-content fade-in-up" style="max-width:500px;"> <div class="modal-head">
                    <h3>💰 Atur Anggaran</h3>
                    <button class="close-icon" onclick="document.getElementById('budgetModal').remove()">×</button>
                </div>
                <div class="modal-body" style="padding-top:0;">
                    <p style="font-size:0.8rem; color:var(--text-sub); margin-bottom:15px;">Tentukan batas maksimal (Rp) per kategori:</p>
                    
                    <div class="budget-grid-container">
                        ${html}
                    </div>
                    
                </div>
                <div class="modal-foot">
                    <button onclick="saveBudgets()" class="btn-primary btn-block">Simpan Anggaran</button>
                </div>
            </div>
        </div>
    `;
  document.body.insertAdjacentHTML("beforeend", modalContent);
};
// Kita pakai modal jadwal yg sudah ada tapi ubah isinya (biar hemat kode)
// Atau bisa buat modal baru lewat JS

// 2. Simpan Data Budget
window.saveBudgets = function () {
  const cats = ["Jajan", "Transport", "Belanja", "Lainnya"];
  if (!cachedData.budgets) cachedData.budgets = {};

  cats.forEach((c) => {
    const val = document.getElementById(`budget-${c}`).value;
    cachedData.budgets[c] = parseInt(val) || 0;
  });

  saveDB("budgets", cachedData.budgets); // Simpan ke Firebase
  document.getElementById("budgetModal").remove();
  showToast("Anggaran tersimpan! 🎯", "success");
  renderExpenseChart(cachedData.transactions); // Refresh chart
};

function renderExpenseChart(txns) {
  const container = document.getElementById("expenseChartContainer");
  let total = 0;
  let cats = {};

  // Hitung pengeluaran per kategori
  txns.forEach((t) => {
    if (t.type === "out") {
      total += t.amount;
      cats[t.category] = (cats[t.category] || 0) + t.amount;
    }
  });

  // Tambahkan Tombol "Atur Budget" di atas chart jika belum ada
  if (!document.getElementById("btnSetBudget")) {
    const btnHtml = `<button id="btnSetBudget" onclick="openBudgetModal()" class="btn-text-danger" style="width:100%; margin-bottom:10px; border:1px dashed var(--border-color); font-size:0.8rem;"><i class="fas fa-cog"></i> Atur Batas Anggaran</button>`;
    container.insertAdjacentHTML("beforebegin", btnHtml);
  }

  if (total === 0) {
    container.innerHTML = `<div class="empty-message small"><p>Belum ada pengeluaran.</p></div>`;
    return;
  }

  let html = "";
  const colors = {
    Jajan: "#f97316", // Oranye
    Transport: "#3b82f6", // Biru
    Belanja: "#8b5cf6", // Ungu
    Tabungan: "#10b981", // Hijau
    Sedekah: "#14b8a6", // Teal (Hijau Laut)
    Tagihan: "#eab308", // Kuning Gelap
    Laundry: "#06b6d4", // Cyan
    Skincare: "#ec4899", // Pink
    Nongkrong: "#854d0e", // Coklat Kopi
    Kondangan: "#db2777", // Pink Tua
    Parkir: "#64748b", // Abu-abu
    Hiburan: "#6366f1", // Indigo
    Cicilan: "#ef4444", // Merah (Warning)
    Lainnya: "#6b7280", // Abu-abu Tua
  };

  // Render Bar Chart + Budget Status
  Object.keys(cats).forEach((c) => {
    const amount = cats[c];
    const budget =
      cachedData.budgets && cachedData.budgets[c] ? cachedData.budgets[c] : 0;
    const pctTotal = Math.round((amount / total) * 100);

    let budgetInfo = "";
    let barColor = colors[c] || "#ccc";
    let statusIcon = "";

    // Cek apakah over budget
    if (budget > 0) {
      const pctBudget = Math.round((amount / budget) * 100);
      if (pctBudget >= 100) {
        barColor = "#ef4444"; // Merah (Bahaya)
        statusIcon = "🔥 Over!";
        showToast(`Peringatan: Kategori ${c} sudah boros!`, "error"); // Notifikasi Toast
      } else if (pctBudget >= 80) {
        barColor = "#f59e0b"; // Kuning (Hati-hati)
        statusIcon = "⚠️";
      }
      budgetInfo = `<br><small style="font-size:0.65rem; color:${barColor};">Terpakai: Rp ${amount.toLocaleString(
        "id-ID",
      )} / Rp ${budget.toLocaleString(
        "id-ID",
      )} (${pctBudget}%) ${statusIcon}</small>`;
    } else {
      budgetInfo = `<br><small style="font-size:0.65rem; color:var(--text-sub);">Tidak ada batas</small>`;
    }

    html += `
        <div class="expense-item" style="margin-bottom:12px;">
            <div class="expense-label" style="align-items:flex-start;">
                <span class="dot" style="background:${
                  colors[c] || "#ccc"
                }; margin-top:5px;"></span>
                <div style="line-height:1.2;">
                    ${c}
                    ${budgetInfo}
                </div>
            </div>
            <div class="expense-value">
                Rp ${amount.toLocaleString("id-ID")} 
                <div class="expense-bar-bg" style="width:80px; height:6px; margin-left:auto; margin-top:5px; background:var(--border-color);">
                    <div class="expense-bar-fill" style="width:${Math.min(
                      100,
                      budget > 0 ? (amount / budget) * 100 : pctTotal,
                    )}%; background:${barColor};"></div>
                </div>
            </div>
        </div>`;
  });
  container.innerHTML = html;
}
// Buka/Tutup Modal
function toggleTransferModal() {
  const modal = document.getElementById("transferModal");
  modal.style.display = modal.style.display === "none" ? "flex" : "none";
}

// Proses Transfer
// GANTI FUNGSI executeTransfer DENGAN INI
function executeTransfer() {
  const source = document.getElementById("sourceWallet").value;
  const target = document.getElementById("targetWallet").value;
  const amount = parseFloat(document.getElementById("transferAmount").value);

  // 1. Validasi
  if (source === target)
    return showToast("Dompet asal dan tujuan sama!", "error");
  if (!amount || amount <= 0) return showToast("Jumlah tidak valid!", "error");

  // 2. Cek Saldo Pengirim (Hitung dulu saldo saat ini)
  const txns = cachedData.transactions || [];
  let currentBalance = 0;
  txns.forEach((t) => {
    if ((t.wallet || "cash") === source) {
      if (t.type === "in") currentBalance += t.amount;
      else currentBalance -= t.amount;
    }
  });

  if (currentBalance < amount) {
    return showToast(
      `Saldo ${source.toUpperCase()} tidak cukup! (Sisa: Rp ${currentBalance.toLocaleString()})`,
      "error",
    );
  }

  // 3. Eksekusi Transfer (Catat 2 Transaksi: Keluar & Masuk)
  const timestamp = Date.now();
  const dateStr = new Date().toISOString().split("T")[0];

  // Transaksi A: Uang Keluar dari Sumber
  const txnOut = {
    id: timestamp,
    desc: `Transfer ke ${target.toUpperCase()}`,
    amount: amount,
    type: "out",
    wallet: source,
    category: "Transfer",
    date: dateStr,
  };

  // Transaksi B: Uang Masuk ke Tujuan
  const txnIn = {
    id: timestamp + 1, // ID beda sedikit biar unik
    desc: `Transfer dari ${source.toUpperCase()}`,
    amount: amount,
    type: "in",
    wallet: target,
    category: "Transfer",
    date: dateStr,
  };

  // 4. Simpan ke Array & Database
  cachedData.transactions.push(txnOut);
  cachedData.transactions.push(txnIn);

  saveDB("transactions", cachedData.transactions);

  // 5. Reset & Update UI
  document.getElementById("transferAmount").value = "";
  toggleTransferModal();
  loadTransactions(); // Refresh tampilan saldo
  playSuccessSound("coin");
  showToast("Transfer Berhasil!", "success");
}
// ==================== SUBSCRIPTION MANAGER ====================

// 1. Buka Modal & Render
window.openSubModal = function () {
  renderSubscriptions();
  document.getElementById("subModal").style.display = "flex";
};

// 2. Render Daftar & Hitung Total
function renderSubscriptions() {
  const list = document.getElementById("subList");
  const totalEl = document.getElementById("totalSubCost");
  const subs = cachedData.subscriptions || [];

  list.innerHTML = "";
  let total = 0;

  if (subs.length === 0) {
    list.innerHTML =
      '<div class="empty-message small"><p>Belum ada langganan.</p></div>';
  } else {
    subs.forEach((sub, index) => {
      total += parseInt(sub.cost);

      // Hitung hari menuju tagihan
      const today = new Date().getDate();
      let diff = sub.date - today;
      let statusText =
        diff === 0
          ? "HARI INI!"
          : diff < 0
            ? "Sudah lewat"
            : `${diff} hari lagi`;
      if (diff < 0) statusText = `Tgl ${sub.date} depan`;

      const html = `
                <div class="sub-item">
                    <div class="sub-info">
                        <h4>${escapeHtml(sub.name)}</h4>
                        <small>📅 Tgl Tagihan: ${
                          sub.date
                        } (${statusText})</small>
                    </div>
                    <div style="display:flex; align-items:center;">
                        <div class="sub-cost">
                            <b>Rp ${parseInt(sub.cost).toLocaleString(
                              "id-ID",
                            )}</b>
                        </div>
                        <button class="btn-del-sub" onclick="deleteSubscription(${index})"><i class="fas fa-trash"></i></button>
                    </div>
                </div>
            `;
      list.innerHTML += html;
    });
  }

  totalEl.innerText = "Rp " + total.toLocaleString("id-ID");
}

// 3. Tambah Langganan
window.addSubscription = function () {
  const name = document.getElementById("subName").value;
  const cost = parseInt(document.getElementById("subCost").value);
  const date = parseInt(document.getElementById("subDate").value);

  if (!name || !cost || !date)
    return showToast("Lengkapi semua data!", "error");
  if (date < 1 || date > 31) return showToast("Tanggal harus 1-31", "error");
  if (cost <= 0)
    return showToast("Harga tidak boleh nol atau negatif!", "error");

  if (!cachedData.subscriptions) cachedData.subscriptions = [];

  cachedData.subscriptions.push({ name, cost, date });
  saveDB("subscriptions", cachedData.subscriptions);

  document.getElementById("subName").value = "";
  document.getElementById("subCost").value = "";
  document.getElementById("subDate").value = "";

  showToast("Langganan disimpan!", "success");
  renderSubscriptions();
};

// 4. Hapus Langganan
window.deleteSubscription = function (index) {
  showCustomConfirm("Berhenti berlangganan dan hapus dari daftar?", () => {
    cachedData.subscriptions.splice(index, 1);
    saveDB("subscriptions", cachedData.subscriptions);
    renderSubscriptions();
    showToast("Langganan dihapus.", "info");
  });
};

// 5. Cek Pengingat Otomatis (Panggil fungsi ini di initApp)
function checkSubscriptionReminders() {
  const subs = cachedData.subscriptions || [];
  const today = new Date().getDate();

  subs.forEach((sub) => {
    // Ingatkan jika tagihan jatuh tempo dalam 3 hari, 1 hari, atau Hari Ini
    const diff = sub.date - today;
    if (diff === 3)
      showToast(`🎗️ Siapkan dana: ${sub.name} bayar 3 hari lagi.`, "info");
    if (diff === 1) showToast(`⏰ Besok bayar tagihan ${sub.name}!`, "info");
    if (diff === 0)
      showToast(`💸 HARI INI: Bayar tagihan ${sub.name}!`, "error");
  });
}
// ==================== FITUR BARU: STICKY NOTE & WEATHER ====================

// --- 1. LOGIC STICKY NOTE (Auto Save) ---
let stickyTimeout;

window.handleStickyInput = function () {
  const status = document.getElementById("noteSaveStatus");
  status.innerText = "Mengetik...";

  // Debounce: Tunggu user berhenti mengetik 1 detik baru simpan
  clearTimeout(stickyTimeout);
  stickyTimeout = setTimeout(() => {
    const val = document.getElementById("globalStickyNote").value;
    cachedData.stickyNote = val;

    // Simpan ke Firebase (key baru: stickyNote)
    if (window.auth.currentUser) {
      const uid = window.auth.currentUser.uid;
      window
        .dbSet(window.dbRef(window.db, `users/${uid}/stickyNote`), val)
        .then(() => {
          status.innerText = "Tersimpan";
        })
        .catch(() => {
          status.innerText = "Gagal Simpan";
        });
    }
  }, 1000); // Delay 1 detik
};

// --- 2. LOGIC WEATHER (Open-Meteo API - No Key Required) ---
function initWeather() {
  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        getWeatherData(lat, lon);
      },
      (error) => {
        console.log("Lokasi ditolak/error, pakai default (Jakarta)");
        getWeatherData(-6.2088, 106.8456); // Default Jakarta
      },
    );
  } else {
    getWeatherData(-6.2088, 106.8456);
  }
}

async function getWeatherData(lat, lon) {
  try {
    // API Open-Meteo (Gratis)
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`;
    const res = await fetch(url);
    const data = await res.json();

    if (data.current_weather) {
      const temp = Math.round(data.current_weather.temperature);
      const code = data.current_weather.weathercode;

      // Mapping Kode Cuaca ke Icon FontAwesome
      let iconClass = "fas fa-cloud";
      if (code === 0)
        iconClass = "fas fa-sun"; // Cerah
      else if (code >= 1 && code <= 3)
        iconClass = "fas fa-cloud-sun"; // Berawan
      else if (code >= 45 && code <= 48)
        iconClass = "fas fa-smog"; // Kabut
      else if (code >= 51 && code <= 67)
        iconClass = "fas fa-cloud-rain"; // Hujan
      else if (code >= 95) iconClass = "fas fa-bolt"; // Badai

      // Update UI
      document.getElementById("weatherTemp").innerText = `${temp}°C`;
      document.getElementById("weatherIcon").className = iconClass;
      document.getElementById("weatherWidget").style.display = "flex";
    }
  } catch (err) {
    console.error("Gagal ambil cuaca:", err);
  }
}
// --- FITUR: TOGGLE STICKY WIDGET ---
window.toggleStickyWidget = function () {
  const content = document.getElementById("stickyContent");
  const icon = document.getElementById("stickyToggleIcon");

  // Toggle class untuk animasi tinggi
  content.classList.toggle("collapsed");

  // Ubah ikon panah
  if (content.classList.contains("collapsed")) {
    icon.className = "fas fa-chevron-up";
  } else {
    icon.className = "fas fa-chevron-down";
  }
};

// Opsional: Klik header untuk toggle juga
const stickyHeader = document.querySelector(".widget-header-float");
if (stickyHeader) {
  stickyHeader.addEventListener("click", function (e) {
    if (e.target.tagName !== "BUTTON" && e.target.tagName !== "I") {
      window.toggleStickyWidget();
    }
  });
}

// ==================== FITUR BARU: EXAM COUNTDOWN ====================

function openCountdownModal() {
  document.getElementById("countdownModal").style.display = "flex";
}

function addCountdown() {
  const title = document.getElementById("cdTitle").value;
  const date = document.getElementById("cdDate").value;

  if (!title || !date) return showToast("Isi semua data!", "error");

  const newEvent = { id: Date.now(), title, date };
  if (!cachedData.examCountdowns) cachedData.examCountdowns = [];
  cachedData.examCountdowns.push(newEvent);

  saveDB("examCountdowns", cachedData.examCountdowns);
  document.getElementById("countdownModal").style.display = "none";
  document.getElementById("cdTitle").value = "";
  document.getElementById("cdDate").value = "";
  renderCountdowns();
  showToast("Event disimpan!", "success");
}

function renderCountdowns() {
  const list = document.getElementById("countdownList");
  if (!list) return;
  list.innerHTML = "";

  const events = cachedData.examCountdowns || [];
  if (events.length === 0) {
    list.innerHTML =
      '<div class="empty-message small"><p>Belum ada jadwal ujian.</p></div>';
    return;
  }

  // Urutkan dari yang terdekat
  events.sort((a, b) => new Date(a.date) - new Date(b.date));

  events.forEach((ev) => {
    // Gunakan fungsi getDaysRemaining yang sudah ada di script.js lama
    const diff = getDaysRemaining(ev.date);
    let daysText = diff;
    let label = "Hari Lagi";
    let colorStyle = "border-left-color: var(--primary)";

    if (diff < 0) {
      daysText = "Selesai";
      label = "";
      colorStyle = "border-left-color: var(--text-sub); opacity:0.6;";
    } else if (diff === 0) {
      daysText = "HARI INI";
      label = "Semangat!";
      colorStyle = "border-left-color: var(--red)";
    } else if (diff <= 7) {
      colorStyle = "border-left-color: var(--orange)";
    }

    const html = `
            <div class="countdown-item" style="${colorStyle}">
                <div class="cd-info">
                    <h4>${escapeHtml(ev.title)}</h4>
                    <small>${new Date(ev.date).toLocaleDateString("id-ID")}</small>
                </div>
                <div style="display:flex; align-items:center;">
                    <div class="cd-days">
                        <b>${daysText}</b>
                        <span>${label}</span>
                    </div>
                    <button class="btn-del-cd" onclick="deleteCountdown(${ev.id})"><i class="fas fa-trash"></i></button>
                </div>
            </div>
        `;
    list.innerHTML += html;
  });
}
window.deleteCountdown = function (id) {
  showCustomConfirm("Hapus event hitung mundur ini?", () => {
    cachedData.examCountdowns = cachedData.examCountdowns.filter(
      (x) => x.id !== id,
    );
    saveDB("examCountdowns", cachedData.examCountdowns);
    renderCountdowns();
    showToast("Event dihapus", "success");
  });
};

// ==================== FITUR BARU: MOOD TRACKER ====================

function logMood(mood) {
  const today = new Date().toISOString().split("T")[0];
  if (!cachedData.moodLogs) cachedData.moodLogs = {};

  // Cek apakah hari ini sudah isi mood
  if (cachedData.moodLogs[today]) {
    // Jika mau overwrite tanpa nambah XP, langsung save aja
  } else {
    // Jika baru pertama kali hari ini, kasih XP bonus
    addXP(5);
    showToast("Mood tercatat! (+5 XP)", "success");
    playSuccessSound("coin");
  }

  cachedData.moodLogs[today] = mood;
  saveDB("moodLogs", cachedData.moodLogs);
  renderMoodWidget();
}

function renderMoodWidget() {
  const selector = document.getElementById("moodSelector");
  const result = document.getElementById("moodResult");
  const text = document.getElementById("todayMoodText");

  if (!selector || !result) return;

  const today = new Date().toISOString().split("T")[0];
  const todayMood = cachedData.moodLogs ? cachedData.moodLogs[today] : null;

  if (todayMood) {
    selector.style.display = "none";
    result.style.display = "block";

    // Mapping Data Mood
    const moods = {
      happy: { emoji: "😄", label: "Senang" },
      excited: { emoji: "🔥", label: "Semangat Membara" },
      confident: { emoji: "😎", label: "Pede Abis" },
      grateful: { emoji: "🙏", label: "Bersyukur" },
      relaxed: { emoji: "😌", label: "Santai / Chill" },
      bored: { emoji: "😐", label: "Bosan / Gabut" },
      confused: { emoji: "😵‍💫", label: "Bingung" },
      tired: { emoji: "😫", label: "Capek Banget" },
      sad: { emoji: "😢", label: "Sedih / Galau" },
      anxious: { emoji: "😰", label: "Cemas / Deg-degan" },
      sick: { emoji: "😷", label: "Sakit / Tidak Fit" },
      angry: { emoji: "😡", label: "Marah / Emosi" },
    };

    const m = moods[todayMood] || { emoji: "❓", label: "Mood Misterius" };
    text.innerText = `${m.emoji} ${m.label}`;
  } else {
    selector.style.display = "flex";
    result.style.display = "none";
  }
}

// ... kode lainnya ...
function resetMood() {
  showCustomConfirm("Ganti mood hari ini? Data lama akan tertimpa.", () => {
    const today = new Date().toISOString().split("T")[0];
    delete cachedData.moodLogs[today];
    saveDB("moodLogs", cachedData.moodLogs);
    renderMoodWidget();
  });
}

// --- SIDEBAR LOGIC ---
window.toggleSidebar = function () {
  const sidebar = document.getElementById("mainSidebar");
  const backdrop = document.getElementById("sidebarBackdrop");

  if (sidebar && backdrop) {
    sidebar.classList.toggle("active");
    backdrop.classList.toggle("active");
  }
};

// Tutup sidebar otomatis saat salah satu menu diklik (agar rapi)
document.addEventListener("click", function (e) {
  if (e.target.closest(".sidebar-menu-item")) {
    // Cek apakah itu bukan trigger file upload (Restore)
    if (!e.target.closest('[onclick*="importFile"]')) {
      window.toggleSidebar();
    }
  }
});
// ==================== SIDEBAR FUNCTIONS ====================

// 1. Fungsi Scroll Halus
function scrollToId(id) {
  const element = document.getElementById(id);
  if (element) {
    // Scroll ke elemen
    element.scrollIntoView({ behavior: "smooth", block: "center" });

    // Beri efek kedip (highlight) biar user tau yang mana kartunya
    element.classList.add("highlight-card");
    setTimeout(() => element.classList.remove("highlight-card"), 1000);

    // Tutup sidebar otomatis di HP
    if (window.innerWidth <= 768) {
      toggleSidebar();
    }
  } else {
    showToast("Bagian ini belum dimuat!", "error");
  }
}

// 2. Fungsi Aksi Cepat (Focus Input)
function quickAction(type) {
  // Tutup sidebar dulu
  if (window.innerWidth <= 768) toggleSidebar();

  if (type === "task") {
    scrollToId("todo-card");
    setTimeout(() => document.getElementById("taskInput").focus(), 600);
  } else if (type === "finance") {
    scrollToId("financeCard"); // Sesuaikan ID kartu keuanganmu
    setTimeout(() => document.getElementById("moneyDesc").focus(), 600);
  }
}

// 3. Toggle Widget Musik (Utilitas)
function toggleMusicWidget() {
  const musicWidget = document.getElementById("musicWidget"); // Pastikan ID ini ada di HTML/JS Inject
  const musicFrame = document.getElementById("musicFrame");

  if (musicFrame) {
    musicFrame.classList.toggle("hidden-music");
    showToast(
      musicFrame.classList.contains("hidden-music")
        ? "Musik Disembunyikan"
        : "Musik Ditampilkan",
      "info",
    );
  } else {
    // Jika widget belum ada, scroll ke bawah mungkin ada footer
    showToast("Widget musik belum siap", "error");
  }
}
// ==================== GLOBAL CHAT LOGIC ====================
let chatListenerActive = false;

function initChatListener() {
    if (chatListenerActive) return;
    
    // Pastikan fungsi query firebase ada
    if (!window.dbQuery || !window.dbLimitToLast) {
        console.error("Firebase Query functions belum di-import!");
        return;
    }

    const chatRef = window.dbQuery(window.dbRef(window.db, 'system/globalChat'), window.dbLimitToLast(50));
    const chatBox = document.getElementById("chatBox");

    window.dbOnValue(chatRef, (snapshot) => {
        if(!chatBox) return;
        chatBox.innerHTML = ""; // Reset tampilan biar gak dobel
        const data = snapshot.val();
        
        if (data) {
            Object.values(data).forEach(msg => {
                const isMe = window.auth.currentUser && msg.uid === window.auth.currentUser.uid;
                const div = document.createElement("div");
                div.className = `chat-bubble ${isMe ? 'chat-right' : 'chat-left'}`;
                div.innerHTML = `
                    ${!isMe ? `<span class="chat-user">${escapeHtml(msg.name)}</span>` : ''}
                    ${escapeHtml(msg.text)}
                `;
                chatBox.appendChild(div);
            });
            // Auto scroll ke bawah
            setTimeout(() => chatBox.scrollTop = chatBox.scrollHeight, 100);
        } else {
            chatBox.innerHTML = '<div class="chat-empty" style="text-align:center; color:#aaa; margin-top:20px;">Belum ada pesan.</div>';
        }
    });
    chatListenerActive = true;
}

window.sendChat = function() {
    const input = document.getElementById("chatInput");
    const text = input.value.trim();
    if (!text) return;

    if (!window.auth.currentUser) return showToast("Login dulu!", "error");

    // Kirim ke Firebase
    const chatRef = window.dbRef(window.db, 'system/globalChat');
    const newChatRef = window.dbPush(chatRef);
    
    window.dbSet(newChatRef, {
        uid: window.auth.currentUser.uid,
        name: currentUser || "User",
        text: text,
        timestamp: Date.now()
    });

    input.value = "";
    // Putar suara kirim (opsional)
    playSuccessSound("coin"); 
};

window.handleChatEnter = function(e) {
    if (e.key === "Enter") window.sendChat();
};

// PANGGIL FUNGSI INI AGAR CHAT JALAN
// Tambahkan baris ini di dalam fungsi initApp() yang sudah ada di atas
// initChatListener();
// --- LISTEN GLOBAL CONFIG DARI ADMIN ---
function listenGlobalConfig() {
    const configRef = window.dbRef(window.db, 'system/config');
    
    window.dbOnValue(configRef, (snapshot) => {
        const config = snapshot.val();
        if (config) {
            // 1. Cek Mode Ujian Global
            if (config.examMode === true) {
                if (!isExamMode) {
                    isExamMode = true;
                    checkExamMode(); // Update UI
                    showToast("⚠️ MODE UJIAN DIMULAI OLEH ADMIN!", "error");
                    playSuccessSound("bell");
                }
            } else {
                // Jika admin mematikan, kembalikan ke settingan user
                // (Opsional: atau biarkan user mematikan sendiri)
                if (isExamMode && config.examMode === false) {
                     // Kita tidak otomatis mematikan biar user yang kontrol, 
                     // atau bisa dipaksa mati dengan baris di bawah:
                     // isExamMode = false; checkExamMode();
                }
            }

            // 2. Cek Maintenance Mode
            if (config.maintenance === true) {
                document.body.innerHTML = `
                    <div style="height:100vh; display:flex; flex-direction:column; align-items:center; justify-content:center; background:#0f172a; color:white; text-align:center;">
                        <i class="fas fa-tools" style="font-size:3rem; margin-bottom:20px; color:#f59e0b;"></i>
                        <h1>Sedang Maintenance</h1>
                        <p>Aplikasi sedang diperbaiki. Silakan kembali nanti.</p>
                    </div>
                `;
            }
        }
    });
}

// PANGGIL FUNGSI INI DI DALAM initApp
// Cari function initApp(uid) dan tambahkan listenGlobalConfig();
// ==================== FITUR SOSIAL & RAPOR ====================

// 1. GLOBAL LEADERBOARD
window.openLeaderboardModal = function() {
    document.getElementById("leaderboardModal").style.display = "flex";
    const list = document.getElementById("leaderboardList");
    list.innerHTML = '<div style="text-align:center; padding:20px;">Mengambil data ranking...</div>';

    // Ambil semua data user dari Firebase (Read-only)
    window.dbOnValue(window.dbRef(window.db, 'users'), (snapshot) => {
        const users = snapshot.val();
        if (!users) {
            list.innerHTML = '<div style="text-align:center;">Belum ada data user.</div>';
            return;
        }

        // Convert ke Array & Sort by XP Tertinggi
        const sortedUsers = Object.values(users)
            .map(u => ({
                name: u.username || "User Misterius",
                xp: u.gamification?.xp || 0,
                level: u.gamification?.level || 1,
                badge: getLevelTitle(u.gamification?.level || 1)
            }))
            .sort((a, b) => b.xp - a.xp)
            .slice(0, 10); // Ambil Top 10

        // Render HTML
        list.innerHTML = "";
        sortedUsers.forEach((u, index) => {
            let rankColor = "#6b7280"; // Default abu
            let icon = "";

            if (index === 0) { rankColor = "#FFD700"; icon = "👑"; } // Emas
            else if (index === 1) { rankColor = "#C0C0C0"; icon = "🥈"; } // Perak
            else if (index === 2) { rankColor = "#CD7F32"; icon = "🥉"; } // Perunggu

            list.innerHTML += `
                <div class="ach-item unlocked" style="border-left: 4px solid ${rankColor};">
                  <div class="ach-icon" style="background: ${rankColor}; color: #fff; font-size: 1rem; width: 40px; height: 40px;">
                    <b>#${index + 1}</b>
                  </div>
                  <div class="ach-info">
                    <h4 style="margin-bottom:0;">${escapeHtml(u.name)} ${icon}</h4>
                    <small style="color:var(--text-sub);">${u.badge}</small>
                  </div>
                  <div style="text-align:right;">
                    <b style="color:var(--primary); font-size:1rem;">${u.xp} XP</b><br>
                    <span class="badge badge-lvl" style="font-size:0.7rem;">Lvl ${u.level}</span>
                  </div>
                </div>
            `;
        });
    }, { onlyOnce: true });
};

// 2. RAPOR BULANAN (RECAP)
window.openMonthlyRecap = function() {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

    // PERBAIKAN: Menggunakan Backtick (`) bukan kutip biasa (')
    document.getElementById("recapMonth").innerText = `Rapor ${monthNames[currentMonth]} ${currentYear}`;

    // Hitung Tugas Selesai Bulan Ini
    const tasksDone = cachedData.tasks.filter(t => {
        const d = new Date(t.date);
        return t.completed && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    }).length;

    // Hitung Fokus Jam Bulan Ini
    let totalFocusMinutes = 0;
    if (cachedData.focusLogs) {
        Object.keys(cachedData.focusLogs).forEach(dateStr => {
            const d = new Date(dateStr);
            if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
                totalFocusMinutes += cachedData.focusLogs[dateStr];
            }
        });
    }
    const focusHours = (totalFocusMinutes / 60).toFixed(1);

    // Hitung Uang Ditabung (Kategori: Tabungan)
    let totalSaved = 0;
    if (cachedData.transactions) {
        cachedData.transactions.forEach(t => {
            const d = new Date(t.date);
            if (d.getMonth() === currentMonth && d.getFullYear() === currentYear && t.category === "Tabungan" && t.type === "in") {
                totalSaved += t.amount;
            }
        });
    }

    // Update UI Modal (PERBAIKAN: Menggunakan Backtick)
    document.getElementById("recapTasks").innerText = tasksDone;
    document.getElementById("recapFocus").innerText = `${focusHours} Jam`;
    document.getElementById("recapSaved").innerText = `Rp ${totalSaved.toLocaleString('id-ID')}`;
    document.getElementById("recapStreak").innerText = `${cachedData.streak?.count || 0} Hari`;

    // Pesan Motivasi Personal
    const msgEl = document.getElementById("recapMessage");
    if (tasksDone > 20 && parseFloat(focusHours) > 10) {
        msgEl.innerText = "🔥 GILA! Kamu produktif banget bulan ini. Pertahankan King/Queen!";
    } else if (tasksDone > 5) {
        msgEl.innerText = "✨ Progres yang bagus. Bulan depan gas lagi ya!";
    } else {
        msgEl.innerText = "💤 Masih pemanasan ya? Yuk bulan depan lebih serius!";
    }

    document.getElementById("recapModal").style.display = "flex";
};
// --- KODE YANG HILANG (PASTE DI ATAS RENDER KALENDER) ---

let currentCalDate = new Date(); // Variabel tanggal (Wajib ada!)
let googleEventsCache = [];      // <--- TAMBAHKAN BARIS INI (Wajib!)

window.openCalendarModal = function() {
    renderCalendar(); // Gambar kalender
    document.getElementById("calendarModal").style.display = "flex";
    document.getElementById("calendarDetailBox").style.display = "none";
};

window.changeCalendarMonth = function(n) {
    currentCalDate.setMonth(currentCalDate.getMonth() + n);
    renderCalendar(); // Refresh kalender
    document.getElementById("calendarDetailBox").style.display = "none";
};

// ---------------------------------------------------------

// ==================== UPDATE RENDER KALENDER (FINAL) ====================

window.renderCalendar = function() {
    const year = currentCalDate.getFullYear();
    const month = currentCalDate.getMonth();
    
    // Update Header
    const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
    if(document.getElementById("calMonthYear")) {
        document.getElementById("calMonthYear").innerText = `${monthNames[month]} ${year}`;
    }
    
    const firstDay = new Date(year, month, 1).getDay(); 
    const lastDate = new Date(year, month + 1, 0).getDate(); 
    
    const grid = document.getElementById("calendarDays");
    if (!grid) return;
    grid.innerHTML = "";
    
    // Padding Awal Bulan
    for (let i = 0; i < firstDay; i++) {
        grid.innerHTML += `<div class="cal-date empty"></div>`;
    }
    
    const today = new Date();
    const todayStr = today.toLocaleDateString('en-CA');
    
    for (let d = 1; d <= lastDate; d++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        
        // --- FILTER DATA & LOGIC URGENT ---
        
        let tasksOnDate = [];
        let urgentTasks = [];

        if (cachedData.tasks) {
            cachedData.tasks.forEach(t => {
                if (t.date === dateStr && !t.completed) {
                    // Cek selisih hari buat nentuin Urgent/Enggak
                    const taskDate = new Date(t.date);
                    const diffTime = taskDate - today;
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
                    
                    if (diffDays >= 0 && diffDays <= 3) {
                        urgentTasks.push(t); // Masuk kategori Urgent (Oranye)
                    } else {
                        tasksOnDate.push(t); // Tugas Biasa (Biru)
                    }
                }
            });
        }

        const examsOnDate = cachedData.examCountdowns ? cachedData.examCountdowns.filter(e => e.date === dateStr) : [];
        const customsOnDate = cachedData.calendarEvents ? cachedData.calendarEvents.filter(e => e.date === dateStr) : [];
        const gEventsOnDate = googleEventsCache ? googleEventsCache.filter(g => {
            const gDate = g.start.date || (g.start.dateTime ? g.start.dateTime.split('T')[0] : '');
            return gDate === dateStr;
        }) : [];

        // --- RENDER DOTS ---
        let dotsHTML = '<div class="cal-dots">';
        
        if (examsOnDate.length > 0) dotsHTML += `<div class="dot-marker dot-event" title="Ujian"></div>`; // Merah
        if (urgentTasks.length > 0) dotsHTML += `<div class="dot-marker dot-urgent" title="Deadline Mepet!"></div>`; // Oranye (BARU)
        if (tasksOnDate.length > 0) dotsHTML += `<div class="dot-marker dot-task" title="Tugas"></div>`; // Biru
        if (customsOnDate.length > 0) dotsHTML += `<div class="dot-marker dot-custom" title="Acara"></div>`; // Ungu
        if (gEventsOnDate.length > 0) dotsHTML += `<div class="dot-marker dot-google" title="G-Cal"></div>`; // Hijau
        
        dotsHTML += '</div>';
        
        const isToday = (dateStr === todayStr) ? "today" : "";
        
        grid.innerHTML += `
            <div class="cal-date ${isToday}" onclick="showDateDetails('${dateStr}')">
                <span>${d}</span>
                ${dotsHTML}
            </div>
        `;
    }
};

// Pastikan fungsi buka modal ada (restore fungsi ini)
window.openCalendarModal = function() {
    renderCalendar();
    document.getElementById("calendarModal").style.display = "flex";
    document.getElementById("calendarDetailBox").style.display = "none";
};

window.showDateDetails = function(dateStr) {
    const list = document.getElementById("calEventList");
    const box = document.getElementById("calendarDetailBox");
    const title = document.getElementById("calSelectedDate");
    
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    title.innerText = new Date(dateStr).toLocaleDateString('id-ID', options);
    
    list.innerHTML = "";
    let hasContent = false;
    
    // 1. Google Events
    if(googleEventsCache) {
        const gEvents = googleEventsCache.filter(g => {
            const gDate = g.start.date || (g.start.dateTime ? g.start.dateTime.split('T')[0] : '');
            return gDate === dateStr;
        });
        gEvents.forEach(g => {
            let timeLabel = g.start.dateTime ? g.start.dateTime.split('T')[1].substring(0,5) : "Seharian";
            list.innerHTML += `
                <li style="border-left: 3px solid #34A853; padding-left: 10px; margin-bottom: 5px; color: #34A853;">
                    <b>G-Cal (${timeLabel}):</b> ${escapeHtml(g.summary)}
                </li>
            `;
            hasContent = true;
        });
    }

    // 2. Acara Manual
    if (cachedData.calendarEvents) {
        cachedData.calendarEvents.filter(e => e.date === dateStr).forEach(e => {
            list.innerHTML += `
                <li style="border-left: 3px solid #8b5cf6; padding-left: 10px; margin-bottom: 5px; display:flex; justify-content:space-between; align-items:center;">
                    <div style="color: #8b5cf6;">
                        <b>${escapeHtml(e.time)}:</b> ${escapeHtml(e.title)}
                    </div>
                    <button onclick="deleteCalEvent(${e.id})" style="background:none; border:none; color:#ef4444; cursor:pointer;" title="Hapus">
                        <i class="fas fa-trash"></i>
                    </button>
                </li>
            `;
            hasContent = true;
        });
    }

    // 3. Ujian
    if (cachedData.examCountdowns) {
        cachedData.examCountdowns.filter(e => e.date === dateStr).forEach(e => {
            list.innerHTML += `
                <li style="border-left: 3px solid var(--red); padding-left: 10px; margin-bottom: 5px; color: var(--red);">
                    <b>Deadline:</b> ${escapeHtml(e.title)}
                </li>
            `;
            hasContent = true;
        });
    }
    
    // 4. Tugas
    if (cachedData.tasks) {
        cachedData.tasks.filter(t => t.date === dateStr && !t.completed).forEach(t => {
            list.innerHTML += `
                <li style="border-left: 3px solid var(--blue); padding-left: 10px; margin-bottom: 5px;">
                    <b>Tugas:</b> ${escapeHtml(t.text)}
                </li>
            `;
            hasContent = true;
        });
    }
    
    if (!hasContent) {
        list.innerHTML = `<li style="color:var(--text-sub); font-style:italic;">Tidak ada kegiatan.</li>`;
    }
    
    box.style.display = "block";
};
// 5. Fungsi Google Calendar Sync
window.syncGoogleCalendar = function() {
    if (!window.auth.currentUser) return showToast("Login dulu bos!", "error");

    const provider = new window.googleProvider.constructor();
    provider.addScope('https://www.googleapis.com/auth/calendar.events.readonly');
    showToast("Meminta izin Google Calendar...", "info");

    window.authSignInGoogle(window.auth, provider)
    .then((result) => {
        const credential = window.googleProvider.constructor.credentialFromResult(result);
        const token = credential.accessToken;
        if (token) fetchGoogleEvents(token);
        else showToast("Gagal dapat token.", "error");
    })
    .catch((error) => {
        console.error(error);
        showToast("Sinkronisasi Dibatalkan.", "error");
    });
};

function fetchGoogleEvents(accessToken) {
    const now = new Date();
    const timeMin = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
    const timeMax = new Date(now.getFullYear(), now.getMonth() + 2, 0).toISOString();
    const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${timeMin}&timeMax=${timeMax}&singleEvents=true&orderBy=startTime`;

    fetch(url, { headers: { 'Authorization': `Bearer ${accessToken}` } })
    .then(response => response.json())
    .then(data => {
        if (data.items) {
            googleEventsCache = data.items;
            showToast(`Berhasil sync! ${data.items.length} event.`, "success");
            playSuccessSound("coin");
            renderCalendar();
        } else showToast("Tidak ada event ditemukan.", "info");
    })
    .catch(err => showToast("Gagal ambil data.", "error"));
}

// 6. Fungsi Acara Manual (Tambah & Hapus)
window.openCalAddModal = function() {
    document.getElementById("calAddModal").style.display = "flex";
}

window.saveManualEvent = function() {
    const title = document.getElementById("calEventTitle").value;
    const date = document.getElementById("calEventDate").value;
    const time = document.getElementById("calEventTime").value || "Seharian";

    if(!title || !date) return showToast("Isi Nama & Tanggal!", "error");

    if(!cachedData.calendarEvents) cachedData.calendarEvents = [];
    
    cachedData.calendarEvents.push({
        id: Date.now(),
        title, date, time
    });

    saveDB("calendarEvents", cachedData.calendarEvents);
    document.getElementById("calAddModal").style.display = "none";
    
    // Reset Form
    document.getElementById("calEventTitle").value = "";
    document.getElementById("calEventDate").value = "";
    
    showToast("Acara disimpan!", "success");
    renderCalendar();
}

window.deleteCalEvent = function(id) {
    if(confirm("Hapus acara ini?")) {
        cachedData.calendarEvents = cachedData.calendarEvents.filter(e => e.id !== id);
        saveDB("calendarEvents", cachedData.calendarEvents);
        renderCalendar();
        // Tutup detail biar refresh
        document.getElementById("calendarDetailBox").style.display = "none";
        showToast("Acara dihapus.", "info");
    }
}