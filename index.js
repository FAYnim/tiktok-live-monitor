// --- Import Library ---
const express = require("express");
const http = require("http");
const axios = require("axios");
const { Server } = require("socket.io");
const { TikTokLiveConnection } = require("tiktok-live-connector");

// --- Konfigurasi ---
const tiktok_username = "itshoopss";
const port = 3000;
const max_comments = 10;
const external_api_url = "https://faydev.my.id/hosted/tiktok-api/api";

// --- Inisialisasi Server ---
const app = express();
const server = http.createServer(app);
const io = new Server(server);
app.use(express.static("public"));

// --- State Management ---
let stats = {
    views: 0,
    likes: 0,
    shares: 0,
    gifts: [],
    comments: [],
};

// --- Fungsi Helper ---
// Mengirim data statistik ke client
function sendUpdateToClient(updatedStats) {
    io.emit("update", updatedStats);
}

// Mengirim data gift ke server eksternal
function sendDataToServer(data) {
    axios.post(external_api_url, data, {
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
const tiktokLive = new TikTokLiveConnection(tiktok_username);

// Menghubungkan ke room live
tiktokLive.connect().catch(err => {
    console.error("Gagal terhubung ke TikTok Live:", err);
});

// Listener saat koneksi berhasil
tiktokLive.on('connected', () => {
    console.log(`Terhubung ke live room @${tiktok_username}`);
});

// Listener untuk jumlah penonton
tiktokLive.on("roomUser", (data) => {
    stats.views = data.viewerCount || 0;
    console.log(data);
    sendUpdateToClient(stats);
});

// Listener untuk like
tiktokLive.on("like", (data) => {
    stats.likes += data.likeCount || 1;
    sendUpdateToClient(stats);
});

// Listener untuk share
tiktokLive.on("share", (data) => {
    stats.shares += 1;
    sendUpdateToClient(stats);
});

// Listener untuk gift
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
    sendDataToServer(giftData);
});

// Listener untuk komentar
tiktokLive.on("chat", (data) => {
    const newComment = {
        user: data.user.nickname,
        comment: data.comment,
        timestamp: new Date().toLocaleTimeString(),
    };
    stats.comments.push(newComment);

    // Batasi jumlah komentar
    if (stats.comments.length > max_comments) {
        stats.comments.shift();
    }

    sendUpdateToClient(stats);
});

// Listener saat koneksi terputus
tiktokLive.on('disconnected', () => {
    console.log('Koneksi terputus dari live room.');
});


// --- Menjalankan Server ---
server.listen(port, () => {
    console.log(`Server berjalan di http://localhost:${port}`);
});
