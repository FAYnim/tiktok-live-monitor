// --- Import Library ---
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const { TikTokLiveConnection } = require("tiktok-live-connector");

// --- Konfigurasi ---
const port = 3000;
const max_comments = 10;

// --- Inisialisasi Server ---
const app = express();
const server = http.createServer(app);
const io = new Server(server);
app.use(express.static("public"));

// --- State Management ---
let stats = {};
let tiktokLive;
let isTiktokConnected = false;

const resetStats = () => {
    stats = {
        views: 0,
        total_users: 0,
        likes: 0,
        shares: 0,
        gifts: [],
        comments: [],
    };
};
resetStats();

// --- Fungsi Helper ---
function sendUpdateToClient(updatedStats) {
    io.emit("update", updatedStats);
}

function setupTikTokListeners(liveConnection, username, socket) {
    liveConnection.on('connected', () => {
        isTiktokConnected = true;
        console.log(`Terhubung ke live room @${username}`);
        socket.emit('connect_success', `Terhubung ke @${username}`);
    });

    liveConnection.on('disconnected', () => {
        isTiktokConnected = false;
        console.log(`Koneksi terputus dari @${username}`);
        io.emit('tiktok_disconnected');
    });

    liveConnection.on("roomUser", (data) => {
        stats.views = data.viewerCount || 0;
        if (data.totalUser) {
            stats.total_users = data.totalUser;
        }
        sendUpdateToClient(stats);
    });

    liveConnection.on("like", (data) => {
        stats.likes += data.likeCount || 1;
        sendUpdateToClient(stats);
    });

    liveConnection.on("share", (data) => {
        stats.shares += 1;
        sendUpdateToClient(stats);
    });

    liveConnection.on("gift", (data) => {
        const giftData = {
            user_id: data.user.userId,
            user_uid: data.user.uniqueId,
            user_nickname: data.user.nickname,
            gift_name: data.giftDetails.giftName,
            gift_amount: data.repeatCount,
        };
        stats.gifts.push(giftData);
        sendUpdateToClient(stats);
    });

    liveConnection.on("chat", (data) => {
        const newComment = {
            user: data.user.nickname,
            comment: data.comment,
            timestamp: new Date().toLocaleTimeString(),
        };
        stats.comments.push(newComment);
        if (stats.comments.length > max_comments) {
            stats.comments.shift();
        }
        sendUpdateToClient(stats);
    });
}

// --- Logika Socket.IO ---
io.on('connection', (socket) => {
    console.log('Client terhubung ke server');

    socket.on('set_username', (username) => {
        console.log(`Mencoba terhubung ke @${username}`);

        if (tiktokLive && isTiktokConnected) {
            console.log('Memutuskan koneksi lama...');
            tiktokLive.disconnect();
        }

        resetStats();
        sendUpdateToClient(stats);

        tiktokLive = new TikTokLiveConnection(username);
        setupTikTokListeners(tiktokLive, username, socket);

        tiktokLive.connect().catch(err => {
            console.error(`Gagal terhubung ke @${username}:`, err.message);
            socket.emit('connect_error', `Gagal terhubung ke @${username}. Pastikan username benar dan sedang live.`);
        });
    });

    socket.on('disconnect_tiktok', () => {
        if (tiktokLive && isTiktokConnected) {
            console.log('Client meminta disconnect.');
            tiktokLive.disconnect();
            resetStats();
            sendUpdateToClient(stats);
        }
    });

    socket.on('disconnect', () => {
        console.log('Client terputus dari server.');
    });
});

// --- Menjalankan Server ---
server.listen(port, () => {
    console.log(`Server berjalan di http://localhost:${port}`);
});
