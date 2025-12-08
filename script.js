// ==================== SYSTEM & CONFIG ====================
let currentUser = null; // UID User

// Wadah Data Lokal
let cachedData = { 
    tasks: [], 
    transactions: [], 
    jadwal: null,
    settings: {}
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
let soundPreference = 'bell'; 
let currentScheduleFilterGuru = 'all'; 
let currentScheduleFilterCategory = 'all'; 

// --- VARIABEL KONTROL FOKUS ---
let isFocusLocked = false;
let isTabBlurred = false; 
let blurCount = 0; 
let savedFocusTime = null; // Simpan waktu Fokus saat pindah ke istirahat
let savedBreakTime = null; // Simpan waktu Istirahat saat diskip/lanjut fokus
// --- END VARIABEL FOKUS ---

// --- VARIABEL PENTING ---
let taskFilter = 'all';
let editingTaskId = null;

// --- DATA JADWAL DEFAULT ---
const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
const defaultJadwalData = {
    umum: {
        "Senin": [
            { mapel: "Koding & AI", guru: "Juliana Mansur, S.Kom", time: "08.20 - 09.40", type: "produktif" },
            { mapel: "PAI & Budi Pekerti", guru: "Hapid, S.Ag", time: "10.00 - 11.20", type: "umum" },
            { mapel: "Matematika", guru: "Wijiastuti, S.Pd", time: "11.20 - 13.20", type: "umum" },
            { mapel: "Pend. Pancasila", guru: "Amanda Putri S, S.Pd", time: "13.20 - 14.40", type: "umum" },
            { mapel: "Bahasa Inggris", guru: "Endang Setiawan, S.Pd", time: "14.40 - 16.00", type: "umum" }
        ],
        "Selasa": [ { mapel: "KOKURIKULER", guru: "Nurulia Aprilia, S.Si", time: "08.00 - 15.50", type: "kokurikuler" } ],
        "Rabu": [
            { mapel: "Bahasa Indonesia", guru: "Lia Siti Sholehah, S.Pd", time: "08.00 - 09.20", type: "umum" },
            { mapel: "Bahasa Inggris", guru: "Endang Setiawan, S.Pd", time: "09.40 - 11.00", type: "umum" },
            { mapel: "PAI", guru: "Hapid, S.Ag", time: "11.00 - 13.00", type: "umum" },
            { mapel: "Matematika", guru: "Wijiastuti, S.Pd", time: "13.00 - 14.30", type: "umum" },
            { mapel: "Pend. Pancasila", guru: "Amanda Putri S, S.Pd", time: "14.30 - 15.50", type: "umum" }
        ],
        "Kamis": [
            { mapel: "Sejarah", guru: "Yessy Novita D, S.Pd", time: "08.00 - 09.20", type: "umum" },
            { mapel: "Bahasa Indonesia", guru: "Lia Siti Sholehah, S.Pd", time: "09.40 - 11.00", type: "umum" },
            { mapel: "Bahasa Sunda", guru: "Isti Hamidah", time: "11.00 - 13.00", type: "umum" },
            { mapel: "Matematika", guru: "Wijiastuti, S.Pd", time: "13.00 - 14.30", type: "umum" },
            { mapel: "Sejarah", guru: "Yessy Novita D, S.Pd", time: "14.30 - 15.50", "type": "umum" }
        ],
        "Jumat": [
            { mapel: "Koding & AI", guru: "Juliana Mansur, S.Kom", time: "07.45 - 09.05", type: "produktif" },
            { mapel: "Bahasa Inggris", guru: "Endang Setiawan, S.Pd", time: "09.05 - 10.25", type: "umum" },
            { mapel: "Bahasa Indonesia", guru: "Lia Siti Sholehah, S.Pd", time: "10.25 - 13.40", type: "umum" },
            { mapel: "Bahasa Sunda", guru: "Isti Hamidah", time: "13.40 - 15.00", type: "umum" }
        ]
    },
    produktif: {
        "Senin": [
            { mapel: "DDPK (Juliana)", time: "08.20 - 09.40", type: "produktif" },
            { mapel: "PJOK", guru: "Noer Sandy M, S.Pd", time: "10.00 - 12.00", type: "umum" },
            { mapel: "DDPK (Duma)", time: "12.40 - 14.40", type: "produktif" },
            { mapel: "DDPK (Muslih)", time: "14.40 - 16.00", type: "produktif" }
        ],
        "Selasa": [
            { mapel: "Projek IPAS", guru: "Nurulia Aprilia, S.Si", time: "08.00 - 11.40", type: "umum" },
            { mapel: "DDPK (Duma)", time: "12.20 - 14.30", type: "produktif" },
            { mapel: "Informatika", guru: "Nurdin", time: "14.30 - 15.50", type: "produktif" }
        ],
        "Rabu": [
            { mapel: "Informatika", guru: "Nurdin", time: "08.00 - 09.20", type: "produktif" },
            { mapel: "PJOK", guru: "Noer Sandy M, S.Pd", time: "09.40 - 11.40", type: "umum" },
            { mapel: "Projek IPAS", guru: "Nurulia Aprilia, S.Si", time: "12.20 - 15.50", type: "umum" }
        ],
        "Kamis": [ { mapel: "DDPK (Full Day)", guru: "Iqbal Fajar Syahbana", time: "08.00 - 15.50", type: "produktif" } ],
        "Jumat": [
            { mapel: "DDPK (Duma)", time: "07.45 - 10.25", type: "produktif" },
            { mapel: "Informatika", guru: "Nurdin", time: "10.25 - 13.40", type: "produktif" },
            { mapel: "DDPK (Duma)", time: "13.40 - 15.00", type: "produktif" }
        ]
    }
};

let jadwalData = defaultJadwalData;
let currentDayIdx = new Date().getDay(); 
let currentWeekType = 'umum'; 

// ==================== SYSTEM RNG QUOTES ====================
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
    "Semangat! Cicilan panci belum lunas."
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
    "Gak Ada Obat! 💊"
];

// ==================== B. AUTHENTICATION LOGIC ====================

document.addEventListener("DOMContentLoaded", () => {
    initAuthListener(); 
});

function initAuthListener() {
    setTimeout(() => {
        if (!window.authListener) return;

        window.authListener(window.auth, (user) => {
            if (user) {
                const displayName = user.displayName ? user.displayName : user.email.split('@')[0];
                currentUser = displayName;
                const uid = user.uid; 
                
                document.getElementById('loginOverlay').style.display = 'none';
                document.getElementById('mainContent').style.display = 'block';
                
                document.getElementById('displayUsername').innerText = displayName; 
                updateGreeting(); 
                document.getElementById('loginStatusText').innerText = "Online";
                
                startFirebaseListener(uid); 
                initApp();
            } else {
                currentUser = null;
                document.getElementById('loginOverlay').style.display = 'flex';
                document.getElementById('mainContent').style.display = 'none';
            }
        });
    }, 1000);
}

window.switchAuthMode = function(mode) {
    const loginView = document.getElementById('loginView');
    const registerView = document.getElementById('registerView');
    const errorMsg = document.getElementById('authErrorMsg');
    if(errorMsg) errorMsg.innerText = ""; 

    if (mode === 'register') {
        loginView.style.display = 'none';
        registerView.style.display = 'block';
    } else {
        loginView.style.display = 'block';
        registerView.style.display = 'none';
    }
}

window.handleLogin = function() {
    const email = document.getElementById('loginEmail').value;
    const pass = document.getElementById('loginPass').value;
    const errorMsg = document.getElementById('authErrorMsg');

    if(!email || !pass) { errorMsg.innerText = "Isi email dan password!"; return; }

    errorMsg.innerText = "Sedang masuk...";
    window.authSignIn(window.auth, email, pass)
        .then(() => { errorMsg.innerText = ""; showToast("Berhasil Masuk!", "success"); })
        .catch((error) => { errorMsg.innerText = "Gagal: Email/Password salah."; });
}

window.handleGoogleLogin = function() {
    const errorMsg = document.getElementById('authErrorMsg');
    errorMsg.innerText = "Menghubungkan ke Google...";
    errorMsg.style.color = "var(--text-sub)";
    
    window.authSignInGoogle(window.auth, window.googleProvider)
        .then((result) => {
            const user = result.user;
            errorMsg.style.color = "var(--green)";
            errorMsg.innerText = "Berhasil! Mengalihkan...";
            showToast(`Masuk sebagai ${user.displayName}`, "success");
        }).catch((error) => {
            console.error(error);
            errorMsg.style.color = "var(--red)";
            if (error.code === 'auth/popup-closed-by-user') {
                errorMsg.innerText = "Login dibatalkan.";
            } else if (error.code === 'auth/network-request-failed') {
                errorMsg.innerText = "Gagal: Periksa internet Anda.";
            } else {
                errorMsg.innerText = "Gagal masuk Google.";
            }
        });
}

window.handleRegister = function() {
    const username = document.getElementById('regUsername').value;
    const email = document.getElementById('regEmail').value;
    const pass = document.getElementById('regPass').value;
    
    if(!username || !email || !pass) { alert("Lengkapi data pendaftaran!"); return; }
    if(pass.length < 6) { alert("Password minimal 6 karakter!"); return; }

    window.authSignUp(window.auth, email, pass)
        .then((userCredential) => {
            const user = userCredential.user;
            window.authUpdateProfile(user, { displayName: username })
                .then(() => {
                    showToast(`Halo ${username}!`, "success");
                    setTimeout(() => location.reload(), 1500);
                });
        })
        .catch((error) => {
            if(error.code === 'auth/email-already-in-use') alert("Email sudah terdaftar!");
            else alert("Gagal: " + error.message);
        });
}

window.logoutUser = function() {
    if(confirm("Yakin ingin keluar?")) {
        window.authSignOut(window.auth).then(() => {
            location.reload();
        });
    }
}

window.editUsername = function() {
    const user = window.auth.currentUser;
    if(user) {
        document.getElementById('newUsernameInput').value = user.displayName || "";
        document.getElementById('usernameModal').style.display = 'flex';
        const dropdown = document.getElementById('settingsDropdown');
        if(dropdown) dropdown.classList.remove('active');
    }
}

window.saveUsername = function() {
    const newName = document.getElementById('newUsernameInput').value.trim();
    if(!newName) return showToast("Nama tidak boleh kosong!", "error");

    const user = window.auth.currentUser;
    window.authUpdateProfile(user, { displayName: newName }).then(() => {
        document.getElementById('displayUsername').innerText = newName;
        updateGreeting();
        document.getElementById('usernameModal').style.display = 'none';
        showToast("Nama berhasil diganti!", "success");
    }).catch(err => {
        showToast("Gagal ganti nama: " + err.message, "error");
    });
}

// ==================== C. FIREBASE DATA LOGIC ====================

function startFirebaseListener(uid) {
    if (!window.db || !window.dbOnValue) {
        console.error("Firebase belum siap.");
        return;
    }
    const userPath = 'users/' + uid;
    
    window.dbOnValue(window.dbRef(window.db, userPath), (snapshot) => {
        const data = snapshot.val();
        if (data) {
            cachedData.tasks = data.tasks || [];
            cachedData.transactions = data.transactions || [];
            if (data.jadwal && data.jadwal.umum) {
                cachedData.jadwal = data.jadwal;
            } else {
                cachedData.jadwal = defaultJadwalData;
                saveDB('jadwalData', defaultJadwalData); 
            }
            if(data.settings) {
                if(data.settings.theme) applyTheme(data.settings.theme);
                if(data.settings.weekType) currentWeekType = data.settings.weekType;
                if(data.settings.target) localStorage.setItem(`${uid}_target`, data.settings.target);
                if(data.settings.isExamMode) isExamMode = data.settings.isExamMode;
            }
        } else {
            cachedData.jadwal = defaultJadwalData;
            saveAllToCloud(uid); 
        }
        jadwalData = cachedData.jadwal;
        renderAll();
    });
}

function saveDB(key, data) {
    const uid = window.auth.currentUser.uid;
    if(key === 'tasks') cachedData.tasks = data;
    if(key === 'transactions') cachedData.transactions = data;
    if(key === 'jadwalData') { cachedData.jadwal = data; jadwalData = data; }

    let dbKey = key;
    if(key === 'jadwalData') dbKey = 'jadwal';

    window.dbSet(window.dbRef(window.db, `users/${uid}/${dbKey}`), data)
    .catch(err => showToast("Gagal simpan ke Cloud: " + err.message, "error"));
}

function saveSetting(key, val) {
    const uid = window.auth.currentUser.uid;
    window.dbSet(window.dbRef(window.db, `users/${uid}/settings/${key}`), val);
}

function saveAllToCloud(uid) {
    const targetUid = uid || (window.auth.currentUser ? window.auth.currentUser.uid : null);
    if(targetUid) {
        window.dbSet(window.dbRef(window.db, `users/${targetUid}`), cachedData);
    }
}

function getDB(key) {
    if (key === 'tasks') return cachedData.tasks || [];
    if (key === 'transactions') return cachedData.transactions || [];
    return [];
}

// ==================== D. APP FEATURES LOGIC ====================

function initApp() {
    startClock(); 
    updateGreeting(); 
    updateHeaderDate(); 
    loadScheduleFilters(); 
    loadSoundSettings(); 
    loadRandomQuote(); 
    updateTimerDisplay(); 
    
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey || e.metaKey) { 
            if (e.key === 't' || e.key === 'T') { e.preventDefault(); document.getElementById('taskInput').focus(); }
            else if (e.key === 's' || e.key === 'S') { e.preventDefault(); document.getElementById('startPauseBtn').click(); }
            else if (e.key === 'd' || e.key === 'D') { e.preventDefault(); toggleDarkMode(); }
        }
    });
    setInterval(checkReminders, 60000);
    
    // --- INIT FOKUS LOCK & ANTI TAB SWITCH ---
    window.addEventListener('blur', handleTabBlur);
    window.addEventListener('focus', handleTabFocus);
    window.addEventListener('beforeunload', handleBeforeUnload);
}

function renderAll() {
    document.getElementById('weekTypeSelector').value = currentWeekType;
    checkExamMode();
    renderSchedule();
    loadTasks();
    loadTransactions();
    loadTarget();
    loadPomodoroTasks();
}

// --- FUNGSI KONTROL FOKUS ---
function setFocusLock(lock) {
    isFocusLocked = lock;
    const focusModeElement = document.getElementById('focusModeLockText'); 
    if(focusModeElement) {
        focusModeElement.style.display = lock ? 'block' : 'none';
        document.querySelector('.timer-controls').style.marginTop = lock ? '10px' : '0';
    }
}

function handleTabBlur() {
    if (isFocusLocked && !isPaused && isWorking) {
        isTabBlurred = true;
        blurCount++;
        pauseTimer(); // Ini akan memicu penyimpanan waktu & switch ke istirahat
        showToast(`❌ JANGAN BANDEL! Fokus dijeda karena pindah tab.`, 'error');
    }
}

function handleTabFocus() {
    if (isFocusLocked && isTabBlurred) {
        isTabBlurred = false;
    }
}

function handleBeforeUnload(event) {
    if (isFocusLocked && !isPaused && isWorking) {
        event.preventDefault();
        event.returnValue = "Mode Fokus sedang aktif! Yakin ingin meninggalkan halaman?";
        return "Mode Fokus sedang aktif! Yakin ingin meninggalkan halaman?";
    }
}

// --- UTILS UI ---
function updateGreeting() { 
    const h = new Date().getHours(); 
    let greet = 'Halo';
    let emoji = '👋';
    if (h < 11) { greet = 'Selamat Pagi'; emoji = '☀️'; }
    else if (h < 15) { greet = 'Selamat Siang'; emoji = '🌤️'; }
    else if (h < 18) { greet = 'Selamat Sore'; emoji = '🌇'; }
    else { greet = 'Selamat Malam'; emoji = '🌙'; }

    const userDisplay = currentUser || 'User';
    document.getElementById('greeting').innerHTML = `${greet}, <span class="text-gradient">${escapeHtml(userDisplay)}</span>! ${emoji}`; 
}

function updateHeaderDate() { document.getElementById('headerDate').innerHTML = `<i class="far fa-calendar"></i> ${new Date().toLocaleDateString('id-ID', {weekday:'long', day:'numeric', month:'long', year:'numeric'})}`; }
function startClock() { setInterval(() => { const n=new Date(); document.getElementById('clockTime').innerText=n.toLocaleTimeString('id-ID'); }, 1000); }
function showToast(m, t) { 
    const b=document.getElementById('toastBox'); const d=document.createElement('div'); 
    d.className=`toast ${t}`; d.innerHTML=`<i class="fas fa-${t==='success'?'check-circle':t==='info'?'bell':'exclamation-circle'}"></i> ${m}`; 
    b.appendChild(d); setTimeout(()=>d.remove(), 3000); 
}
function toggleDarkMode() { 
    document.body.classList.toggle('dark-mode'); 
    const uid = window.auth.currentUser.uid;
    const theme = document.body.classList.contains('dark-mode')?'dark':'light';
    localStorage.setItem(`${uid}_theme`, theme);
    saveSetting('theme', theme);
}
function applyTheme(theme) {
    if(theme === 'dark') document.body.classList.add('dark-mode');
    else document.body.classList.remove('dark-mode');
}

// --- POMODORO ---
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
function playSuccessSound(type = 'ding') {
    if (soundPreference === 'silent') return;
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    if (type === 'ding') {
        oscillator.type = 'sine'; oscillator.frequency.setValueAtTime(1200, audioCtx.currentTime); 
        oscillator.frequency.exponentialRampToValueAtTime(600, audioCtx.currentTime + 0.5); 
        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime); gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.5); 
        oscillator.start(); oscillator.stop(audioCtx.currentTime + 0.5);
    } else if (type === 'coin') {
        oscillator.type = 'triangle'; oscillator.frequency.setValueAtTime(900, audioCtx.currentTime);
        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime); gainNode.gain.linearRampToValueAtTime(0.0001, audioCtx.currentTime + 0.3);
        oscillator.start(); oscillator.stop(audioCtx.currentTime + 0.3);
    } else if (type === 'bell') {
        oscillator.type = 'sawtooth'; oscillator.frequency.setValueAtTime(440, audioCtx.currentTime);
        gainNode.gain.setValueAtTime(0.15, audioCtx.currentTime); gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 1.5);
        oscillator.start(); oscillator.stop(audioCtx.currentTime + 1.5);
    }
}

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}

function updateTimerDisplay() {
    document.getElementById('timerDisplay').innerText = formatTime(timeLeft);
    const card = document.querySelector('.pomodoro-card');
    
    if(isWorking) {
        document.getElementById('timerMode').innerText = "FOKUS";
        document.getElementById('timerMessage').innerText = "Waktunya Bekerja Keras";
        card.classList.remove('mode-break');
        if(!isPaused) {
            document.getElementById('startPauseBtn').innerText = "Jeda (ke Istirahat)";
            document.getElementById('startPauseBtn').setAttribute('onclick', 'pauseTimer()');
        } else {
             document.getElementById('startPauseBtn').innerText = "Mulai";
             document.getElementById('startPauseBtn').setAttribute('onclick', 'startTimer()');
        }
        
    } else {
        document.getElementById('timerMode').innerText = "ISTIRAHAT";
        document.getElementById('timerMessage').innerText = "Istirahat Sejenak";
        card.classList.add('mode-break');
        
        if(!isPaused) {
            document.getElementById('startPauseBtn').innerText = "Lanjut Fokus (Skip Istirahat)";
            document.getElementById('startPauseBtn').setAttribute('onclick', 'resumeFocus()');
        } else {
            document.getElementById('startPauseBtn').innerText = "Lanjut Fokus";
            document.getElementById('startPauseBtn').setAttribute('onclick', 'resumeFocus()');
        }
    }
    
    if (timeLeft === 0) toggleMode();
}

function startTimer() {
    if (!isPaused) return;
    isPaused = false;
    
    if(isWorking) setFocusLock(true); 
    
    updateTimerDisplay();
    timerInterval = setInterval(() => { timeLeft--; updateTimerDisplay(); }, 1000);
}

function pauseTimer() {
    if (isPaused) return;
    isPaused = true;
    clearInterval(timerInterval);
    
    if (isWorking) {
        savedFocusTime = timeLeft; // SIMPAN WAKTU FOKUS
        
        isWorking = false; 
        
        // --- LOGIKA RECOVERY WAKTU ISTIRAHAT ---
        if (savedBreakTime !== null && savedBreakTime > 0) {
             timeLeft = savedBreakTime; 
        } else {
             timeLeft = isExamMode ? BREAK_DURATION_EXAM : BREAK_DURATION_DEFAULT; 
        }
        
        showToast("Fokus dijeda. Waktunya istirahat sebentar!", "info");
        
        updateTimerDisplay();
        startTimer(); 
    }
    
    setFocusLock(false); 
}

function resumeFocus() {
    savedBreakTime = timeLeft; // SIMPAN WAKTU ISTIRAHAT

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
    
    document.getElementById('startPauseBtn').innerText = "Mulai";
    document.getElementById('startPauseBtn').setAttribute('onclick', 'startTimer()');
    updateTimerDisplay();
    setFocusLock(false);
}

function toggleMode() {
    clearInterval(timerInterval);
    isPaused = true;
    isWorking = !isWorking;
    
    if (isWorking) {
         savedBreakTime = null; // Istirahat selesai, reset.
         if (savedFocusTime !== null) {
            timeLeft = savedFocusTime;
            savedFocusTime = null;
         } else {
            timeLeft = isExamMode ? WORK_DURATION_EXAM : WORK_DURATION_DEFAULT;
         }
    } else {
        savedFocusTime = null; // Fokus selesai, reset.
        savedBreakTime = null;
        timeLeft = isExamMode ? BREAK_DURATION_EXAM : BREAK_DURATION_DEFAULT;
    }

    playSuccessSound('bell');
    showToast(isWorking ? "Waktunya FOKUS! 🔔" : "Waktunya ISTIRAHAT! ☕", "info");
    updateTimerDisplay();
    startTimer(); 
}

function loadPomodoroTasks() {
    const selector = document.getElementById('pomodoroTaskSelector');
    if(!selector) return;
    selector.innerHTML = '<option value="">-- Pilih Tugas untuk Fokus --</option>';
    cachedData.tasks.filter(t => !t.completed).forEach(t => {
        const option = document.createElement('option');
        option.value = t.id; option.innerText = t.text; selector.appendChild(option);
    });
}

// --- JADWAL ---
function changeDay(dir) { currentDayIdx += dir; if(currentDayIdx>6) currentDayIdx=0; if(currentDayIdx<0) currentDayIdx=6; renderSchedule(); }
function changeWeekType() { 
    currentWeekType = document.getElementById('weekTypeSelector').value; 
    saveSetting('weekType', currentWeekType);
    renderSchedule(); 
}

function loadScheduleFilters() {
    const guruSet = new Set();
    const guruSelector = document.getElementById('scheduleFilterGuru');
    if (!guruSelector || !jadwalData) return;
    
    Object.values(jadwalData).forEach(week => {
        Object.values(week).forEach(dayData => {
            dayData.forEach(item => { if (item.guru) guruSet.add(item.guru); });
        });
    });
    guruSelector.innerHTML = '<option value="all">Filter Guru/Dosen (Semua)</option>';
    Array.from(guruSet).sort().forEach(guru => {
        guruSelector.innerHTML += `<option value="${escapeHtml(guru)}">${escapeHtml(guru)}</option>`;
    });
}

function getWeekNumber(d) {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    var yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

function renderSchedule() {
    const dayName = days[currentDayIdx];
    document.getElementById('activeDayName').innerText = dayName.toUpperCase();
    
    let currentWeekDisplay = currentWeekType;
    if (currentWeekType === 'auto') {
        currentWeekDisplay = (getWeekNumber(new Date()) % 2 !== 0) ? 'umum' : 'produktif';
    }
    
    if(!jadwalData) return;
    let data = jadwalData[currentWeekDisplay][dayName];
    const tbody = document.getElementById('scheduleBody');

    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const curMins = currentHour * 60 + currentMinute;
    const isToday = currentDayIdx === now.getDay();
    
    tbody.innerHTML = '';
    
    const filterCategory = document.getElementById('scheduleFilterCategory').value;
    const filterGuru = document.getElementById('scheduleFilterGuru').value;

    if (data) {
        data = data.filter(item => {
            return (filterCategory === 'all' || item.type === filterCategory) && 
                   (filterGuru === 'all' || item.guru === filterGuru);
        });
    }

    let statusWidget = document.getElementById('liveStatusWidget');
    if (!statusWidget) {
        const container = document.querySelector('.schedule-status-bar');
        if(container) {
            container.outerHTML = `
            <div id="liveStatusWidget" class="live-status-widget">
                <div class="status-icon-box"><i class="fas fa-bolt" id="statusIcon"></i></div>
                <div class="status-content">
                    <h4 id="statusLabel">STATUS SAAT INI</h4>
                    <p id="statusText">Memuat...</p>
                </div>
            </div>`;
            statusWidget = document.getElementById('liveStatusWidget');
        }
    }

    if(!data || data.length === 0) { 
        tbody.parentElement.style.display='none'; 
        document.getElementById('holidayMessage').style.display='block'; 
        
        if(statusWidget) {
            document.getElementById('statusText').innerText = "Tidak ada jadwal (Libur)";
            document.getElementById('statusIcon').className = "fas fa-mug-hot";
            statusWidget.className = "live-status-widget status-chill";
        }
        return; 
    }
    
    tbody.parentElement.style.display='table'; 
    document.getElementById('holidayMessage').style.display='none';
    
    let statusText = "Belum Mulai";
    let statusClass = "live-status-widget"; 
    let iconClass = "fas fa-clock";

    if (isToday) {
        if (currentHour >= 17) {
            statusText = "Selesai. Sampai Jumpa Besok!";
            statusClass = "live-status-widget status-chill";
            iconClass = "fas fa-moon";
        } else {
            let ongoing = false;
            data.forEach(item => {
                const parts = item.time.split("-");
                if(parts.length >= 2) {
                    const start = parts[0].trim().replace(/\./g, ':').split(':').map(Number);
                    const end = parts[1].trim().split(" ")[0].replace(/\./g, ':').split(':').map(Number);
                    const sM = start[0]*60+start[1]; 
                    const eM = end[0]*60+end[1];
                    
                    if(curMins >= sM && curMins < eM) { 
                        statusText = `Sedang Berlangsung: ${item.mapel}`; 
                        statusClass = "live-status-widget status-busy"; 
                        iconClass = "fas fa-book-reader";
                        ongoing = true;
                    }
                }
            });
            if (!ongoing && currentHour < 17) {
                if (curMins < (7*60 + 45)) { 
                     statusText = "Menunggu jam masuk...";
                     iconClass = "fas fa-hourglass-start";
                } else {
                     statusText = "Istirahat / Pergantian Jam";
                     statusClass = "live-status-widget status-chill";
                     iconClass = "fas fa-coffee";
                }
            }
        }
    } else {
        statusText = `Lihat Jadwal Hari ${dayName}`;
        statusClass = "live-status-widget status-chill";
        iconClass = "fas fa-calendar-alt";
    }

    if(statusWidget) {
        document.getElementById('statusText').innerText = statusText;
        document.getElementById('statusIcon').className = iconClass;
        statusWidget.className = statusClass;
    }

    data.forEach((item, idx) => {
        let isActive = false;
        if (isToday && currentHour < 17) {
            const parts = item.time.split("-");
            if(parts.length >= 2) {
                const start = parts[0].trim().replace(/\./g, ':').split(':').map(Number);
                const end = parts[1].trim().split(" ")[0].replace(/\./g, ':').split(':').map(Number);
                const sM = start[0]*60+start[1]; const eM = end[0]*60+end[1];
                if(curMins >= sM && curMins < eM) { isActive = true; }
            }
        }
        
        const noteElem = `<button class="btn-note" onclick="alert('Fitur catatan per mapel akan hadir di update berikutnya!')">
                            <i class="fas fa-sticky-note"></i> Catatan
                          </button>`;
        
        const editElem = `<button class="btn-edit-round" onclick="openScheduleEdit('${dayName}',${idx})" title="Edit Jadwal">
                            <i class="fas fa-pencil-alt"></i>
                          </button>`;
        
        tbody.innerHTML += `
        <tr class="${isActive?'active-row':''}">
            <td><b>${escapeHtml(item.mapel)}</b><br><small style="color:var(--text-sub)">${escapeHtml(item.guru || '')}</small></td>
            <td>${escapeHtml(item.time)}</td>
            <td>${noteElem}</td>
            <td>${editElem}</td>
        </tr>`;
    });
}

let currentScheduleEdit = null;
function openScheduleEdit(day, idx) {
    currentScheduleEdit = { day, idx };
    let displayType = currentWeekType === 'auto' ? ((getWeekNumber(new Date()) % 2 !== 0) ? 'umum' : 'produktif') : currentWeekType;
    const item = jadwalData[displayType][day][idx];
    
    document.getElementById('editMapelName').value = item.mapel;
    document.getElementById('editMapelTime').value = item.time;
    document.getElementById('editMapelType').value = item.type;
    document.getElementById('scheduleEditModal').style.display = 'flex';
}

function saveScheduleChanges() {
    const name = escapeHtml(document.getElementById('editMapelName').value);
    const time = escapeHtml(document.getElementById('editMapelTime').value);
    const type = document.getElementById('editMapelType').value;
    
    if (!name || !time) return showToast("Data tidak boleh kosong!", "error");
    
    const { day, idx } = currentScheduleEdit;
    let displayType = currentWeekType === 'auto' ? ((getWeekNumber(new Date()) % 2 !== 0) ? 'umum' : 'produktif') : currentWeekType;
    
    jadwalData[displayType][day][idx] = { ...jadwalData[displayType][day][idx], mapel: name, time, type };
    saveDB('jadwalData', jadwalData);
    
    document.getElementById('scheduleEditModal').style.display = 'none'; 
    showToast("Jadwal diupdate!", "success");
}
function closeScheduleEditModal() { document.getElementById('scheduleEditModal').style.display = 'none'; }


// --- TO-DO LIST ---
function formatDateIndo(dateString) { if(!dateString) return ""; return new Date(dateString).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' }); }
function getDaysRemaining(dateString) { if (!dateString) return null; const target = new Date(dateString); target.setHours(0,0,0,0); const today = new Date(); today.setHours(0,0,0,0); return Math.ceil((target - today) / (1000 * 60 * 60 * 24)); }
function filterTasks(type, btn) { taskFilter = type; document.querySelectorAll('.tab').forEach(b => b.classList.remove('active')); btn.classList.add('active'); loadTasks(); }

function handleTaskButton() {
    const text = escapeHtml(document.getElementById('taskInput').value);
    const date = document.getElementById('taskDate').value; 
    const priority = document.getElementById('taskPriority').value;

    if(!text) return showToast("Isi nama tugas dulu!", 'error');
    if(!date) return showToast("Pilih tanggal deadline dulu!", 'error');

    let tasks = getDB('tasks'); 

    if(editingTaskId) {
        const idx = tasks.findIndex(t => t.id === editingTaskId);
        if(idx !== -1) { tasks[idx].text = text; tasks[idx].date = date; tasks[idx].priority = priority; showToast("Tugas diupdate!", "success"); }
        editingTaskId = null; document.getElementById('addTaskBtn').innerHTML = `Tambah Tugas`;
    } else {
        tasks.push({ id: Date.now(), text, date: date, priority, completed: false });
        playSuccessSound('ding'); showToast("Tugas ditambah ke Cloud!", "success");
    }
    
    saveDB('tasks', tasks);
    document.getElementById('taskInput').value = ''; document.getElementById('taskDate').value = ''; 
}

function loadTaskToEdit(id) {
    const task = cachedData.tasks.find(t => t.id === id);
    if(task) {
        document.getElementById('taskInput').value = task.text;
        document.getElementById('taskDate').value = task.date; 
        document.getElementById('taskPriority').value = task.priority;
        editingTaskId = id;
        document.getElementById('addTaskBtn').innerHTML = `Simpan`;
        document.getElementById('taskInput').focus();
    }
}

function loadTasks() {
    const list = document.getElementById('taskList');
    const tasks = cachedData.tasks || [];
    list.innerHTML = '';
    
    const total = tasks.length; 
    const done = tasks.filter(t => t.completed).length;
    const pct = total ? Math.round((done/total)*100) : 0;
    document.getElementById('taskProgressText').innerText = `${pct}%`;
    document.getElementById('taskProgressPath').style.strokeDasharray = `${pct}, 100`;

    const search = document.getElementById('searchTaskInput').value.toLowerCase();
    let filtered = tasks.filter(t => {
        if(taskFilter === 'pending') return !t.completed;
        if(taskFilter === 'completed') return t.completed;
        return t.text.toLowerCase().includes(search);
    });

    if (filtered.length === 0) {
        list.innerHTML = `<div class="empty-message"><i class="fas fa-clipboard-check"></i><p>Tidak ada tugas.</p></div>`;
        renderUrgentDeadlines(tasks);
        return;
    }

    filtered.sort((a, b) => new Date(a.date) - new Date(b.date));

    filtered.forEach(t => {
        const daysLeft = getDaysRemaining(t.date);
        let dateDisplay = `<i class="far fa-calendar"></i> ${formatDateIndo(t.date)}`;
        let badgeClass = 'deadline-far';
        
        if (daysLeft !== null && !t.completed) {
            if (daysLeft < 0) { dateDisplay = `⚠️ Telat ${Math.abs(daysLeft)} hari`; badgeClass = 'deadline-urgent'; }
            else if (daysLeft === 0) { dateDisplay = `🔥 HARI INI`; badgeClass = 'deadline-urgent'; }
            else if (daysLeft === 1) { dateDisplay = `⏰ Besok`; badgeClass = 'deadline-near'; }
            else { 
                dateDisplay = `📅 ${daysLeft} Hari Lagi (${formatDateIndo(t.date)})`; 
                badgeClass = daysLeft <= 3 ? 'deadline-near' : 'deadline-far'; 
            }
        }

        const randomWord = funWords[Math.floor(Math.random() * funWords.length)];

        list.innerHTML += `
            <li class="task-item priority-${t.priority} ${t.completed ? 'completed' : ''}">
                <div class="task-content" style="display:flex;align-items:center;width:100%;">
                    <div class="check-btn" onclick="toggleTask(${t.id})"><i class="fas fa-check"></i></div>
                    <div class="task-text">
                        <span>${escapeHtml(t.text)}</span>
                        <small class="${badgeClass}">${dateDisplay} • ${t.priority}</small>
                    </div>
                     <span class="fun-badge">${randomWord}</span>
                </div>
                <div class="task-actions">
                    <button class="action-btn" onclick="loadTaskToEdit(${t.id})"><i class="fas fa-pencil-alt"></i></button>
                    <button class="action-btn delete" onclick="deleteTask(${t.id})"><i class="fas fa-trash"></i></button>
                </div>
            </li>`;
    });
    renderUrgentDeadlines(tasks);
}

function renderUrgentDeadlines(tasks) {
    const urgentList = document.getElementById('urgentList');
    if(!urgentList) return; 
    urgentList.innerHTML = '';
    const urgentTasks = tasks.filter(t => {
        const days = getDaysRemaining(t.date);
        return !t.completed && days !== null && days >= 0 && days <= 3;
    });
    
    if (urgentTasks.length === 0) urgentList.innerHTML = '<div style="text-align:center;color:var(--text-sub);padding:10px;">Aman! Tidak ada deadline dekat. 🎉</div>';
    else {
        urgentTasks.forEach(t => {
            const days = getDaysRemaining(t.date);
            let textDay = days === 0 ? "Hari Ini!" : days === 1 ? "Besok" : `${days} Hari`;
            urgentList.innerHTML += `<li class="urgent-item"><span>${escapeHtml(t.text)}</span><span class="urgent-days">${textDay}</span></li>`;
        });
    }
}

function toggleTask(id) { 
    const tasks = cachedData.tasks; 
    const t = tasks.find(x => x.id === id); 
    if(t) { 
        t.completed = !t.completed; 
        if(t.completed) playSuccessSound('ding');
        saveDB('tasks', tasks); 
    }
}

function deleteTask(id) { 
    if(confirm("Hapus?")) { 
        const tasks = cachedData.tasks.filter(x => x.id !== id); 
        saveDB('tasks', tasks); 
    } 
}

function clearCompletedTasks() {
    const tasks = cachedData.tasks.filter(t => !t.completed);
    if(confirm("Hapus semua yang selesai?")) saveDB('tasks', tasks);
}

// --- KEUANGAN ---
function addTransaction(type) {
    const desc = escapeHtml(document.getElementById('moneyDesc').value);
    const amount = parseInt(document.getElementById('moneyAmount').value);
    const wallet = document.getElementById('selectedWallet').value; 
    const category = document.getElementById('txnCategory').value;
    
    if(!desc || !amount || amount <= 0) return showToast("Data tidak valid!", 'error');
    
    const newTxn = { id: Date.now(), desc, amount, type, wallet, category, date: new Date().toISOString().split('T')[0] };
    let txns = cachedData.transactions;
    txns.push(newTxn);
    
    lastTransaction = newTxn;
    saveDB('transactions', txns);
    
    if(type === 'in') playSuccessSound('coin'); 
    document.getElementById('moneyDesc').value = ''; document.getElementById('moneyAmount').value = '';
    showToast(`${type==='in'?"Masuk":"Keluar"} Rp ${amount.toLocaleString('id-ID')} tercatat!`, type==='in'?'success':'error');
}

function loadTransactions() {
    const list = document.getElementById('transactionList');
    const txns = cachedData.transactions || [];
    const filter = document.getElementById('historyFilter').value;
    let bal = { total:0, dana:0, ovo:0, gopay:0, cash:0 };
    list.innerHTML = '';
    
    txns.forEach(t => {
        if(t.type === 'in') { bal.total+=t.amount; bal[t.wallet]+=t.amount; } 
        else { bal.total-=t.amount; bal[t.wallet]-=t.amount; }
    });

    const displayTxns = txns.slice().reverse();
    displayTxns.forEach(t => {
        let show = (filter === 'all') || (filter === 'in' && t.type === 'in') || (filter === 'out' && t.type === 'out');
        if(show) {
            const color = t.type === 'in' ? 'var(--green)' : 'var(--red)';
            const sign = t.type === 'in' ? '+' : '-';
            list.innerHTML += `
                <li class="txn-item">
                    <div class="txn-left"><b>${escapeHtml(t.desc)}</b><small>${t.wallet.toUpperCase()} • ${t.category}</small></div>
                    <div class="txn-right"><b style="color:${color}">${sign} Rp ${t.amount.toLocaleString('id-ID')}</b>
                    <button class="delete-txn-btn" onclick="delTxn(${t.id})"><i class="fas fa-trash"></i></button></div>
                </li>`;
        }
    });

    document.getElementById('totalBalance').innerText = "Rp " + bal.total.toLocaleString('id-ID');
    ['dana','ovo','gopay','cash'].forEach(k => document.getElementById(`saldo-${k}`).innerText = "Rp " + bal[k].toLocaleString('id-ID'));
    
    renderExpenseChart(txns);
}

function delTxn(id) { 
    if(confirm("Hapus?")) { 
        const t = cachedData.transactions.filter(x => x.id !== id); 
        saveDB('transactions', t); 
    } 
}

// --- FUNGSI DOWNLOAD KEUANGAN (BARU) ---
window.exportFinanceReport = function() {
    const txns = cachedData.transactions || [];
    if (txns.length === 0) return showToast("Belum ada data transaksi!", "error");

    let csvContent = "Tanggal,Keterangan,Kategori,Tipe,Jumlah,Dompet\n";

    txns.forEach(t => {
        const type = t.type === 'in' ? 'Pemasukan' : 'Pengeluaran';
        // Handle comma in desc by wrapping in quotes
        const desc = `"${t.desc.replace(/"/g, '""')}"`;
        const row = `${t.date},${desc},${t.category},${type},${t.amount},${t.wallet.toUpperCase()}`;
        csvContent += row + "\n";
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Laporan_Keuangan_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Laporan berhasil diunduh!", "success");
}

function editTarget() { 
    const uid = window.auth.currentUser.uid;
    const val = prompt("Target Tabungan (Rp):", localStorage.getItem(`${uid}_target`) || 0); 
    if(val && !isNaN(val)) { 
        localStorage.setItem(`${uid}_target`, val); 
        saveSetting('target', val); 
        loadTarget(); 
    } 
}

function loadTarget() {
    const uid = window.auth.currentUser ? window.auth.currentUser.uid : null;
    if(!uid) return;

    const target = parseInt(localStorage.getItem(`${uid}_target`) || 0);
    const txns = cachedData.transactions;
    
    let saving = 0; 
    txns.forEach(t => { 
        if(t.category === 'Tabungan' && t.type === 'in') {
            saving += t.amount; 
        }
        if(t.category === 'Tabungan' && t.type === 'out') {
            saving -= t.amount;
        }
    });
    
    if (saving < 0) saving = 0;

    document.getElementById('targetAmount').innerText = "Rp " + target.toLocaleString('id-ID');
    
    let pct = 0;
    if (target > 0) {
        pct = (saving / target) * 100;
    }
    if (pct > 100) pct = 100;

    let pctDisplay = pct.toFixed(1); 
    if (pctDisplay.endsWith('.0')) pctDisplay = Math.round(pct);

    document.getElementById('targetProgressBar').style.width = `${pct}%`;
    document.getElementById('targetPercentage').innerText = `${pctDisplay}% (Rp ${saving.toLocaleString('id-ID')})`;
}

function renderExpenseChart(txns) {
    const container = document.getElementById('expenseChartContainer');
    let total = 0; let cats = {};
    txns.forEach(t => { if(t.type === 'out') { total+=t.amount; cats[t.category] = (cats[t.category]||0)+t.amount; }});
    
    if(total === 0) { container.innerHTML = `<div class="empty-message small"><p>Belum ada pengeluaran.</p></div>`; return; }
    
    let html = '';
    const colors = { 'Jajan':'#f97316', 'Transport':'#3b82f6', 'Tabungan':'#10b981', 'Belanja':'#8b5cf6', 'Lainnya':'#6b7280' };
    
    Object.keys(cats).forEach(c => {
        const pct = Math.round((cats[c]/total)*100);
        html += `
        <div class="expense-item">
            <div class="expense-label"><span class="dot" style="background:${colors[c]||'#ccc'}"></span>${c}</div>
            <div class="expense-value">Rp ${cats[c].toLocaleString('id-ID')} <small>(${pct}%)</small></div>
            <div class="expense-bar-bg"><div class="expense-bar-fill" style="width:${pct}%;background:${colors[c]||'#ccc'}"></div></div>
        </div>`;
    });
    container.innerHTML = html;
}

function loadSoundSettings() { 
    const uid = window.auth.currentUser ? window.auth.currentUser.uid : null;
    if(uid) soundPreference = localStorage.getItem(`${uid}_soundPreference`) || 'bell'; 
    if(document.getElementById('pomodoroSoundSelect')) document.getElementById('pomodoroSoundSelect').value = soundPreference; 
}
function saveSoundSettings() { 
    const uid = window.auth.currentUser.uid;
    soundPreference = document.getElementById('pomodoroSoundSelect').value; 
    localStorage.setItem(`${uid}_soundPreference`, soundPreference); 
    document.getElementById('soundModal').style.display='none'; 
    showToast("Suara disimpan!", "success"); 
}
function showSoundSettings() { document.getElementById('soundModal').style.display='flex'; }
function checkExamMode() {
    const financeCard = document.getElementById('financeCard');
    if(financeCard) financeCard.style.display = isExamMode ? 'none' : 'block';
    timeLeft = isExamMode ? WORK_DURATION_EXAM : WORK_DURATION_DEFAULT; 
    updateTimerDisplay();
}
function toggleExamMode() { 
    isExamMode = !isExamMode; 
    saveSetting('isExamMode', isExamMode);
    checkExamMode(); 
    showToast(isExamMode ? "Mode Ujian AKTIF" : "Mode Ujian NONAKTIF", 'info'); 
}
function checkReminders() { 
    if(!jadwalData) return;
    const now=new Date(); const m=now.getHours()*60+now.getMinutes(); const d=days[now.getDay()]; 
    let displayType = currentWeekType === 'auto' ? ((getWeekNumber(new Date()) % 2 !== 0) ? 'umum' : 'produktif') : currentWeekType;
    const data=jadwalData[displayType][d]; 
    if(data) data.forEach(i => { const p=i.time.split("-"); if(p.length>=2) { const s=p[0].trim().replace(/\./g,':').split(':').map(Number); if(m===(s[0]*60+s[1])-5) showToast(`🔔 5 Menit lagi: ${i.mapel}`, 'info'); } }); 
}
function escapeHtml(text) { if (!text) return text; return String(text).replace(/[&<>"']/g, function(m) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[m]; }); }

function loadRandomQuote() {
    if(document.getElementById('motivationQuote')) {
        const randomIndex = Math.floor(Math.random() * motivationalQuotes.length);
        document.getElementById('motivationQuote').innerText = `"${motivationalQuotes[randomIndex]}"`;
    }
}

function openClearDataModal() { if(confirm("Yakin hapus data lokal dan logout?")) { localStorage.clear(); location.reload(); } }
function exportData() { 
    const d=cachedData; 
    const b=new Blob([JSON.stringify(d)],{type:"application/json"}); 
    const a=document.createElement('a'); a.href=URL.createObjectURL(b); a.download=`${currentUser}_backup.json`; a.click(); 
}

// --- UTILS UI & RESTORE DATA ---
window.toggleSettings = function() { 
    const dropdown = document.getElementById('settingsDropdown');
    if (dropdown) dropdown.classList.toggle('active');
}

window.selectWallet = function(walletId, el) {
    document.getElementById('selectedWallet').value = walletId;
    document.querySelectorAll('.wallet-card').forEach(card => {
        card.classList.remove('active');
    });
    el.classList.add('active');
}

window.importData = function(input) {
    const file = input.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            if (confirm("Apakah Anda yakin ingin menimpa data saat ini dengan data backup?")) {
                cachedData = data;
                saveAllToCloud(); 
                showToast("Data berhasil direstore!", "success");
                setTimeout(() => location.reload(), 1000);
            }
        } catch (err) {
            console.error(err);
            showToast("File backup rusak atau tidak valid!", "error");
        }
    };
    reader.readAsText(file);
    input.value = '';
}

// --- FITUR TAMBAH JADWAL ---
window.openAddScheduleModal = function() {
    const currentDayName = days[currentDayIdx];
    document.getElementById('addScheduleDay').value = currentDayName;
    
    let currentType = document.getElementById('weekTypeSelector').value;
    if(currentType === 'auto') currentType = 'umum'; 
    document.getElementById('addScheduleWeekType').value = currentType;

    document.getElementById('addScheduleMapel').value = '';
    document.getElementById('addScheduleGuru').value = '';
    document.getElementById('addScheduleTime').value = '';
    
    document.getElementById('addScheduleModal').style.display = 'flex';
}

window.saveNewSchedule = function() {
    const weekType = document.getElementById('addScheduleWeekType').value;
    const day = document.getElementById('addScheduleDay').value;
    const mapel = document.getElementById('addScheduleMapel').value;
    const guru = document.getElementById('addScheduleGuru').value;
    const time = document.getElementById('addScheduleTime').value;
    const type = document.getElementById('addScheduleType').value;

    if(!mapel || !time) {
        showToast("Nama Mapel dan Waktu wajib diisi!", "error");
        return;
    }

    const newItem = { mapel, guru, time, type };

    if (!jadwalData[weekType]) jadwalData[weekType] = {};
    if (!jadwalData[weekType][day]) jadwalData[weekType][day] = [];

    jadwalData[weekType][day].push(newItem);
    
    jadwalData[weekType][day].sort((a, b) => {
        const timeA = a.time.split('-')[0].trim().replace('.',':');
        const timeB = b.time.split('-')[0].trim().replace('.',':');
        return timeA.localeCompare(timeB);
    });

    saveDB('jadwalData', jadwalData);
    renderSchedule();
    document.getElementById('addScheduleModal').style.display = 'none';
    showToast("Jadwal berhasil ditambahkan!", "success");
}

// --- FITUR HAPUS JADWAL ---
window.deleteSchedule = function() {
    if (!currentScheduleEdit) return;
    
    if(confirm("Yakin ingin menghapus jadwal mata pelajaran ini?")) {
        const { day, idx } = currentScheduleEdit;
        let displayType = currentWeekType;
        if (currentWeekType === 'auto') {
             displayType = (getWeekNumber(new Date()) % 2 !== 0) ? 'umum' : 'produktif';
        }

        if(jadwalData[displayType] && jadwalData[displayType][day]) {
            jadwalData[displayType][day].splice(idx, 1);
            saveDB('jadwalData', jadwalData);
            renderSchedule();
            closeScheduleEditModal();
            showToast("Jadwal berhasil dihapus!", "success");
        }
    }
}

window.closeNoteModal = function() { document.getElementById('noteModal').style.display = 'none'; }
window.saveNoteFromModal = function() { showToast("Catatan disimpan (Placeholder)", "success"); closeNoteModal(); }
window.deleteNote = function() { if(confirm("Hapus catatan?")) { document.getElementById('noteModalInput').value = ""; closeNoteModal(); } }