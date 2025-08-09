// --- Import Library ---
const express = require("express");
const http = require("http");
const axios = require("axios");
const { Server } = require("socket.io");
const { TikTokLiveConnection } = require("tiktok-live-connector");

// --- Konfigurasi (Bagian untuk diedit) ---
// Ganti dengan username TikTok yang ingin Anda pantau
const TIKTOK_USERNAME = "andyleeman";
const PORT = 3000; // Port untuk server
const MAX_COMMENTS = 10; // Jumlah maksimal komentar yang ditampilkan
const EXTERNAL_API_URL = "https://faydev.my.id/hosted/tiktok-api/api.php"; // URL API eksternal

// --- Inisialisasi Server ---
const app = express();
const server = http.createServer(app);
const io = new Server(server);
app.use(express.static("public"));

// --- State Management ---
// Variabel untuk menyimpan semua data dari live stream
let stats = {
    views: 0,
    likes: 0,
    shares: 0,
    gifts: [],
    comments: [],
};

// --- Fungsi Helper ---

/**
 * Mengirim data statistik terbaru ke semua klien (browser) yang terhubung.
 * @param {object} updatedStats - Objek 'stats' yang sudah diperbarui.
 */
function sendUpdateToClient(updatedStats) {
    io.emit("update", updatedStats);
}

/**
 * Mengirim data spesifik (seperti gift) ke server eksternal.
 * @param {object} data - Data yang akan dikirim.
 */
function sendDataToServer(data) {
    axios.post(EXTERNAL_API_URL, data, {
        headers: { "Content-Type": "application/json" }
    })
    .then(res => {
        console.log("Respon dari server eksternal:", res.data);
    })
    .catch(err => {
        console.error("Gagal mengirim data ke server eksternal:", err.message);
    });
}

// --- Logika Utama TikTok Live ---

// Membuat koneksi baru ke TikTok Live
const tiktokLive = new TikTokLiveConnection(TIKTOK_USERNAME);

// Mencoba menghubungkan ke room live
tiktokLive.connect().catch(err => {
    console.error("Gagal terhubung ke TikTok Live:", err);
});

// Event listener: dipicu saat koneksi berhasil
tiktokLive.on('connected', () => {
    console.log(`Terhubung ke live room @${TIKTOK_USERNAME}`);
});

// Event listener: dipicu saat ada update jumlah penonton
tiktokLive.on("roomUser", (data) => {
    stats.views = data.totalUserCount || 0;
    sendUpdateToClient(stats);
});

// Event listener: dipicu saat ada yang memberi 'like'
tiktokLive.on("like", (data) => {
    stats.likes += data.likeCount || 1;
    sendUpdateToClient(stats);
});

// Event listener: dipicu saat ada yang 'share' live
tiktokLive.on("share", (data) => {
    stats.shares += 1; // Setiap event 'share' dihitung sebagai 1
    sendUpdateToClient(stats);
});

// Event listener: dipicu saat ada yang memberi 'gift'
tiktokLive.on("gift", (data) => {
    const giftData = {
        user_id: data.user.userId,
        user_uid: data.user.uniqueId,
        user_nickname: data.user.nickname,
        gift_name: data.giftDetails.giftName,
        gift_amount: data.repeatCount,
    };
    stats.gifts.push(giftData);
    sendUpdateToClient(stats);
    sendDataToServer(giftData); // Mengirim data gift ke API eksternal
});

// Event listener: dipicu saat ada komentar baru
tiktokLive.on("chat", (data) => {
    const newComment = {
        user: data.user.nickname,
        comment: data.comment,
        timestamp: new Date().toLocaleTimeString(),
    };
    stats.comments.push(newComment);

    // Jaga agar array komentar tidak terlalu panjang
    if (stats.comments.length > MAX_COMMENTS) {
        stats.comments.shift();
    }
    
    sendUpdateToClient(stats);
});

// Event listener: dipicu saat koneksi terputus
tiktokLive.on('disconnected', () => {
    console.log('Koneksi terputus dari live room.');
});


// --- Menjalankan Server ---
server.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});
