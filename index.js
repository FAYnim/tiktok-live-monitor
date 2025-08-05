const express = require("express");
const http = require("http");
const axios = require("axios");
const { Server } = require("socket.io");
const { TikTokLiveConnection } = require("tiktok-live-connector");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

const tiktokUsername = "davidcrossland4";
const tiktokLive = new TikTokLiveConnection(tiktokUsername);

let stats = {
    views: 0,
    likes: 0,
    shares: 0,
    gifts: [],
    comments: [],
};
let data = {
};

function sendServer(data){
    axios.post("https://faydev.my.id/hosted/tiktok-api/api", data, {
        headers: {
            "Content-Type": "application/json"
        }
    })
    .then(res => {
        console.log(res.data);
    })
    .catch(err => {
        console.error(err.message);
    });
}

function sendUpdate(updatedStats) {
    io.emit("update", updatedStats);
}

tiktokLive.connect().catch(err => console.error("Gagal konek:", err));

tiktokLive.on("roomUser", data => {
    stats.views = data.totalUserCount || 0;
    sendUpdate(stats);
});

tiktokLive.on("like", data => {
    stats.likes += data.likeCount || 1;
    sendUpdate(stats);
});

tiktokLive.on("share", data => {
    stats.shares += 1;
    sendUpdate(stats);
});

tiktokLive.on("gift", data => {
    const giftData = {
    	user_id: data.user.userId,
    	user_uid: data.user.uniqueId,
        user_nickname: data.user.nickname,
        gift_name: data.giftDetails.giftName,
        gift_amount: data.repeatCount,
    };
    stats.gifts.push(giftData);

    sendUpdate(stats);

    sendServer(giftData);
});

tiktokLive.on("chat", data => {
    const newComment = {
        user: data.user.nickname,
        comment: data.comment,
        timestamp: new Date().toLocaleTimeString(),
    };
    stats.comments.push(newComment);
    if (stats.comments.length > 10) stats.comments.shift();
    sendUpdate(stats);
});

server.listen(3000, () => {
    console.log("Server berjalan di http://localhost:3000");
});