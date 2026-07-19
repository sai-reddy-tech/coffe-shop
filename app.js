// Niloufer Cafe Hyderabad - State & Business Logic

const MENU_ITEMS = [
  {
    id: 'irani-chai',
    name: 'Special Irani Chai',
    description: 'Authentic Hyderabadi thick, creamy sweet tea brewed slow with evaporated milk.',
    price: 45,
    category: 'beverage',
    image: 'assets/irani_chai.jpg',
    tag: 'Famous',
    customizable: true,
    customOptions: { sizes: true, temp: false, milk: true, shots: true, sweetness: true }
  },
  {
    id: 'filter-coffee',
    name: 'Hyderabad Filter Coffee',
    description: 'Strong, aromatic, chicory-infused milk coffee frothed at the counter.',
    price: 60,
    category: 'beverage',
    image: 'assets/filter_coffee.jpg',
    tag: 'Traditional',
    customizable: true,
    customOptions: { sizes: true, temp: false, milk: true, shots: true, sweetness: true }
  },
  {
    id: 'osmania-biscuits',
    name: 'Osmania Biscuits (Dozen)',
    description: 'Legendary sweet-salty biscuits baked fresh, perfect companion for Irani Chai.',
    price: 120,
    category: 'bakery',
    image: 'assets/osmania_biscuits.jpg',
    tag: 'Must Try',
    customizable: false
  },
  {
    id: 'bun-maska',
    name: 'Bun Maska with Malai',
    description: 'Soft local sweet bun sliced and loaded with fresh butter and thick clotted cream.',
    price: 80,
    category: 'bakery',
    image: 'assets/bun_maska.jpg',
    tag: 'Signature',
    customizable: false
  },
  {
    id: 'bun-jam',
    name: 'Bun Jam Maska',
    description: 'Classic Hyderabad tea-time sweet bun loaded with pure butter and mixed fruit jam.',
    price: 70,
    category: 'bakery',
    image: 'assets/bun_maska.jpg',
    tag: 'Classic',
    customizable: false
  },
  {
    id: 'onion-samosa',
    name: 'Onion Samosa (4 pcs)',
    description: 'Crispy, golden-fried thin samosas stuffed with spiced onions and local herbs.',
    price: 80,
    category: 'snacks',
    image: 'assets/samosa.jpg',
    tag: 'Crispy Snack',
    customizable: false
  },
  {
    id: 'paneer-puff',
    name: 'Spicy Paneer Puff',
    description: 'Flaky baked golden puff pastry loaded with hot spiced cottage cheese filling.',
    price: 70,
    category: 'snacks',
    image: 'assets/croissant.jpg',
    tag: 'Freshly Baked',
    customizable: false
  }
];

let state = {
  cart: [],
  orders: [],
  activeOrderId: null,
  loyaltyPoints: 120,
  autoCustomerInterval: null,
  currentCustomizingItem: null
};

// --- INITIALIZE & SYNC ---
document.addEventListener('DOMContentLoaded', () => {
  loadState();
  renderMenu('all');
  registerEvents();
  updateCartUI();
  renderBarista();
  renderTracker();

  window.addEventListener('storage', () => {
    loadState();
    renderBarista();
    renderTracker();
    updateCartUI();
  });
});

function saveState() {
  localStorage.setItem('niloufer_orders', JSON.stringify(state.orders));
  localStorage.setItem('niloufer_active_id', JSON.stringify(state.activeOrderId));
  localStorage.setItem('niloufer_loyalty', JSON.stringify(state.loyaltyPoints));
}

function loadState() {
  try {
    state.orders = JSON.parse(localStorage.getItem('niloufer_orders')) || [];
    state.activeOrderId = JSON.parse(localStorage.getItem('niloufer_active_id')) || null;
    state.loyaltyPoints = parseInt(localStorage.getItem('niloufer_loyalty') || 120, 10);
  } catch (e) {
    console.error('State load error:', e);
  }
}

// --- NAVIGATION & INTERFACE EVENTS ---
function registerEvents() {
  const views = {
    'btn-view-storefront': 'view-storefront',
    'btn-view-tracker': 'view-tracker',
    'btn-view-barista': 'view-barista'
  };

  Object.entries(views).forEach(([btnId, viewId]) => {
    document.getElementById(btnId).addEventListener('click', () => {
      document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
      document.getElementById(btnId).classList.add('active');
      document.querySelectorAll('.app-view').forEach(v => v.classList.remove('active'));
      document.getElementById(viewId).classList.add('active');

      if (viewId === 'view-tracker') renderTracker();
      if (viewId === 'view-barista') renderBarista();
    });
  });

  document.getElementById('logo-link').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('btn-view-storefront').click();
  });

  document.querySelectorAll('.category-container .category-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.category-container .category-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      renderMenu(tab.getAttribute('data-category'));
    });
  });

  // Cart open/close
  document.getElementById('cart-btn').addEventListener('click', () => document.getElementById('cart-drawer').classList.toggle('active'));
  document.getElementById('btn-close-cart').addEventListener('click', () => document.getElementById('cart-drawer').classList.remove('active'));
  document.getElementById('btn-checkout-cta').addEventListener('click', () => state.cart.length > 0 && checkout());

  // Modal Customizer events
  document.getElementById('btn-close-modal-x').addEventListener('click', () => document.getElementById('customize-modal-overlay').classList.remove('active'));
  
  // Customizer slider labels
  document.getElementById('mod-val-shots').addEventListener('input', (e) => {
    const labels = { 1: 'Light decoction', 2: 'Medium', 3: 'Strong decoction' };
    document.getElementById('mod-label-shots').innerText = labels[e.target.value] || 'Medium';
  });

  document.getElementById('mod-val-sweetness').addEventListener('input', (e) => {
    const val = parseInt(e.target.value, 10);
    const labels = { 0: 'Sugar-free (0%)', 25: 'Less Sweet (25%)', 50: 'Medium (50%)', 75: 'Normal Sugar (75%)', 100: 'Double Sweet (100%)' };
    document.getElementById('mod-label-sweetness').innerText = labels[val] || 'Normal (75%)';
  });

  // Modal Option buttons selection
  ['mod-opt-temp', 'mod-opt-size', 'mod-opt-milk'].forEach(containerId => {
    document.querySelectorAll(`#${containerId} .option-btn`).forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll(`#${containerId} .option-btn`).forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        recalcPrice();
      });
    });
  });

  document.getElementById('btn-add-to-cart-cta').addEventListener('click', addCustomizedToCart);
  
  // Barista dashboard actions
  document.getElementById('btn-clear-completed').addEventListener('click', () => {
    state.orders = state.orders.filter(o => o.status !== 'Completed');
    saveState();
    renderBarista();
  });
  document.getElementById('btn-sim-order').addEventListener('click', injectSimOrder);

  const autoBtn = document.getElementById('btn-sim-auto');
  autoBtn.addEventListener('click', () => {
    if (state.autoCustomerInterval) {
      clearInterval(state.autoCustomerInterval);
      state.autoCustomerInterval = null;
      autoBtn.innerHTML = '<i class="fa-solid fa-play"></i> Toggle Auto-Customer (10s)';
      autoBtn.className = 'btn-sim';
      autoBtn.style = '';
    } else {
      injectSimOrder();
      state.autoCustomerInterval = setInterval(injectSimOrder, 10000);
      autoBtn.innerHTML = '<i class="fa-solid fa-pause"></i> Auto-Customer Active (10s)';
      autoBtn.style = 'background: rgba(239,96,96,0.1); border-color: var(--danger); color: var(--danger);';
    }
  });
}

// --- STOREFRONT MENU ---
function renderMenu(cat = 'all') {
  const container = document.getElementById('menu-container');
  container.innerHTML = '';

  const list = cat === 'all' ? MENU_ITEMS : MENU_ITEMS.filter(item => item.category === cat);
  list.forEach(item => {
    const card = document.createElement('div');
    card.className = 'menu-card glass-panel';
    card.innerHTML = `
      <div class="card-img-wrapper">
        <img src="${item.image}" alt="${item.name}" class="card-img">
        ${item.tag ? `<span class="card-tag">${item.tag}</span>` : ''}
        <span class="card-price-tag">₹${item.price}</span>
      </div>
      <div class="card-info">
        <h3 class="card-title">${item.name}</h3>
        <p class="card-description">${item.description}</p>
        <div class="card-actions">
          <button class="btn-order" onclick="openCustomizer('${item.id}')">
            ${item.customizable ? 'Customize & Add' : 'Add to Order'}
          </button>
          <button class="btn-quick-add" onclick="quickAdd('${item.id}')" title="Quick Add Classic">
            <i class="fa-solid fa-plus"></i>
          </button>
        </div>
      </div>
    `;
    container.appendChild(card);
  });
}

// --- CART & PRICE LOGIC ---
window.quickAdd = function(id) {
  const item = MENU_ITEMS.find(i => i.id === id);
  if (!item) return;

  const customizations = item.customizable ? {
    temp: 'hot',
    size: 'large',
    milk: 'none',
    shots: 2,
    sweetness: 75
  } : null;

  addToCart(item, item.price, customizations);
  document.getElementById('cart-drawer').classList.add('active');
};

function addToCart(item, price, custom) {
  const idx = state.cart.findIndex(i => i.id === item.id && JSON.stringify(i.customizations) === JSON.stringify(custom));
  if (idx > -1) {
    state.cart[idx].quantity++;
  } else {
    state.cart.push({
      id: item.id,
      name: item.name,
      category: item.category,
      price: price,
      quantity: 1,
      image: item.image,
      customizations: custom
    });
  }
  updateCartUI();
}

window.adjustQty = function(idx, amt) {
  state.cart[idx].quantity += amt;
  if (state.cart[idx].quantity <= 0) state.cart.splice(idx, 1);
  updateCartUI();
};

function updateCartUI() {
  const badge = document.getElementById('cart-badge-count');
  const container = document.getElementById('cart-items-container');
  const subEl = document.getElementById('cart-subtotal');
  const taxEl = document.getElementById('cart-tax');
  const grandEl = document.getElementById('cart-grandtotal');

  const totalQty = state.cart.reduce((sum, item) => sum + item.quantity, 0);
  badge.innerText = totalQty;
  badge.style.display = totalQty > 0 ? 'flex' : 'none';

  container.innerHTML = '';
  if (state.cart.length === 0) {
    container.innerHTML = `<div class="cart-empty-state"><i class="fa-solid fa-cart-shopping"></i><p>Your cart is empty.</p></div>`;
    subEl.innerText = taxEl.innerText = grandEl.innerText = '₹0.00';
    return;
  }

  let sub = 0;
  state.cart.forEach((item, idx) => {
    sub += item.price * item.quantity;
    let desc = [];
    if (item.customizations) {
      const c = item.customizations;
      if (c.size) desc.push(c.size === 'flask' ? 'Flask' : c.size === 'large' ? 'Mug' : 'Regular');
      if (c.milk && c.milk !== 'none') desc.push(c.milk === 'double' ? 'Double Malai' : 'Malai');
      if (c.sweetness !== undefined) desc.push(`Sugar: ${c.sweetness}%`);
    }
    
    const div = document.createElement('div');
    div.className = 'cart-item';
    div.innerHTML = `
      <img src="${item.image}" alt="${item.name}" class="cart-item-img">
      <div class="cart-item-details">
        <span class="cart-item-name">${item.name}</span>
        <span class="cart-item-options">${desc.length > 0 ? desc.join(' | ') : 'Classic Style'}</span>
        <div class="cart-item-bottom">
          <span class="cart-item-price">₹${item.price * item.quantity}</span>
          <div class="qty-control">
            <button class="qty-btn" onclick="adjustQty(${idx}, -1)">-</button>
            <span class="qty-val">${item.quantity}</span>
            <button class="qty-btn" onclick="adjustQty(${idx}, 1)">+</button>
          </div>
        </div>
      </div>
    `;
    container.appendChild(div);
  });

  const tax = sub * 0.05;
  subEl.innerText = `₹${sub.toFixed(2)}`;
  taxEl.innerText = `₹${tax.toFixed(2)}`;
  grandEl.innerText = `₹${(sub + tax).toFixed(2)}`;
}

// --- DYNAMIC CUSTOMIZER MODAL ---
window.openCustomizer = function(id) {
  const item = MENU_ITEMS.find(i => i.id === id);
  if (!item) return;

  if (!item.customizable) {
    quickAdd(id);
    return;
  }

  state.currentCustomizingItem = item;
  document.getElementById('modal-drink-title').innerText = `Customize ${item.name}`;

  const cOpt = item.customOptions;
  document.getElementById('mod-section-temp').style.display = cOpt.temp ? 'block' : 'none';
  document.getElementById('mod-section-size').style.display = cOpt.sizes ? 'block' : 'none';
  document.getElementById('mod-section-milk').style.display = cOpt.milk ? 'block' : 'none';
  document.getElementById('mod-section-shots').style.display = cOpt.shots ? 'block' : 'none';
  document.getElementById('mod-section-sweetness').style.display = cOpt.sweetness ? 'block' : 'none';

  resetModalUI();
  recalcPrice();
  document.getElementById('customize-modal-overlay').classList.add('active');
};

function resetModalUI() {
  document.querySelector('#mod-opt-temp .option-btn[data-value="hot"]').click();
  document.querySelector('#mod-opt-size .option-btn[data-value="large"]').click();
  document.querySelector('#mod-opt-milk .option-btn[data-value="none"]').click();
  document.getElementById('mod-val-shots').value = 2;
  document.getElementById('mod-label-shots').innerText = 'Medium';
  document.getElementById('mod-val-sweetness').value = 75;
  document.getElementById('mod-label-sweetness').innerText = 'Normal Sugar (75%)';
}

function getSelected(containerId) {
  const btn = document.querySelector(`#${containerId} .option-btn.selected`);
  return btn ? btn.getAttribute('data-value') : null;
}

function getCalculatedPrice(item, c) {
  let p = item.price;
  if (c.size === 'large') p += 30;
  if (c.size === 'flask') p += 120;
  if (c.milk === 'single') p += 20;
  if (c.milk === 'double') p += 35;
  return p;
}

function recalcPrice() {
  const item = state.currentCustomizingItem;
  if (!item) return;

  const price = getCalculatedPrice(item, {
    size: getSelected('mod-opt-size'),
    milk: getSelected('mod-opt-milk')
  });

  document.getElementById('modal-drink-price').innerText = `₹${price}`;
}

function addCustomizedToCart() {
  const item = state.currentCustomizingItem;
  if (!item) return;

  const customizations = {
    temp: getSelected('mod-opt-temp'),
    size: getSelected('mod-opt-size'),
    milk: getSelected('mod-opt-milk'),
    shots: parseInt(document.getElementById('mod-val-shots').value, 10),
    sweetness: parseInt(document.getElementById('mod-val-sweetness').value, 10)
  };

  const finalPrice = getCalculatedPrice(item, customizations);
  addToCart(item, finalPrice, customizations);

  document.getElementById('customize-modal-overlay').classList.remove('active');
  document.getElementById('cart-drawer').classList.add('active');
}

// --- ORDERING WORKFLOW ---
function checkout() {
  const orderId = `#NF-${Math.floor(1000 + Math.random() * 9000)}`;
  const sub = state.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = sub * 0.05;

  const order = {
    id: orderId,
    customerName: prompt("Please enter name for pickup ticket:") || "Guest Customer",
    items: JSON.parse(JSON.stringify(state.cart)),
    subtotal: sub,
    tax: tax,
    total: sub + tax,
    status: 'Pending',
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    createdTime: Date.now(),
    pointsEarned: Math.round(sub / 10)
  };

  state.orders.push(order);
  state.activeOrderId = orderId;
  state.loyaltyPoints += order.pointsEarned;
  state.cart = [];

  updateCartUI();
  saveState();
  playChime('audio-new-order');
  
  document.getElementById('cart-drawer').classList.remove('active');
  document.getElementById('btn-view-tracker').click();
  renderBarista();
}

// --- CUSTOMER TRACKER ---
function renderTracker() {
  const card = document.getElementById('tracker-status-card');
  document.getElementById('tracker-loyalty-points').innerText = state.loyaltyPoints;

  const active = state.orders.find(o => o.id === state.activeOrderId);
  if (!active) {
    card.innerHTML = `
      <div class="cart-empty-state">
        <i class="fa-solid fa-mug-saucer"></i>
        <h3 class="tracker-title">No Active Order</h3>
        <p>Place an order in the Storefront to track its progress!</p>
        <button class="category-tab active" style="margin-top: 1rem;" onclick="document.getElementById('btn-view-storefront').click();">Order Now</button>
      </div>
    `;
    return;
  }

  const mapping = {
    'Pending': { step: 1, height: '15%', name: 'Chai Ordered', desc: 'Tea masters are preparing decoctions.', foam: 0 },
    'Brewing': { step: 2, height: '45%', name: 'Brewing Chai', desc: 'Chai is simmering slow with milk and cardamoms.', foam: 0.1 },
    'Pouring': { step: 3, height: '80%', name: 'Pouring & Frothing', desc: 'Pulling Irani chai to create double malai microfoam.', foam: 0.6 },
    'Ready': { step: 4, height: '95%', name: 'Chai is Ready!', desc: 'Fresh hot Irani Chai is ready. Collect at pickup counter!', foam: 1 },
    'Completed': { step: 5, height: '95%', name: 'Order Handed Over', desc: 'Order picked up. Thank you for visiting Niloufer Cafe!', foam: 1 }
  };

  const current = mapping[active.status] || mapping['Pending'];

  card.innerHTML = `
    <h3 class="tracker-title">${current.name}</h3>
    <span class="order-id-badge">${active.id} &bull; Pickup: ${active.customerName}</span>
    
    <div class="tracker-animation-container">
      <div class="steam-particles">
        ${active.status !== 'Pending' && active.status !== 'Completed' ? '<div class="bubble"></div><div class="bubble"></div><div class="bubble"></div>' : ''}
      </div>
      <div class="live-cup" style="border-radius: 0 0 50px 50px; background: rgba(255,255,255,0.02);">
        <div class="liquid-fill" style="height: ${current.height}; background: linear-gradient(180deg, #c87a53 0%, #683010 100%);"></div>
        <div class="foam-layer" style="opacity: ${current.foam}; background: #fffaec;"></div>
      </div>
    </div>

    <div class="timeline-stages">
      <div class="timeline-bar" style="width: ${active.status === 'Completed' ? '100%' : `${(current.step - 1) * 33.33}%`};"></div>
      ${['Pending', 'Brewing', 'Pouring', 'Ready'].map((st, i) => `
        <div class="stage-node ${current.step >= i + 1 ? 'completed' : ''} ${current.step === i + 1 ? 'active' : ''}">
          <div class="node-dot"><i class="fa-solid ${i === 0 ? 'fa-receipt' : i === 1 ? 'fa-mug-hot' : i === 2 ? 'fa-whiskey-glass' : 'fa-bag-shopping'}"></i></div>
          <span class="node-title">${st}</span>
        </div>
      `).join('')}
    </div>

    <div style="background: rgba(255,255,255,0.02); border-radius: 12px; padding: 1.25rem; text-align: left; border: 1px solid rgba(255,255,255,0.05); margin-top: 2rem;">
      <h4 style="margin-bottom: 0.5rem;"><i class="fa-solid fa-circle-info" style="color: var(--primary);"></i> Progress Detail</h4>
      <p style="font-size: 0.85rem; margin-bottom: 0.75rem;">${current.desc}</p>
      
      <h4 style="margin-bottom: 0.5rem;"><i class="fa-solid fa-receipt" style="color: var(--primary);"></i> Items list</h4>
      <ul style="font-size: 0.85rem; color: var(--text-muted); padding-left: 1.25rem; line-height: 1.5;">
        ${active.items.map(item => `<li>${item.quantity}x ${item.name}</li>`).join('')}
      </ul>
    </div>
  `;
}

// --- BARISTA WORKFLOW ---
function renderBarista() {
  const pending = document.getElementById('queue-pending-list');
  const preparing = document.getElementById('queue-preparing-list');
  const ready = document.getElementById('queue-ready-list');

  pending.innerHTML = preparing.innerHTML = ready.innerHTML = '';

  let activeCount = 0, completedCount = 0, revenue = 0, itemSales = {};

  state.orders.forEach(order => {
    if (order.status !== 'Completed') {
      activeCount++;
    } else {
      completedCount++;
      revenue += order.total;
      order.items.forEach(i => itemSales[i.name] = (itemSales[i.name] || 0) + i.quantity);
    }

    const elapsed = Math.floor((Date.now() - order.createdTime) / 1000);
    const m = Math.floor(elapsed / 60), s = elapsed % 60;
    const isLate = elapsed > 120 ? 'danger' : elapsed > 60 ? 'warning' : '';

    const div = document.createElement('div');
    div.className = 'order-ticket glass-panel';
    
    let btnText = 'Accept & Brew';
    let nextStatus = 'Brewing';
    if (order.status === 'Brewing') { btnText = 'Froth & Pour'; nextStatus = 'Pouring'; }
    else if (order.status === 'Pouring') { btnText = 'Mark Ready'; nextStatus = 'Ready'; }
    else if (order.status === 'Ready') { btnText = 'Hand Over'; nextStatus = 'Completed'; }

    const itemsStr = order.items.map(item => `
      <div class="ticket-item">
        <span class="ticket-item-qty">${item.quantity}x</span>${item.name}
      </div>
    `).join('');

    div.innerHTML = `
      <div class="ticket-top">
        <span class="ticket-id">${order.id} &bull; ${order.customerName}</span>
        <span class="ticket-timer ${isLate}"><i class="fa-solid fa-hourglass-half"></i> ${order.status === 'Completed' ? 'Done' : `${m}:${s < 10 ? '0' : ''}${s}`}</span>
      </div>
      <div class="ticket-items">${itemsStr}</div>
      <div class="ticket-actions">
        <button class="btn-ticket-action primary" onclick="updateStatus('${order.id}', '${nextStatus}')">${btnText}</button>
      </div>
    `;

    if (order.status === 'Pending') pending.appendChild(div);
    else if (order.status === 'Brewing' || order.status === 'Pouring') preparing.appendChild(div);
    else if (order.status === 'Ready') ready.appendChild(div);
  });

  document.getElementById('barista-metric-active').innerText = activeCount;
  document.getElementById('barista-metric-revenue').innerText = `₹${revenue.toFixed(2)}`;
  document.getElementById('barista-metric-completed').innerText = completedCount;

  let popular = '-';
  let max = 0;
  Object.entries(itemSales).forEach(([name, qty]) => {
    if (qty > max) { max = qty; popular = name; }
  });
  document.getElementById('barista-metric-popular').innerText = popular;

  document.getElementById('count-pending').innerText = pending.children.length;
  document.getElementById('count-preparing').innerText = preparing.children.length;
  document.getElementById('count-ready').innerText = ready.children.length;

  drawChart(itemSales);
}

window.updateStatus = function(id, status) {
  const idx = state.orders.findIndex(o => o.id === id);
  if (idx === -1) return;

  state.orders[idx].status = status;
  saveState();

  if (status === 'Ready') playChime('audio-order-ready');

  renderBarista();
  if (state.activeOrderId === id) renderTracker();
};

function drawChart(sales) {
  const chart = document.getElementById('barista-analytics-chart');
  chart.innerHTML = '';

  const display = Object.keys(sales).length > 0 ? sales : { 'Irani Chai': 22, 'Osmania Biscuits': 18, 'Bun Maska': 14, 'Filter Coffee': 9 };
  const max = Math.max(...Object.values(display), 1);

  Object.entries(display).forEach(([name, val]) => {
    const col = document.createElement('div');
    col.className = 'chart-col';
    col.innerHTML = `
      <div class="chart-bar-wrapper">
        <div class="chart-bar-fill" style="height: ${(val / max) * 100}%;"></div>
        <span class="chart-bar-val">${val}</span>
      </div>
      <span class="chart-label" title="${name}">${name}</span>
    `;
    chart.appendChild(col);
  });
}

function playChime(audioId) {
  const a = document.getElementById(audioId);
  a && a.play().catch(() => {});
}

// --- MOCK INJECTOR ---
function injectSimOrder() {
  const drinks = [
    { item: MENU_ITEMS[0], qty: 1 },
    { item: MENU_ITEMS[1], qty: 1 },
    { item: MENU_ITEMS[2], qty: 1 },
    { item: MENU_ITEMS[3], qty: 2 },
    { item: MENU_ITEMS[5], qty: 1 }
  ];

  const size = Math.floor(1 + Math.random() * 2);
  const items = [];
  let sub = 0;

  for (let i = 0; i < size; i++) {
    const sel = drinks[Math.floor(Math.random() * drinks.length)];
    items.push({
      id: sel.item.id,
      name: sel.item.name,
      category: sel.item.category,
      price: sel.item.price,
      quantity: sel.qty,
      image: sel.item.image,
      customizations: null
    });
    sub += sel.item.price * sel.qty;
  }

  const names = ["Ramesh", "Sita", "Venkat", "Priya", "Nikhil", "Amrita", "Mohammad", "Sai"];
  const order = {
    id: `#NF-${Math.floor(1000 + Math.random() * 9000)}`,
    customerName: names[Math.floor(Math.random() * names.length)] + " (Sim)",
    items,
    subtotal: sub,
    tax: sub * 0.05,
    total: sub * 1.05,
    status: 'Pending',
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    createdTime: Date.now(),
    pointsEarned: Math.round(sub / 10)
  };

  state.orders.push(order);
  saveState();
  playChime('audio-new-order');
  renderBarista();
}

setInterval(() => {
  if (document.getElementById('view-barista').classList.contains('active')) {
    renderBarista();
  }
}, 1000);
