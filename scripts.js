/* ===== StyleLviv — scripts.js ===== */

// ---- CART STATE ----
let cart = JSON.parse(localStorage.getItem('sl_cart') || '[]');
let reviews = JSON.parse(localStorage.getItem('sl_reviews') || '[]');

function saveCart() { localStorage.setItem('sl_cart', JSON.stringify(cart)); }
function saveReviews() { localStorage.setItem('sl_reviews', JSON.stringify(reviews)); }

// ---- CART COUNT ----
function updateCartCount() {
  const total = cart.reduce((s, i) => s + i.qty, 0);
  document.querySelectorAll('.cart-count').forEach(el => {
    el.textContent = total;
    el.style.display = total > 0 ? 'flex' : 'none';
  });
}

// ---- NOTIFICATION ----
function showNotif(msg, icon = '✅') {
  let n = document.getElementById('notif');
  if (!n) {
    n = document.createElement('div');
    n.id = 'notif';
    n.className = 'notif';
    document.body.appendChild(n);
  }
  n.innerHTML = `<span class="notif-icon">${icon}</span><span>${msg}</span>`;
  n.classList.add('show');
  clearTimeout(n._t);
  n._t = setTimeout(() => n.classList.remove('show'), 3000);
}

// ---- ADD TO CART ----
function addToCart(id, name, price, img, size) {
  if (!size) { showNotif('Будь ласка, оберіть розмір!', '⚠️'); return; }
  const key = id + '_' + size;
  const existing = cart.find(i => i.key === key);
  if (existing) {
    existing.qty++;
  } else {
    cart.push({ key, id, name, price, img, size, qty: 1 });
  }
  saveCart();
  updateCartCount();
  showNotif(`"${name}" (${size}) додано до кошика! 🛍️`);
}

// ---- SIZE SELECTION ----
function initSizeButtons() {
  document.querySelectorAll('.sizes-row').forEach(row => {
    row.querySelectorAll('.size-btn').forEach(btn => {
      btn.addEventListener('click', function () {
        row.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
      });
    });
  });
}

// ---- CART BUTTON ----
function initCartButtons() {
  document.querySelectorAll('.btn-cart').forEach(btn => {
    btn.addEventListener('click', function () {
      const card = this.closest('.product-card');
      if (!card) return;
      const id = card.dataset.id;
      const name = card.dataset.name;
      const price = parseInt(card.dataset.price);
      const img = card.dataset.img;
      const activeSize = card.querySelector('.size-btn.active');
      const size = activeSize ? activeSize.textContent.trim() : null;
      addToCart(id, name, price, img, size);
    });
  });
}

// ---- FILTER BUTTONS ----
function initFilters() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const products = document.querySelectorAll('.product-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', function () {
      filterBtns.forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      const cat = this.dataset.cat;
      products.forEach(p => {
        if (cat === 'all' || p.dataset.cat === cat) {
          p.style.display = '';
        } else {
          p.style.display = 'none';
        }
      });
    });
  });

  const sortSel = document.querySelector('.sort-select');
  if (sortSel) {
    sortSel.addEventListener('change', function () {
      const grid = document.querySelector('.products-grid');
      if (!grid) return;
      const cards = Array.from(grid.querySelectorAll('.product-card'));
      cards.sort((a, b) => {
        const pa = parseInt(a.dataset.price), pb = parseInt(b.dataset.price);
        if (this.value === 'price-asc') return pa - pb;
        if (this.value === 'price-desc') return pb - pa;
        return 0;
      });
      cards.forEach(c => grid.appendChild(c));
    });
  }
}

// ---- SIDEBAR ACTIVE ----
function setSidebarActive() {
  const page = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.sidebar a').forEach(a => {
    const href = a.getAttribute('href');
    if (href && href.split('/').pop() === page) a.classList.add('active');
  });
  document.querySelectorAll('nav.main-nav a').forEach(a => {
    const href = a.getAttribute('href');
    if (href && href.split('/').pop() === page) a.classList.add('active');
  });
}

// ---- MOBILE MENU ----
function initMobileMenu() {
  const btn = document.querySelector('.mobile-menu-btn');
  const nav = document.querySelector('nav.main-nav');
  if (btn && nav) {
    btn.addEventListener('click', () => nav.classList.toggle('open'));
  }
}

// ---- AUTH MODAL ----
function initAuthModal() {
  const overlay = document.getElementById('authModal');
  const openBtns = document.querySelectorAll('[data-open-auth]');
  const closeBtn = document.querySelector('.modal-close');
  const tabs = document.querySelectorAll('.modal-tab');
  const forms = document.querySelectorAll('.modal-form');

  if (!overlay) return;

  openBtns.forEach(btn => btn.addEventListener('click', () => overlay.classList.add('show')));
  if (closeBtn) closeBtn.addEventListener('click', () => overlay.classList.remove('show'));
  overlay.addEventListener('click', e => { if (e.target === overlay) overlay.classList.remove('show'); });

  tabs.forEach(tab => {
    tab.addEventListener('click', function () {
      tabs.forEach(t => t.classList.remove('active'));
      this.classList.add('active');
      forms.forEach(f => f.style.display = 'none');
      const target = document.getElementById(this.dataset.tab);
      if (target) target.style.display = 'block';
    });
  });

  // Login form
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const email = this.querySelector('[name=email]').value;
      const pass = this.querySelector('[name=pass]').value;
      const users = JSON.parse(localStorage.getItem('sl_users') || '[]');
      const user = users.find(u => u.email === email && u.password === pass);
      if (user) {
        localStorage.setItem('sl_loggedIn', JSON.stringify(user));
        overlay.classList.remove('show');
        updateAuthUI();
        showNotif(`Ласкаво просимо, ${user.name}!`, '👋');
      } else {
        showNotif('Невірний email або пароль', '❌');
      }
    });
  }

  // Register form
  const regForm = document.getElementById('registerForm');
  if (regForm) {
    regForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const name = this.querySelector('[name=name]').value.trim();
      const email = this.querySelector('[name=email]').value.trim();
      const pass = this.querySelector('[name=pass]').value;
      const pass2 = this.querySelector('[name=pass2]').value;
      if (!name || !email || !pass) { showNotif('Заповніть всі поля', '⚠️'); return; }
      if (pass !== pass2) { showNotif('Паролі не співпадають', '❌'); return; }
      if (pass.length < 6) { showNotif('Пароль мінімум 6 символів', '⚠️'); return; }
      const users = JSON.parse(localStorage.getItem('sl_users') || '[]');
      if (users.find(u => u.email === email)) { showNotif('Email вже зареєстровано', '❌'); return; }
      const user = { name, email, password: pass };
      users.push(user);
      localStorage.setItem('sl_users', JSON.stringify(users));
      localStorage.setItem('sl_loggedIn', JSON.stringify(user));
      overlay.classList.remove('show');
      updateAuthUI();
      showNotif(`Реєстрація успішна! Вітаємо, ${name}!`, '🎉');
    });
  }
}

function updateAuthUI() {
  const user = JSON.parse(localStorage.getItem('sl_loggedIn') || 'null');
  const authBtn = document.querySelector('.auth-btn');
  if (!authBtn) return;
  if (user) {
    authBtn.textContent = user.name.split(' ')[0];
    authBtn.setAttribute('data-open-auth', '');
    authBtn.removeEventListener('click', logoutHandler);
    authBtn.addEventListener('click', logoutHandler);
    authBtn.setAttribute('data-open-auth', 'false');
    authBtn.onclick = () => {
      if (confirm(`Вийти з акаунту ${user.name}?`)) {
        localStorage.removeItem('sl_loggedIn');
        location.reload();
      }
    };
  } else {
    authBtn.textContent = 'УВ';
    authBtn.onclick = () => {
      const overlay = document.getElementById('authModal');
      if (overlay) overlay.classList.add('show');
    };
  }
}
function logoutHandler() {}

// ---- CART PAGE ----
function renderCart() {
  const container = document.getElementById('cartItems');
  const emptyBlock = document.getElementById('cartEmpty');
  const cartBlock = document.getElementById('cartFull');
  if (!container) return;

  if (cart.length === 0) {
    if (emptyBlock) emptyBlock.style.display = 'block';
    if (cartBlock) cartBlock.style.display = 'none';
    return;
  }
  if (emptyBlock) emptyBlock.style.display = 'none';
  if (cartBlock) cartBlock.style.display = 'grid';

  container.innerHTML = '';
  cart.forEach((item, idx) => {
    const div = document.createElement('div');
    div.className = 'cart-item';
    div.innerHTML = `
      <img src="${item.img}" alt="${item.name}">
      <div class="cart-item-info">
        <h4>${item.name}</h4>
        <div class="item-meta">Розмір: ${item.size}</div>
        <div class="item-price">${(item.price * item.qty).toLocaleString()} ₴</div>
      </div>
      <div class="qty-ctrl">
        <button class="qty-btn" onclick="changeQty(${idx},-1)">−</button>
        <span class="qty-val">${item.qty}</span>
        <button class="qty-btn" onclick="changeQty(${idx},1)">+</button>
      </div>
      <button class="remove-btn" onclick="removeItem(${idx})" title="Видалити">🗑</button>
    `;
    container.appendChild(div);
  });
  updateSummary();
}

function changeQty(idx, delta) {
  cart[idx].qty += delta;
  if (cart[idx].qty <= 0) cart.splice(idx, 1);
  saveCart();
  updateCartCount();
  renderCart();
}

function removeItem(idx) {
  cart.splice(idx, 1);
  saveCart();
  updateCartCount();
  renderCart();
  showNotif('Товар видалено з кошика', '🗑');
}

function updateSummary() {
  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const FREE_SHIP_THRESHOLD = 1500;
  const selectedDelivery = document.querySelector('.delivery-option.selected');
  let deliveryCost = 0;
  if (selectedDelivery) {
    const dc = selectedDelivery.dataset.cost;
    deliveryCost = dc === 'free' ? 0 : parseInt(dc || 0);
  }

  const el = (id) => document.getElementById(id);
  if (el('summSubtotal')) el('summSubtotal').textContent = subtotal.toLocaleString() + ' ₴';
  if (el('summDelivery')) {
    if (subtotal >= FREE_SHIP_THRESHOLD && deliveryCost > 0) {
      el('summDelivery').textContent = 'Безкоштовно';
      el('summDeliveryRow') && (el('summDeliveryRow').className = 'summary-row free-ship');
    } else {
      el('summDelivery').textContent = deliveryCost === 0 ? 'Безкоштовно' : deliveryCost.toLocaleString() + ' ₴';
      el('summDeliveryRow') && (el('summDeliveryRow').className = 'summary-row');
    }
  }
  const total = subtotal + (subtotal >= FREE_SHIP_THRESHOLD ? 0 : deliveryCost);
  if (el('summTotal')) el('summTotal').textContent = total.toLocaleString() + ' ₴';

  // Free shipping progress
  const banner = document.getElementById('freeShipBanner');
  const progress = document.getElementById('shipProgress');
  if (banner) {
    if (subtotal >= FREE_SHIP_THRESHOLD) {
      banner.innerHTML = '🎉 У вас безкоштовна доставка!';
      banner.style.background = 'linear-gradient(90deg,#d1fae5,#a7f3d0)';
      banner.style.color = '#065f46';
      if (progress) progress.style.width = '100%';
    } else {
      const left = FREE_SHIP_THRESHOLD - subtotal;
      const pct = Math.round((subtotal / FREE_SHIP_THRESHOLD) * 100);
      banner.innerHTML = `🚚 До безкоштовної доставки ще <strong>${left.toLocaleString()} ₴</strong>`;
      if (progress) progress.style.width = pct + '%';
    }
  }
}

function initDeliveryOptions() {
  const options = document.querySelectorAll('.delivery-option');
  options.forEach(opt => {
    opt.addEventListener('click', function () {
      options.forEach(o => o.classList.remove('selected'));
      this.classList.add('selected');
      this.querySelector('input[type=radio]').checked = true;
      updateSummary();
    });
  });
  if (options.length > 0) { options[0].click(); }
}

function initCheckout() {
  const form = document.getElementById('checkoutForm');
  if (!form) return;
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (cart.length === 0) { showNotif('Кошик порожній!', '⚠️'); return; }
    const name = form.querySelector('[name=cName]').value.trim();
    const phone = form.querySelector('[name=cPhone]').value.trim();
    const addr = form.querySelector('[name=cAddr]').value.trim();
    if (!name || !phone || !addr) { showNotif('Заповніть всі поля', '⚠️'); return; }
    cart = [];
    saveCart();
    updateCartCount();

    const modal = document.getElementById('successModal');
    if (modal) modal.classList.add('show');
    else showNotif('Дякуємо за замовлення! Найближчим часом зв\'яжемось з вами 😊', '🎉');
    renderCart();
  });
}

// ---- REVIEWS ----
function renderReviews() {
  const list = document.getElementById('reviewsList');
  if (!list) return;
  if (reviews.length === 0) {
    list.innerHTML = '<p style="color:var(--gray);font-size:.88rem;text-align:center;padding:20px 0">Поки що відгуків немає. Будьте першим!</p>';
    return;
  }
  list.innerHTML = reviews.slice().reverse().map(r => `
    <div class="review-card">
      <div class="review-header">
        <div class="review-avatar">${r.name.charAt(0).toUpperCase()}</div>
        <div>
          <div class="review-name">${escHtml(r.name)}</div>
          <div class="review-date">${r.date}</div>
        </div>
        <div class="stars" style="margin-left:auto">${'★'.repeat(r.rating)}${'☆'.repeat(5-r.rating)}</div>
      </div>
      <div class="review-text">${escHtml(r.text)}</div>
    </div>
  `).join('');
}

function escHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function initReviewForm() {
  const form = document.getElementById('reviewForm');
  if (!form) return;
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    const name = form.querySelector('[name=rName]').value.trim();
    const text = form.querySelector('[name=rText]').value.trim();
    const rating = parseInt(form.querySelector('[name=rRating]').value);
    if (!name || !text) { showNotif('Заповніть всі поля', '⚠️'); return; }
    reviews.push({ name, text, rating, date: new Date().toLocaleDateString('uk-UA') });
    saveReviews();
    renderReviews();
    form.reset();
    showNotif('Дякуємо за відгук! 🌟');
  });
}

// ---- CONTACT FORM ----
function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    showNotif('Повідомлення відправлено! Зв\'яжемось з вами найближчим часом 📩');
    form.reset();
  });
}

// ---- SUCCESS MODAL CLOSE ----
function initSuccessModal() {
  const modal = document.getElementById('successModal');
  if (!modal) return;
  const closeBtn = modal.querySelector('.modal-close');
  if (closeBtn) closeBtn.addEventListener('click', () => { modal.classList.remove('show'); location.href = 'index.html'; });
  modal.addEventListener('click', e => { if (e.target === modal) { modal.classList.remove('show'); location.href = 'index.html'; } });
}

// ---- STAR RATING ----
function initStarRating() {
  const ratingGroup = document.querySelector('.star-rating-group');
  if (!ratingGroup) return;
  const stars = ratingGroup.querySelectorAll('.star-lbl');
  // Set initial state to 5 stars
  stars.forEach(s => { s.style.color = '#f59e0b'; });

  stars.forEach((star, idx) => {
    star.addEventListener('mouseover', () => {
      stars.forEach((s, i) => { s.style.color = i <= idx ? '#f59e0b' : '#d1d5db'; });
    });
    star.addEventListener('mouseout', () => {
      const val = parseInt(ratingGroup.querySelector('input[name=rRating]').value || 5);
      stars.forEach((s, i) => { s.style.color = i < val ? '#f59e0b' : '#d1d5db'; });
    });
    star.addEventListener('click', () => {
      const val = idx + 1;
      ratingGroup.querySelector('input[name=rRating]').value = val;
      stars.forEach((s, i) => { s.style.color = i < val ? '#f59e0b' : '#d1d5db'; });
    });
  });
}

// ---- INIT ----
document.addEventListener('DOMContentLoaded', function () {
  updateCartCount();
  setSidebarActive();
  initMobileMenu();
  initSizeButtons();
  initCartButtons();
  initFilters();
  initAuthModal();
  updateAuthUI();
  renderCart();
  initDeliveryOptions();
  initCheckout();
  initSuccessModal();
  renderReviews();
  initReviewForm();
  initContactForm();
  initStarRating();
});
