const WS_URL = 'wss://stock.jonathancosta.dev/ws';
const HISTORY_LIMIT = 10;

const SYSTEM_PROMPT = `You are an assistant on Jonathan Costa's portfolio website (jonathancosta.dev). You help visitors — recruiters, hiring managers, and potential clients — learn about Jonathan's background.

Style:
- Speak in third person about Jonathan.
- Be concise: 2 to 4 sentences unless asked for more detail.
- Never invent skills, employers, dates, or projects. If something isn't in the facts below, say you don't have that detail and suggest emailing costa.jonathan@proton.me.
- When relevant, mention Jonathan is open to roles and link to the calendly or email.

Facts about Jonathan Costa:
- Senior Back-End Engineer with 10+ years of experience designing and scaling complex web systems.
- Specialized in Node.js and the WordPress ecosystem (incl. WooCommerce). Strong on AI automation in 2025+.
- Stack: JavaScript/TypeScript, PHP, Python, Laravel, Node.js, REST/GraphQL, AWS, Linux, Docker, MySQL, PostgreSQL, MongoDB, Redis, Elasticsearch, React, SvelteKit. AI tooling: Claude / Claude Code, Codex, Cursor, n8n, LLM API integration, AI agents.
- Languages: English (fluent), Portuguese (fluent).
- Education: BS Computer Science, Universidade Vale do Rio Doce (2012–2015).

Recent experience:
- Independent Consultant & personal projects (2024–present): client websites end-to-end (hosting, performance, security), DotaData (Dota 2 analytics platform — dotadata.org), AI + Steam + YouTube video pipeline.
- Back-End Developer Lead at Fuerza Studio (Mar 2020 – Jan 2026): led an international development team. Built backend API for "Harry Potter: Hogwarts Mystery" (Jam City). Built backend for Ready Set (readyset.co) on Node.js + MongoDB + Elasticsearch with secure auth. Optimized subscription system for Warrior Made (WordPress + WooCommerce). Implemented features for Veritone Tracker (AI-powered media tracking) and Veritone Illuminate.
- Back-End Developer at Apiki (Oct 2013 – Mar 2020): WordPress themes from scratch, landing pages for Somos Educação and other large clients.

Status: Open to senior backend, AI engineering, and technical consulting roles — full-time, contract, or fractional.

Contact:
- Email: costa.jonathan@proton.me
- Calendly: https://calendly.com/johnny-fuerzastudio
- GitHub: github.com/Jhowl
- LinkedIn: linkedin.com/in/jhonatan1`;

const GREETING = "Hi — I'm Jonathan's AI assistant. Ask me about his experience, stack, projects, or how to hire him.";

const SUGGESTIONS = [
  "What's his stack?",
  "Has he worked with AI?",
  "How do I hire him?",
];

const EMAIL_ADDRESS = 'costa.jonathan@proton.me';
const CALENDLY_URL = 'https://calendly.com/johnny-fuerzastudio';

const ICON_CHAT = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`;
const ICON_SEND = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>`;
const ICON_MAIL = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>`;
const ICON_CAL = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`;

export default function initChat() {
  if (document.querySelector('.chat-widget')) return;

  const root = document.createElement('div');
  root.className = 'chat-widget';
  root.innerHTML = `
    <button class="chat-fab" aria-label="Open chat with Jonathan's AI assistant" type="button">
      ${ICON_CHAT}
      <span class="chat-fab-label">Ask AI</span>
    </button>
    <div class="chat-panel" hidden>
      <div class="chat-header">
        <div class="chat-monogram" aria-hidden="true">JC</div>
        <div class="chat-titles">
          <div class="chat-title">Ask about Jonathan</div>
          <div class="chat-status">Local LLM · gemma4:e4b</div>
        </div>
        <a class="chat-action" href="mailto:${EMAIL_ADDRESS}?subject=Hello%20Jonathan"
          aria-label="Email Jonathan" title="Email Jonathan">${ICON_MAIL}</a>
        <a class="chat-action" href="${CALENDLY_URL}" target="_blank" rel="noopener"
          aria-label="Book a call" title="Book a call">${ICON_CAL}</a>
        <button class="chat-close" aria-label="Close chat" type="button">&times;</button>
      </div>
      <div class="chat-log" role="log" aria-live="polite"></div>
      <div class="chat-suggestions"></div>
      <form class="chat-input-row" novalidate>
        <textarea class="chat-input" rows="1"
          placeholder="Ask about experience, stack, or hiring…"
          aria-label="Your message"
          maxlength="600"></textarea>
        <button class="chat-send" type="submit" aria-label="Send">${ICON_SEND}</button>
      </form>
      <div class="chat-disclaimer">AI-generated. Verify important details with Jonathan directly.</div>
    </div>
  `;
  document.body.appendChild(root);

  const fab = root.querySelector('.chat-fab');
  const panel = root.querySelector('.chat-panel');
  const closeBtn = root.querySelector('.chat-close');
  const log = root.querySelector('.chat-log');
  const suggestionsEl = root.querySelector('.chat-suggestions');
  const form = root.querySelector('.chat-input-row');
  const input = root.querySelector('.chat-input');
  const sendBtn = root.querySelector('.chat-send');

  let ws = null;
  let history = [];
  let pendingBubble = null;
  let pendingText = '';
  let isStreaming = false;
  let initialized = false;

  function open() {
    panel.hidden = false;
    fab.classList.add('chat-fab-hidden');
    if (!initialized) {
      initialized = true;
      addBubble('assistant', GREETING);
      renderSuggestions();
    }
    setTimeout(() => input.focus(), 80);
  }

  function close() {
    panel.hidden = true;
    fab.classList.remove('chat-fab-hidden');
  }

  fab.addEventListener('click', open);
  closeBtn.addEventListener('click', close);

  function renderSuggestions() {
    suggestionsEl.innerHTML = '';
    SUGGESTIONS.forEach((text) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'chat-suggestion';
      b.textContent = text;
      b.addEventListener('click', () => {
        input.value = text;
        send();
      });
      suggestionsEl.appendChild(b);
    });
    suggestionsEl.hidden = false;
  }

  function hideSuggestions() {
    suggestionsEl.hidden = true;
  }

  function addBubble(role, text) {
    const bub = document.createElement('div');
    bub.className = `chat-bubble chat-bubble-${role}`;
    bub.textContent = text;
    log.appendChild(bub);
    scrollToBottom();
    return bub;
  }

  function scrollToBottom() {
    log.scrollTop = log.scrollHeight;
  }

  function setError(text) {
    if (pendingBubble) {
      pendingBubble.classList.remove('chat-bubble-typing');
      pendingBubble.classList.add('chat-bubble-error');
      pendingBubble.textContent = text;
    } else {
      const b = addBubble('assistant', text);
      b.classList.add('chat-bubble-error');
    }
  }

  function ensureWs() {
    return new Promise((resolve, reject) => {
      if (ws && ws.readyState === WebSocket.OPEN) return resolve(ws);
      if (ws) { try { ws.close(); } catch {} ws = null; }
      const sock = new WebSocket(WS_URL);
      const timeout = setTimeout(() => {
        try { sock.close(); } catch {}
        reject(new Error('timeout'));
      }, 8000);
      sock.addEventListener('open', () => {
        clearTimeout(timeout);
        ws = sock;
        resolve(sock);
      });
      sock.addEventListener('error', () => {
        clearTimeout(timeout);
        reject(new Error('ws error'));
      });
      sock.addEventListener('message', onMessage);
      sock.addEventListener('close', () => {
        if (ws === sock) ws = null;
        if (isStreaming) {
          setError('Connection closed before the answer finished. Try again.');
          finishStream();
        }
      });
    });
  }

  function onMessage(ev) {
    let d;
    try { d = JSON.parse(ev.data); } catch { return; }
    if (d.type === 'token') {
      if (pendingBubble) {
        if (pendingBubble.classList.contains('chat-bubble-typing')) {
          pendingBubble.classList.remove('chat-bubble-typing');
        }
        pendingText += d.content;
        pendingBubble.textContent = pendingText;
        scrollToBottom();
      }
    } else if (d.type === 'done') {
      finishStream();
    } else if (d.type === 'error') {
      setError(d.message || 'The assistant ran into a problem. Please try again.');
      finishStream();
    }
    // 'hello' is informational
  }

  function finishStream() {
    if (pendingText.trim()) {
      history.push({ role: 'assistant', content: pendingText });
    } else if (pendingBubble && !pendingBubble.classList.contains('chat-bubble-error')) {
      pendingBubble.textContent = "I didn't get a response. Please try again.";
      pendingBubble.classList.add('chat-bubble-error');
    }
    pendingBubble = null;
    pendingText = '';
    isStreaming = false;
    input.disabled = false;
    sendBtn.disabled = false;
    if (history.length >= 4) hideSuggestions();
  }

  async function send() {
    const message = input.value.trim();
    if (!message || isStreaming) return;
    hideSuggestions();
    addBubble('user', message);
    history.push({ role: 'user', content: message });
    input.value = '';
    autoresize();
    isStreaming = true;
    input.disabled = true;
    sendBtn.disabled = true;
    pendingText = '';
    pendingBubble = addBubble('assistant', '');
    pendingBubble.classList.add('chat-bubble-typing');

    try {
      const sock = await ensureWs();
      const recent = history.slice(-HISTORY_LIMIT);
      const priorHistory = recent.slice(0, -1);
      sock.send(JSON.stringify({
        type: 'chat',
        message,
        history: [{ role: 'system', content: SYSTEM_PROMPT }, ...priorHistory],
        images: [],
      }));
    } catch {
      setError("I can't reach the AI right now. Please email costa.jonathan@proton.me.");
      finishStream();
    }
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    send();
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  });

  function autoresize() {
    input.style.height = 'auto';
    input.style.height = Math.min(input.scrollHeight, 120) + 'px';
  }
  input.addEventListener('input', autoresize);
}
