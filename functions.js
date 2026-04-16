/* ═══════════════════════════════════════════════════════════
   EventPass — Shared Functions & Data Store
   All pages include this file.
   ═══════════════════════════════════════════════════════════ */

/* ── DATA STORE (localStorage-backed) ───────────────────── */
const STORE = {
  users: [
    { id: 'u1', email: 'admin@demo.com', password: 'admin123', name: 'Admin User',  role: 'admin' },
    { id: 'u2', email: 'user@demo.com',  password: 'user123',  name: 'Alex Chen',   role: 'user'  }
  ],
  events: [
    {
      id: 'e1', title: 'Manila Jazz & Blues Night', category: 'Music', emoji: '🎷',
      date: '2025-08-15', time: '19:00', venue: 'BGC Amphitheater, Taguig',
      desc: 'An unforgettable evening of smooth jazz and soulful blues featuring top Filipino and international artists under the stars.',
      price: 850, vipPrice: 2200, capacity: 100, sold: 0, color: '#6c5ce7'
    },
    {
      id: 'e2', title: 'Philippine Tech Summit 2025', category: 'Tech', emoji: '💻',
      date: '2025-09-05', time: '09:00', venue: 'SMX Convention Center, Pasay',
      desc: 'The biggest tech conference in Southeast Asia. Keynotes, workshops, and networking with leaders in AI, blockchain, and cloud tech.',
      price: 1500, vipPrice: 4500, capacity: 100, sold: 0, color: '#0984e3'
    },
    {
      id: 'e3', title: 'Art in the City Exhibition', category: 'Art', emoji: '🎨',
      date: '2025-08-22', time: '10:00', venue: 'National Museum of Fine Arts, Manila',
      desc: 'A curated showcase of contemporary Filipino visual artists exploring themes of identity, nature, and modern urban life.',
      price: 0, vipPrice: 0, capacity: 100, sold: 0, color: '#e17055'
    },
    {
      id: 'e4', title: 'Street Food Festival Marikina', category: 'Food', emoji: '🍜',
      date: '2025-08-30', time: '11:00', venue: 'Riverbanks Center, Marikina',
      desc: 'Explore over 100 food stalls featuring the best street food from all regions of the Philippines.',
      price: 120, vipPrice: 0, capacity: 100, sold: 0, color: '#fdcb6e'
    },
    {
      id: 'e5', title: 'PBA All-Star Weekend', category: 'Sports', emoji: '🏀',
      date: '2025-09-12', time: '17:00', venue: 'Araneta Coliseum, Cubao',
      desc: 'The most exciting basketball weekend of the year. Skills competition, celebrity game, and the All-Star main event.',
      price: 500, vipPrice: 1800, capacity: 100, sold: 0, color: '#00cec9'
    },
    {
      id: 'e6', title: 'Startup Pitch Night QC', category: 'Business', emoji: '🚀',
      date: '2025-09-18', time: '18:00', venue: 'QC Technohub, Diliman',
      desc: 'Watch 12 promising startups pitch to top investors in the Philippines. Networking drinks included.',
      price: 300, vipPrice: 800, capacity: 100, sold: 0, color: '#fd79a8'
    }
  ],
  tickets: [],
  checkins: []
};

/* ── SEAT CONFIGURATION ──────────────────────────────────── */
// 100 seats: rows A–J (10 rows), columns 1–10
// Rows A-B are VIP (first 20 seats)
const ROWS = ['A','B','C','D','E','F','G','H','I','J'];
const VIP_ROWS = ['A','B']; // VIP rows

function getSeatId(row, col) { return `${row}${col}`; }

function isSeatVIP(row) { return VIP_ROWS.includes(row); }

/**
 * Get all taken seats for a given event.
 * Returns Set of seatId strings e.g. "A1", "B3"
 */
function getTakenSeats(eventId) {
  const taken = new Set();
  STORE.tickets
    .filter(t => t.eventId === eventId)
    .forEach(t => { if (t.seat) taken.add(t.seat); });
  return taken;
}

/* ── STORE PERSISTENCE ───────────────────────────────────── */
function loadStore() {
  try {
    const saved = localStorage.getItem('ep_store');
    if (saved) {
      const s = JSON.parse(saved);
      if (s.users)    STORE.users    = s.users;
      if (s.events)   STORE.events   = s.events;
      if (s.tickets)  STORE.tickets  = s.tickets;
      if (s.checkins) STORE.checkins = s.checkins;
    }
  } catch(e) { console.warn('Store load failed', e); }
}

function saveStore() {
  try { localStorage.setItem('ep_store', JSON.stringify(STORE)); }
  catch(e) { console.warn('Store save failed', e); }
}

loadStore(); // Run on every page load

/* ── SESSION ─────────────────────────────────────────────── */
function getSession() {
  try { return JSON.parse(sessionStorage.getItem('ep_session')); }
  catch(e) { return null; }
}

function setSession(user) {
  sessionStorage.setItem('ep_session', JSON.stringify(user));
}

function clearSession() {
  sessionStorage.removeItem('ep_session');
}

/**
 * Call at the top of attendee.html and admin.html to guard access.
 * @param {'user'|'admin'} requiredRole
 */
function requireAuth(requiredRole) {
  const user = getSession();
  if (!user) { window.location.href = 'index.html'; return null; }
  if (requiredRole && user.role !== requiredRole) {
    // Wrong role — redirect to correct page
    if (user.role === 'admin') window.location.href = 'admin.html';
    else window.location.href = 'attendee.html';
    return null;
  }
  return user;
}

/* ── TOAST ───────────────────────────────────────────────── */
function toast(msg, type = 'info') {
  const icons = { ok: '✅', err: '❌', info: 'ℹ️', warn: '⚠️' };
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.innerHTML = `<span>${icons[type] || '•'}</span><span>${msg}</span>`;
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }
  container.appendChild(el);
  setTimeout(() => {
    el.style.opacity = '0';
    el.style.transform = 'translateX(20px)';
    el.style.transition = '.3s';
    setTimeout(() => el.remove(), 300);
  }, 3500);
}

/* ── UTILS ───────────────────────────────────────────────── */
function formatDate(d) {
  if (!d) return '';
  return new Date(d + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'short', month: 'long', day: 'numeric', year: 'numeric'
  });
}

function formatCurrency(amount) {
  if (amount === 0) return 'FREE';
  return '₱' + amount.toLocaleString();
}

function generateTicketId() {
  return 'TICKET-' + Math.random().toString(36).substring(2, 9).toUpperCase();
}

/* ── MODAL HELPERS ───────────────────────────────────────── */
function openModal(id) {
  const el = document.getElementById(id);
  if (el) { el.classList.add('open'); document.body.style.overflow = 'hidden'; }
}

function closeModal(id) {
  const el = document.getElementById(id);
  if (el) { el.classList.remove('open'); document.body.style.overflow = ''; }
}

// Close on backdrop click + ESC key — call once per page
function initModalListeners() {
  document.querySelectorAll('.modal-bg').forEach(bg => {
    bg.addEventListener('click', e => { if (e.target === bg) closeModal(bg.id); });
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape')
      document.querySelectorAll('.modal-bg.open').forEach(m => closeModal(m.id));
  });
}

/* ── SIDEBAR ─────────────────────────────────────────────── */
function toggleSidebar() {
  const sb = document.getElementById('sidebar');
  if (sb) sb.classList.toggle('collapsed');
}

function navigate(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.sb-nav-item').forEach(n => n.classList.remove('active'));
  const pageEl = document.getElementById(`page-${page}`);
  if (pageEl) pageEl.classList.add('active');
  const navEl = document.getElementById(`nav-${page}`);
  if (navEl) navEl.classList.add('active');
  const titleEl = document.getElementById('topbar-title');
  if (titleEl && window.PAGE_TITLES) titleEl.textContent = window.PAGE_TITLES[page] || page;
  if (typeof window.onNavigate === 'function') window.onNavigate(page);
}

/* ── QR CODE GENERATION HELPER ───────────────────────────── */
function generateQR(containerId, data, size = 88) {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = '';
  try {
    new QRCode(el, {
      text: JSON.stringify(data),
      width: size, height: size,
      colorDark: '#000', colorLight: '#fff',
      correctLevel: QRCode.CorrectLevel.H
    });
  } catch(e) { console.warn('QR generation failed', e); }
}

/* ── PAYMENT HELPERS ─────────────────────────────────────── */
function calcFee(base, qty) {
  return Math.round(base * qty * 0.05);
}

function calcTotal(base, qty) {
  return base * qty + calcFee(base, qty);
}

function formatCard(el) {
  let v = el.value.replace(/\D/g, '').substring(0, 16);
  el.value = v.replace(/(.{4})/g, '$1 ').trim();
}