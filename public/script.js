document.addEventListener('DOMContentLoaded', () => {
    const socket = io();

    // --- Element Selectors ---
    const connectContainer = document.getElementById('connect-container');
    const statsContainer = document.getElementById('stats-container');
    const connectBtn = document.getElementById('connect-btn');
    const disconnectBtn = document.getElementById('disconnect-btn');
    const usernameInput = document.getElementById('username');
    const errorMessage = document.getElementById('error-message');
    const tiktokUserSpan = document.getElementById('tiktok-user');
    
    const viewsSpan = document.getElementById('views');
    const likesSpan = document.getElementById('likes');
    const sharesSpan = document.getElementById('shares');
    const giftsList = document.getElementById('gifts');
    const commentsDiv = document.getElementById('comments');

    // --- Event Listeners ---
    connectBtn.addEventListener('click', () => {
        const username = usernameInput.value.trim();
        if (username) {
            socket.emit('set_username', username);
            errorMessage.textContent = '';
        } else {
            errorMessage.textContent = 'Please enter a username.';
        }
    });

    disconnectBtn.addEventListener('click', () => {
        socket.emit('disconnect_tiktok');
    });

    usernameInput.addEventListener('keyup', (event) => {
        if (event.key === 'Enter') {
            connectBtn.click();
        }
    });

    // --- Socket Event Handlers ---
    socket.on('connect_success', (msg) => {
        connectContainer.style.display = 'none';
        statsContainer.style.display = 'block';
        tiktokUserSpan.textContent = msg.split('@')[1];
    });

    socket.on('connect_error', (msg) => {
        errorMessage.textContent = msg;
    });

    socket.on('tiktok_disconnected', () => {
        statsContainer.style.display = 'none';
        connectContainer.style.display = 'block';
        usernameInput.value = '';
        errorMessage.textContent = 'Disconnected from the live room.';
    });

    socket.on('update', (stats) => {
        viewsSpan.textContent = stats.views.toLocaleString();
        likesSpan.textContent = stats.likes.toLocaleString();
        sharesSpan.textContent = stats.shares.toLocaleString();

        // Update comments
        commentsDiv.innerHTML = '';
        stats.comments.forEach(c => {
            const commentEl = document.createElement('div');
            commentEl.innerHTML = `<strong>${c.user}:</strong> ${c.comment}`;
            commentsDiv.appendChild(commentEl);
        });
        commentsDiv.scrollTop = commentsDiv.scrollHeight;

        // Update gifts
        giftsList.innerHTML = '';
        stats.gifts.forEach(g => {
            const giftEl = document.createElement('li');
            giftEl.textContent = `${g.user_nickname} sent ${g.gift_amount}x ${g.gift_name}`;
            giftsList.appendChild(giftEl);
        });
        giftsList.scrollTop = giftsList.scrollHeight;
    });
});