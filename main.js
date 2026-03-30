
const themeBtn = document.getElementById('theme-btn');
const guestbookForm = document.getElementById('guestbook-form');
const messageList = document.getElementById('message-list');

// --- Theme Logic ---
const currentTheme = localStorage.getItem('theme') || 'light';
document.documentElement.setAttribute('data-theme', currentTheme);
updateThemeButton(currentTheme);

themeBtn.addEventListener('click', () => {
    const theme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    updateThemeButton(theme);
});

function updateThemeButton(theme) {
    themeBtn.textContent = theme === 'dark' ? '☀️ 라이트 모드' : '✨ 테마 바꾸기';
}

// --- Guestbook Logic ---
let messages = JSON.parse(localStorage.getItem('rahee_messages')) || [];

function displayMessages() {
    messageList.innerHTML = '';
    messages.forEach((msg) => {
        const div = document.createElement('div');
        div.className = 'message-item';
        div.innerHTML = `<strong>${msg.name}</strong> ${msg.text}`;
        messageList.appendChild(div);
    });
}

guestbookForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const nameInput = document.getElementById('guest-name');
    const messageInput = document.getElementById('guest-message');

    const newMessage = {
        name: nameInput.value,
        text: messageInput.value,
        date: new Date().toLocaleString()
    };

    messages.unshift(newMessage); // 새 메시지를 맨 앞으로
    localStorage.setItem('rahee_messages', JSON.stringify(messages));
    
    displayMessages();
    guestbookForm.reset();
});

// 초기 로드 시 메시지 표시
displayMessages();
