/* ========================================
   osA Beyond Inc. - AIチャットボット
   APIキーはVercel Serverless Function側で管理
======================================== */

/* DOM要素の取得 */
const chatbotBtn      = document.getElementById('chatbotBtn');
const chatbotWindow   = document.getElementById('chatbotWindow');
const chatbotClose    = document.getElementById('chatbotClose');
const chatbotInput    = document.getElementById('chatbotInput');
const chatbotSend     = document.getElementById('chatbotSend');
const chatbotMessages = document.getElementById('chatbotMessages');

/* 会話履歴 */
let conversationHistory = [];

/* 初期ウェルカムメッセージをHTMLから取得して保持 */
const initialMessage = chatbotMessages.innerHTML;

/* チャットウィンドウの開閉 */
chatbotBtn.addEventListener('click', () => {
  const isOpen = chatbotWindow.classList.contains('open');
  if (isOpen) {
    chatbotWindow.classList.remove('open');
  } else {
    chatbotWindow.classList.add('open');
    chatbotInput.focus();
  }
});

/* ウィンドウをリセットして閉じる */
function resetChatbot() {
  chatbotWindow.classList.remove('open');
  /* 会話履歴をクリア */
  conversationHistory = [];
  /* メッセージエリアを初期状態に戻す */
  chatbotMessages.innerHTML = initialMessage;
  /* 入力欄をクリア */
  chatbotInput.value = '';
  chatbotInput.style.height = 'auto';
}

chatbotClose.addEventListener('click', resetChatbot);

/* メッセージの追加 */
function addMessage(text, role) {
  const msg = document.createElement('div');
  msg.className = `msg ${role}`;

  if (role === 'bot') {
    msg.innerHTML = `
      <div class="msg-avatar">o</div>
      <div class="msg-bubble">${text.replace(/\n/g, '<br>')}</div>
    `;
  } else {
    msg.innerHTML = `<div class="msg-bubble">${text.replace(/\n/g, '<br>')}</div>`;
  }

  chatbotMessages.appendChild(msg);
  chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
}

/* タイピングインジケーターの表示・非表示 */
function showTyping() {
  const typing = document.createElement('div');
  typing.className = 'msg bot';
  typing.id = 'typingIndicator';
  typing.innerHTML = `
    <div class="msg-avatar">o</div>
    <div class="typing-indicator">
      <span></span><span></span><span></span>
    </div>
  `;
  chatbotMessages.appendChild(typing);
  chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
}

function hideTyping() {
  const typing = document.getElementById('typingIndicator');
  if (typing) typing.remove();
}

/* /api/chat（Vercel Serverless Function）へのリクエスト */
async function sendToAPI(userMessage) {
  conversationHistory.push({ role: 'user', content: userMessage });

  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages: conversationHistory })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'サーバーエラーが発生しました');
  }

  const reply = data.choices[0].message.content;
  conversationHistory.push({ role: 'assistant', content: reply });
  return reply;
}

/* メッセージ送信処理 */
async function handleSend() {
  const text = chatbotInput.value.trim();
  if (!text) return;

  addMessage(text, 'user');
  chatbotInput.value = '';
  chatbotInput.style.height = 'auto';
  chatbotSend.disabled = true;

  showTyping();

  try {
    const reply = await sendToAPI(text);
    hideTyping();
    addMessage(reply, 'bot');
  } catch (err) {
    hideTyping();
    addMessage(`Error: ${err.message}`, 'bot');
  } finally {
    chatbotSend.disabled = false;
    chatbotInput.focus();
  }
}

/* 送信ボタン */
chatbotSend.addEventListener('click', handleSend);

/* Enterキーで送信（Shift+Enterで改行） */
chatbotInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    handleSend();
  }
});

/* テキストエリアの高さ自動調整 */
chatbotInput.addEventListener('input', () => {
  chatbotInput.style.height = 'auto';
  chatbotInput.style.height = Math.min(chatbotInput.scrollHeight, 100) + 'px';
});
