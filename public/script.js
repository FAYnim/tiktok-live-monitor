const socket = io();

socket.on("update", data => {
    document.getElementById("views").textContent = data.views;
    document.getElementById("likes").textContent = data.likes;
    document.getElementById("shares").textContent = data.shares;

    const giftList = document.getElementById("gifts");
    giftList.innerHTML = "";
    data.gifts.slice(-5).forEach(g => {
        const li = document.createElement("li");
        li.textContent = `${g.user} sent ${g.gift} x${g.repeat}`;
        giftList.appendChild(li);
    });

    const commentDiv = document.getElementById("comments");
    commentDiv.innerHTML = ""; // Clear previous comments
    data.comments.forEach(c => {
        const card = document.createElement("div");
        card.className = "comment-card";
        card.innerHTML = `<strong>${c.user}</strong>: ${c.comment} <small>${c.timestamp}</small>`;
        commentDiv.insertBefore(card, commentDiv.firstChild); // Add new comments to the top
    });
});