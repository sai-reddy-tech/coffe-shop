// CoffeeCraft - Core Application State & Logic

// --- MENU DATA ---
const MENU_ITEMS = [
  {
    id: 'espresso-craft',
    name: 'Espresso Craft',
    description: 'Double shot of single-origin espresso pulled over hot water for a bold, clean taste.',
    price: 180,
    category: 'hot',
    image: 'assets/cappuccino.jpg',
    tag: 'Classic',
    customizable: true,
    customOptions: { sizes: true, temp: false, milk: false, shots: true, sweetness: false }
  },
  {
    id: 'golden-latte',
    name: 'Golden Honey Latte',
    description: 'Double espresso whisked with raw organic wildflower honey, steamed oat milk, and a dash of cinnamon.',
    price: 240,
    category: 'hot',
    image: 'assets/cappuccino.jpg',
    tag: 'Signature',
    customizable: true,
    customOptions: { sizes: true, temp: true, milk: true, shots: true, sweetness: true }
  },
  {
    id: 'velvet-cappuccino',
    name: 'Velvet Cappuccino',
    description: 'Classic double shot espresso underneath a thick, luxurious, pillowy layer of microfoam.',
    price: 220,
    category: 'hot',
    image: 'assets/cappuccino.jpg',
    tag: 'Popular',
    customizable: true,
    customOptions: { sizes: true, temp: false, milk: true, shots: true, sweetness: true }
  },
  {
    id: 'nitro-brew',
    name: 'Nitro Cold Brew',
    description: 'Slow-steeped signature cold brew infused with nitrogen for a velvety, Guinness-like head and natural sweet finish.',
    price: 260,
    category: 'cold',
    image: 'assets/cold_brew.jpg',
    tag: 'Ice Cold',
    customizable: true,
    customOptions: { sizes: true, temp: false, milk: false, shots: false, sweetness: true }
  },
  {
    id: 'pecan-brew',
    name: 'Pecan Cream Cold Brew',
    description: 'Our smooth cold brew sweetened with toasted pecan syrup, topped with a dense float of vanilla sweet cream.',
    price: 280,
    category: 'cold',
    image: 'assets/cold_brew.jpg',
    tag: 'Sweet Craft',
    customizable: true,
    customOptions: { sizes: true, temp: false, milk: true, shots: false, sweetness: true }
  },
  {
    id: 'butter-croissant',
    name: 'Buttery Croissant',
    description: 'Flaky, multi-layered French pastry baked fresh daily with pure Normandy butter, served warm.',
    price: 160,
    category: 'bakery',
    image: 'assets/croissant.jpg',
    tag: 'Baked Fresh',
    customizable: false
  },
  {
    id: 'hazelnut-cruffin',
    name: 'Hazelnut Truffle Cruffin',
    description: 'Flaky hybrid pastry filled with pure hazelnut praline filling, dusted with premium dark cocoa powder.',
    price: 210,
    category: 'bakery',
    image: 'assets/croissant.jpg',
    tag: 'Indulgent',
    customizable: false
  },
  {
    id: 'matcha-rose',
    name: 'Matcha Rose Cloud',
    description: 'Ceremonial Japanese matcha layered with cold rose-infused milk and sweetened whipped foam.',
    price: 290,
    category: 'specials',
    image: 'assets/cold_brew.jpg',
    tag: 'New',
    customizable: true,
    customOptions: { sizes: true, temp: true, milk: true, shots: false, sweetness: true }
  },
  {
    id: 'smoked-mocha',
    name: 'Amber Smoked Mocha',
    description: 'Double espresso, dark Belgian chocolate, and a hint of smoked amber wood syrup, steamed milk.',
    price: 270,
    category: 'specials',
    image: 'assets/cappuccino.jpg',
    tag: 'Rich & Smoked',
    customizable: true,
    customOptions: { sizes: true, temp: true, milk: true, shots: true, sweetness: true }
  }
];

// --- APP STATE ---
let state = {
  cart: [],
  orders: [],
  activeOrderId: null,
  loyaltyPoints: 120,
  autoCustomerInterval: null,
  currentCustomizingItem: null
};

// --- INITIALIZE APP ---
document.addEventListener('DOMContentLoaded', () => {
  // Load state from localStorage for persistence / cross-tab sync
  loadStateFromStorage();

  // Initial menu render
  renderMenu('all');

  // Register event listeners
  registerNavEvents();
  registerCartEvents();
  registerCustomizerModalEvents();
  registerBaristaEvents();

  // Initial rendering of views
  updateCartUI();
  renderBaristaDashboard();
  renderTrackerView();

  // Listen to storage events to support cross-tab barista updates!
  window.addEventListener('storage', (e) => {
    if (e.key === 'coffeecraft_orders' || e.key === 'coffeecraft_active_order_id') {
      loadStateFromStorage();
      renderBaristaDashboard();
      renderTrackerView();
      updateCartUI();
    }
  });
});

// --- STORAGE MANAGER ---
function saveStateToStorage() {
  localStorage.setItem('coffeecraft_orders', JSON.stringify(state.orders));
  localStorage.setItem('coffeecraft_active_order_id', JSON.stringify(state.activeOrderId));
  localStorage.setItem('coffeecraft_loyalty_points', JSON.stringify(state.loyaltyPoints));
}

function loadStateFromStorage() {
  try {
    const savedOrders = localStorage.getItem('coffeecraft_orders');
    if (savedOrders) state.orders = JSON.parse(savedOrders);

    const savedActiveId = localStorage.getItem('coffeecraft_active_order_id');
    if (savedActiveId) state.activeOrderId = JSON.parse(savedActiveId);

    const savedLoyalty = localStorage.getItem('coffeecraft_loyalty_points');
    if (savedLoyalty) state.loyaltyPoints = parseInt(JSON.parse(savedLoyalty), 10);
  } catch (err) {
    console.error('Error loading state from localStorage:', err);
  }
}

// --- VIEW NAVIGATION ---
function registerNavEvents() {
  const views = {
    'btn-view-storefront': 'view-storefront',
    'btn-view-tracker': 'view-tracker',
    'btn-view-barista': 'view-barista'
  };

  Object.keys(views).forEach(btnId => {
    document.getElementById(btnId).addEventListener('click', (e) => {
      // Toggle button classes
      document.querySelectorAll('.view-btn').forEach(btn => btn.classList.remove('active'));
      document.getElementById(btnId).classList.add('active');

      // Toggle views
      document.querySelectorAll('.app-view').forEach(view => view.classList.remove('active'));
      document.getElementById(views[btnId]).classList.add('active');

      // Specific view render actions
      if (views[btnId] === 'view-tracker') {
        renderTrackerView();
      } else if (views[btnId] === 'view-barista') {
        renderBaristaDashboard();
      }
    });
  });

  // Logo link goes back to storefront
  document.getElementById('logo-link').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('btn-view-storefront').click();
  });

  // Category filter tabs
  document.querySelectorAll('.category-container .category-tab').forEach(tab => {
    tab.addEventListener('click', (e) => {
      document.querySelectorAll('.category-container .category-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const category = tab.getAttribute('data-category');
      renderMenu(category);
    });
  });
}

// --- RENDER MENU GRID ---
function renderMenu(categoryFilter = 'all') {
  const menuContainer = document.getElementById('menu-container');
  menuContainer.innerHTML = '';

  const filteredItems = categoryFilter === 'all' 
    ? MENU_ITEMS 
    : MENU_ITEMS.filter(item => item.category === categoryFilter);

  filteredItems.forEach(item => {
    const card = document.createElement('div');
    card.className = 'menu-card glass-panel';
    card.id = `menu-item-${item.id}`;

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
            ${item.customizable ? 'Customize & Add' : 'Select Item'}
          </button>
          <button class="btn-quick-add" onclick="quickAddCart('${item.id}')" title="Quick add classic style to cart">
            <i class="fa-solid fa-plus"></i>
          </button>
        </div>
      </div>
    `;
    menuContainer.appendChild(card);
  });
}

// --- SHOPPING CART LOGIC ---
function registerCartEvents() {
  const cartBtn = document.getElementById('cart-btn');
  const cartDrawer = document.getElementById('cart-drawer');
  const closeCartBtn = document.getElementById('btn-close-cart');
  const checkoutBtn = document.getElementById('btn-checkout-cta');

  // Toggle Cart Sidebar
  cartBtn.addEventListener('click', () => {
    cartDrawer.classList.toggle('active');
  });

  closeCartBtn.addEventListener('click', () => {
    cartDrawer.classList.remove('active');
  });

  // Checkout & Brew order creation
  checkoutBtn.addEventListener('click', () => {
    if (state.cart.length === 0) return;
    checkoutOrder();
  });
}

function updateCartUI() {
  const cartBadge = document.getElementById('cart-badge-count');
  const cartContainer = document.getElementById('cart-items-container');
  const cartSubtotalEl = document.getElementById('cart-subtotal');
  const cartTaxEl = document.getElementById('cart-tax');
  const cartGrandtotalEl = document.getElementById('cart-grandtotal');

  // Badge count
  const totalQty = state.cart.reduce((sum, item) => sum + item.quantity, 0);
  cartBadge.innerText = totalQty;
  if (totalQty > 0) {
    cartBadge.style.display = 'flex';
  } else {
    cartBadge.style.display = 'none';
  }

  // Cart List Items
  cartContainer.innerHTML = '';
  if (state.cart.length === 0) {
    cartContainer.innerHTML = `
      <div class="cart-empty-state">
        <i class="fa-solid fa-cart-shopping"></i>
        <p>Your cart is empty.</p>
        <p style="font-size: 0.75rem; color: var(--text-muted);">Add handcrafted items from our storefront!</p>
      </div>
    `;
    cartSubtotalEl.innerText = '₹0.00';
    cartTaxEl.innerText = '₹0.00';
    cartGrandtotalEl.innerText = '₹0.00';
    return;
  }

  let subtotal = 0;
  state.cart.forEach((item, index) => {
    subtotal += item.price * item.quantity;
    const itemEl = document.createElement('div');
    itemEl.className = 'cart-item';

    // Build customization text representation
    let customText = [];
    if (item.customizations) {
      const c = item.customizations;
      if (c.temp) customText.push(c.temp === 'iced' ? 'Iced' : 'Hot');
      if (c.size) customText.push(c.size.charAt(0).toUpperCase() + c.size.slice(1));
      if (c.milk && c.milk !== 'whole') customText.push(`${c.milk.charAt(0).toUpperCase() + c.milk.slice(1)} Milk`);
      if (c.shots) customText.push(`${c.shots} shot${c.shots > 1 ? 's' : ''}`);
      if (c.sweetness !== undefined) customText.push(`Sweetness: ${c.sweetness}%`);
    }

    itemEl.innerHTML = `
      <img src="${item.image}" alt="${item.name}" class="cart-item-img">
      <div class="cart-item-details">
        <span class="cart-item-name">${item.name}</span>
        <span class="cart-item-options">${customText.length > 0 ? customText.join(' | ') : 'Classic Recipe'}</span>
        <div class="cart-item-bottom">
          <span class="cart-item-price">₹${item.price * item.quantity}</span>
          <div class="qty-control">
            <button class="qty-btn" onclick="adjustQty(${index}, -1)">-</button>
            <span class="qty-val">${item.quantity}</span>
            <button class="qty-btn" onclick="adjustQty(${index}, 1)">+</button>
          </div>
        </div>
      </div>
    `;
    cartContainer.appendChild(itemEl);
  });

  const tax = subtotal * 0.05; // 5% GST
  const grandTotal = subtotal + tax;

  cartSubtotalEl.innerText = `₹${subtotal.toFixed(2)}`;
  cartTaxEl.innerText = `₹${tax.toFixed(2)}`;
  cartGrandtotalEl.innerText = `₹${grandTotal.toFixed(2)}`;
}

function adjustQty(index, amount) {
  if (index >= 0 && index < state.cart.length) {
    state.cart[index].quantity += amount;
    if (state.cart[index].quantity <= 0) {
      state.cart.splice(index, 1);
    }
    updateCartUI();
  }
}

// Quick Add with default settings
window.quickAddCart = function(itemId) {
  const item = MENU_ITEMS.find(i => i.id === itemId);
  if (!item) return;

  const defaultCustomizations = item.customizable ? {
    temp: item.customOptions.temp ? 'hot' : null,
    size: 'grande',
    milk: item.customOptions.milk ? 'whole' : null,
    shots: item.customOptions.shots ? 2 : null,
    sweetness: item.customOptions.sweetness ? 50 : null
  } : null;

  addToCart(item, item.price, defaultCustomizations);
  
  // Slide cart drawer open to notify visually
  document.getElementById('cart-drawer').classList.add('active');
};

function addToCart(item, calculatedPrice, customizations) {
  // Check if item with identical customizations already exists
  const existingIndex = state.cart.findIndex(cartItem => {
    if (cartItem.id !== item.id) return false;
    if (!cartItem.customizations && !customizations) return true;
    if (!cartItem.customizations || !customizations) return false;
    
    // Compare customizations objects
    return JSON.stringify(cartItem.customizations) === JSON.stringify(customizations);
  });

  if (existingIndex > -1) {
    state.cart[existingIndex].quantity += 1;
  } else {
    state.cart.push({
      id: item.id,
      name: item.name,
      category: item.category,
      price: calculatedPrice,
      quantity: 1,
      image: item.image,
      customizations: customizations
    });
  }

  updateCartUI();
}

// --- CHECKOUT & ORDER ROUTER ---
function checkoutOrder() {
  const orderId = `#CC-${Math.floor(1000 + Math.random() * 9000)}`;
  const orderItems = JSON.parse(JSON.stringify(state.cart));
  const subtotal = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.05;
  const total = subtotal + tax;

  const newOrder = {
    id: orderId,
    customerName: prompt("Please enter customer name for pickup ticket:") || "Guest Customer",
    items: orderItems,
    subtotal: subtotal,
    tax: tax,
    total: total,
    status: 'Pending', // Pending, Brewing, Pouring, Ready, Completed
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    createdTime: Date.now(),
    pointsEarned: Math.round(subtotal / 10)
  };

  // Add order to state
  state.orders.push(newOrder);
  state.activeOrderId = orderId;
  state.loyaltyPoints += newOrder.pointsEarned;

  // Clear cart
  state.cart = [];
  updateCartUI();

  // Save changes
  saveStateToStorage();

  // Play audio chime for new order
  playChime('audio-new-order');

  // Close Cart sidebar
  document.getElementById('cart-drawer').classList.remove('active');

  // Go to Order Tracker View
  document.getElementById('btn-view-tracker').click();
  
  // Refresh barista board in case it is open
  renderBaristaDashboard();
}

// --- DYNAMIC CUSTOMIZER MODAL ---
window.openCustomizer = function(itemId) {
  const item = MENU_ITEMS.find(i => i.id === itemId);
  if (!item) return;

  state.currentCustomizingItem = item;

  // If not customizable, add directly
  if (!item.customizable) {
    quickAddCart(itemId);
    return;
  }

  // Header Setup
  document.getElementById('modal-drink-title').innerText = `Customize ${item.name}`;

  // Hide/Show option panels based on item config
  toggleCustomizerPanel('mod-section-temp', item.customOptions.temp);
  toggleCustomizerPanel('mod-section-size', item.customOptions.sizes);
  toggleCustomizerPanel('mod-section-milk', item.customOptions.milk);
  toggleCustomizerPanel('mod-section-shots', item.customOptions.shots);
  toggleCustomizerPanel('mod-section-sweetness', item.customOptions.sweetness);

  // Set default values in modal UI
  resetCustomizerModalUI(item);

  // Calculate and display initial price
  recalculateModalPrice();

  // Open modal
  document.getElementById('customize-modal-overlay').classList.add('active');
};

function toggleCustomizerPanel(id, visible) {
  document.getElementById(id).style.display = visible ? 'block' : 'none';
}

function resetCustomizerModalUI(item) {
  // Temperature default choice
  document.querySelectorAll('#mod-opt-temp .option-btn').forEach(btn => {
    btn.classList.remove('selected');
    if (btn.getAttribute('data-value') === 'hot') btn.classList.add('selected');
  });

  // Size default choice
  document.querySelectorAll('#mod-opt-size .option-btn').forEach(btn => {
    btn.classList.remove('selected');
    if (btn.getAttribute('data-value') === 'grande') btn.classList.add('selected');
  });

  // Milk default choice
  document.querySelectorAll('#mod-opt-milk .option-btn').forEach(btn => {
    btn.classList.remove('selected');
    if (btn.getAttribute('data-value') === 'whole') btn.classList.add('selected');
  });

  // Shots slider default
  const shotsInput = document.getElementById('mod-val-shots');
  shotsInput.value = 2;
  document.getElementById('mod-label-shots').innerText = '2 Shots';

  // Sweetness slider default
  const sweetnessInput = document.getElementById('mod-val-sweetness');
  sweetnessInput.value = 50;
  document.getElementById('mod-label-sweetness').innerText = 'Medium (50%)';
}

function registerCustomizerModalEvents() {
  const overlay = document.getElementById('customize-modal-overlay');
  const closeBtn = document.getElementById('btn-close-modal-x');
  const addToCartCta = document.getElementById('btn-add-to-cart-cta');

  // Close button
  closeBtn.addEventListener('click', () => {
    overlay.classList.remove('active');
  });

  // Click outside to close
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      overlay.classList.remove('active');
    }
  });

  // Option buttons selection toggling
  const optionContainers = ['mod-opt-temp', 'mod-opt-size', 'mod-opt-milk'];
  optionContainers.forEach(containerId => {
    document.querySelectorAll(`#${containerId} .option-btn`).forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll(`#${containerId} .option-btn`).forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        recalculateModalPrice();
      });
    });
  });

  // Shots slider update
  const shotsInput = document.getElementById('mod-val-shots');
  shotsInput.addEventListener('input', (e) => {
    const val = e.target.value;
    document.getElementById('mod-label-shots').innerText = `${val} Shot${val > 1 ? 's' : ''}`;
    recalculateModalPrice();
  });

  // Sweetness slider update
  const sweetnessInput = document.getElementById('mod-val-sweetness');
  sweetnessInput.addEventListener('input', (e) => {
    const val = parseInt(e.target.value, 10);
    let label = 'Medium (50%)';
    if (val === 0) label = 'Unsweetened (0%)';
    else if (val === 25) label = 'Light (25%)';
    else if (val === 75) label = 'Less Sweet (75%)';
    else if (val === 100) label = 'Extra Sweet (100%)';
    document.getElementById('mod-label-sweetness').innerText = label;
  });

  // Add Custom Item to Cart CTA
  addToCartCta.addEventListener('click', () => {
    const item = state.currentCustomizingItem;
    if (!item) return;

    // Retrieve selected customizations
    const selectedTemp = item.customOptions.temp 
      ? getSelectedOption('mod-opt-temp') 
      : null;
    const selectedSize = item.customOptions.sizes 
      ? getSelectedOption('mod-opt-size') 
      : null;
    const selectedMilk = item.customOptions.milk 
      ? getSelectedOption('mod-opt-milk') 
      : null;
    const selectedShots = item.customOptions.shots 
      ? parseInt(document.getElementById('mod-val-shots').value, 10) 
      : null;
    const selectedSweetness = item.customOptions.sweetness 
      ? parseInt(document.getElementById('mod-val-sweetness').value, 10) 
      : null;

    const customizations = {
      temp: selectedTemp,
      size: selectedSize,
      milk: selectedMilk,
      shots: selectedShots,
      sweetness: selectedSweetness
    };

    const calculatedPrice = calculateCustomizedPrice(item, customizations);
    addToCart(item, calculatedPrice, customizations);

    // Close modal
    overlay.classList.remove('active');
    
    // Slide cart drawer open to show result
    document.getElementById('cart-drawer').classList.add('active');
  });
}

function getSelectedOption(containerId) {
  const selectedBtn = document.querySelector(`#${containerId} .option-btn.selected`);
  return selectedBtn ? selectedBtn.getAttribute('data-value') : null;
}

function calculateCustomizedPrice(item, c) {
  let price = item.price;
  
  // Customization extra charges
  if (c.size === 'venti') price += 40;
  if (c.milk === 'almond' || c.milk === 'coconut') price += 30;
  if (c.milk === 'oat') price += 40;
  
  // Extra shot charges (more than 2 default shots)
  if (c.shots && c.shots > 2) {
    price += (c.shots - 2) * 25; // ₹25 per extra shot
  }

  return price;
}

function recalculateModalPrice() {
  const item = state.currentCustomizingItem;
  if (!item) return;

  const c = {
    size: getSelectedOption('mod-opt-size'),
    milk: getSelectedOption('mod-opt-milk'),
    shots: parseInt(document.getElementById('mod-val-shots').value, 10)
  };

  const calculatedPrice = calculateCustomizedPrice(item, c);
  document.getElementById('modal-drink-price').innerText = `₹${calculatedPrice}`;
}

// --- CUSTOMER ORDER TRACKER RENDER ---
function renderTrackerView() {
  const trackerContainer = document.getElementById('tracker-status-card');
  const loyaltyPointsEl = document.getElementById('tracker-loyalty-points');

  // Update Loyalty points counter in view
  loyaltyPointsEl.innerText = state.loyaltyPoints;

  const activeOrder = state.orders.find(o => o.id === state.activeOrderId);
  
  // If no active order, render default empty state
  if (!activeOrder) {
    trackerContainer.innerHTML = `
      <div class="cart-empty-state">
        <i class="fa-solid fa-mug-saucer"></i>
        <h3 class="tracker-title">No Active Order</h3>
        <p>Place an order in the Storefront to track its progress here in real-time!</p>
        <button class="category-tab active" style="margin-top: 1rem;" onclick="document.getElementById('btn-view-storefront').click();">
          Order Now
        </button>
      </div>
    `;
    return;
  }

  // Active order exists: map status to progress levels
  const statusMapping = {
    'Pending': { step: 1, percent: 10, fillHeight: '15%', title: 'Order Received', desc: 'Awaiting barista acceptance in queue.', foam: 0 },
    'Brewing': { step: 2, percent: 45, fillHeight: '45%', title: 'Grinding & Brewing', desc: 'Steeped espresso shots are being prepared.', foam: 0 },
    'Pouring': { step: 3, percent: 75, fillHeight: '80%', title: 'Frothing & Pouring', desc: 'Crafting microfoam and texturing choice of milk.', foam: 0.5 },
    'Ready': { step: 4, percent: 100, fillHeight: '95%', title: 'Ready for Pickup!', desc: 'Collect fresh at the counter. Enjoy!', foam: 1 },
    'Completed': { step: 5, percent: 100, fillHeight: '95%', title: 'Order Completed', desc: 'Order picked up. Thanks for visiting CoffeeCraft!', foam: 1 }
  };

  const current = statusMapping[activeOrder.status] || statusMapping['Pending'];

  // Calculate items list html
  let itemsListHtml = activeOrder.items.map(item => {
    let subDetail = [];
    if (item.customizations) {
      const c = item.customizations;
      if (c.temp) subDetail.push(c.temp === 'iced' ? 'Iced' : 'Hot');
      if (c.size) subDetail.push(c.size);
      if (c.milk && c.milk !== 'whole') subDetail.push(c.milk);
    }
    return `<li>${item.quantity}x ${item.name} <span style="font-size: 0.75rem; color: var(--text-muted);">(${subDetail.join(', ')})</span></li>`;
  }).join('');

  trackerContainer.innerHTML = `
    <h3 class="tracker-title">${current.title}</h3>
    <span class="order-id-badge">${activeOrder.id} &bull; Pickup name: ${activeOrder.customerName}</span>
    
    <!-- Dynamic Coffee Filling Animation -->
    <div class="tracker-animation-container">
      <div class="steam-particles">
        ${activeOrder.status !== 'Pending' && activeOrder.status !== 'Completed' ? `
          <div class="bubble"></div>
          <div class="bubble"></div>
          <div class="bubble"></div>
        ` : ''}
      </div>
      <div class="live-cup">
        <div class="liquid-fill" style="height: ${current.fillHeight};"></div>
        <div class="foam-layer" style="opacity: ${current.foam};"></div>
      </div>
    </div>

    <!-- Timeline Progress Bar -->
    <div class="timeline-stages">
      <div class="timeline-bar" style="width: ${activeOrder.status === 'Completed' ? '100%' : `${(current.step - 1) * 33.33}%`};"></div>
      
      <div class="stage-node ${current.step >= 1 ? 'completed' : ''} ${current.step === 1 ? 'active' : ''}">
        <div class="node-dot"><i class="fa-solid fa-receipt"></i></div>
        <span class="node-title">Pending</span>
      </div>
      <div class="stage-node ${current.step >= 2 ? 'completed' : ''} ${current.step === 2 ? 'active' : ''}">
        <div class="node-dot"><i class="fa-solid fa-mug-hot"></i></div>
        <span class="node-title">Brewing</span>
      </div>
      <div class="stage-node ${current.step >= 3 ? 'completed' : ''} ${current.step === 3 ? 'active' : ''}">
        <div class="node-dot"><i class="fa-solid fa-whiskey-glass"></i></div>
        <span class="node-title">Pouring</span>
      </div>
      <div class="stage-node ${current.step >= 4 ? 'completed' : ''} ${current.step === 4 ? 'active' : ''}">
        <div class="node-dot"><i class="fa-solid fa-bag-shopping"></i></div>
        <span class="node-title">Ready</span>
      </div>
    </div>

    <!-- Status details card -->
    <div style="background: rgba(255,255,255,0.02); border-radius: 12px; padding: 1.25rem; text-align: left; border: 1px solid rgba(255,255,255,0.05); margin-top: 2rem;">
      <h4 style="font-family: var(--font-heading); margin-bottom: 0.5rem;"><i class="fa-solid fa-info-circle" style="color: var(--primary);"></i> Current Status</h4>
      <p style="font-size: 0.85rem; color: var(--text-main); margin-bottom: 0.75rem;">${current.desc}</p>
      
      <h4 style="font-family: var(--font-heading); margin-bottom: 0.5rem;"><i class="fa-solid fa-mug-saucer" style="color: var(--primary);"></i> Order Details</h4>
      <ul style="font-size: 0.85rem; color: var(--text-muted); padding-left: 1.25rem; line-height: 1.5;">
        ${itemsListHtml}
      </ul>
      <div style="display: flex; justify-content: space-between; font-weight: 700; border-top: 1px dashed rgba(255,255,255,0.05); margin-top: 1rem; padding-top: 0.75rem; color: var(--primary);">
        <span>Grand Total:</span>
        <span>₹${activeOrder.total.toFixed(2)}</span>
      </div>
    </div>
  `;
}

// --- BARISTA WORKFLOW DASHBOARD ---
function registerBaristaEvents() {
  // Clear completed tickets
  document.getElementById('btn-clear-completed').addEventListener('click', () => {
    state.orders = state.orders.filter(o => o.status !== 'Completed');
    saveStateToStorage();
    renderBaristaDashboard();
  });

  // Simulator: Inject Custom Order
  document.getElementById('btn-sim-order').addEventListener('click', () => {
    simulateCustomOrder();
  });

  // Simulator: Toggle Auto-customer
  const autoBtn = document.getElementById('btn-sim-auto');
  autoBtn.addEventListener('click', () => {
    if (state.autoCustomerInterval) {
      clearInterval(state.autoCustomerInterval);
      state.autoCustomerInterval = null;
      autoBtn.innerHTML = '<i class="fa-solid fa-play"></i> Toggle Auto-Customer (10s)';
      autoBtn.style.borderColor = 'rgba(80, 184, 120, 0.3)';
      autoBtn.style.color = 'var(--success)';
      autoBtn.style.background = 'rgba(80, 184, 120, 0.1)';
    } else {
      simulateCustomOrder(); // start immediately
      state.autoCustomerInterval = setInterval(simulateCustomOrder, 10000);
      autoBtn.innerHTML = '<i class="fa-solid fa-pause"></i> Auto-Customer Active (10s)';
      autoBtn.style.borderColor = 'var(--danger)';
      autoBtn.style.color = 'var(--danger)';
      autoBtn.style.background = 'rgba(239, 96, 96, 0.1)';
    }
  });
}

function renderBaristaDashboard() {
  const pendingList = document.getElementById('queue-pending-list');
  const preparingList = document.getElementById('queue-preparing-list');
  const readyList = document.getElementById('queue-ready-list');

  // Clear lists
  pendingList.innerHTML = '';
  preparingList.innerHTML = '';
  readyList.innerHTML = '';

  let activeCount = 0;
  let completedCount = 0;
  let revenue = 0;
  let drinkSalesMap = {};

  // Sort orders by timestamp descending
  state.orders.forEach(order => {
    // Process analytics data
    if (order.status !== 'Completed') {
      activeCount++;
    } else {
      completedCount++;
      revenue += order.total;

      // Track item sales for chart
      order.items.forEach(item => {
        drinkSalesMap[item.name] = (drinkSalesMap[item.name] || 0) + item.quantity;
      });
    }

    // Build ticket elements
    const ticket = document.createElement('div');
    ticket.className = 'order-ticket glass-panel';
    ticket.id = `ticket-${order.id}`;

    // Timer calculation (seconds since creation)
    const elapsedSecs = Math.floor((Date.now() - order.createdTime) / 1000);
    const formattedTimer = formatElapsedTime(elapsedSecs);
    let timerClass = '';
    if (order.status !== 'Completed' && order.status !== 'Ready') {
      if (elapsedSecs > 120) timerClass = 'danger'; // Over 2 mins
      else if (elapsedSecs > 60) timerClass = 'warning'; // Over 1 min
    }

    // Details formatting
    const itemsHtml = order.items.map(item => {
      let subDetail = [];
      if (item.customizations) {
        const c = item.customizations;
        if (c.temp) subDetail.push(c.temp === 'iced' ? 'Iced' : 'Hot');
        if (c.size) subDetail.push(c.size);
        if (c.milk && c.milk !== 'whole') subDetail.push(c.milk);
        if (c.shots) subDetail.push(`${c.shots}Shots`);
      }
      return `
        <div class="ticket-item">
          <span class="ticket-item-qty">${item.quantity}x</span>${item.name}
          ${subDetail.length > 0 ? `<div class="ticket-item-customizations">${subDetail.join(', ')}</div>` : ''}
        </div>
      `;
    }).join('');

    // Dynamic actions based on ticket status
    let actionButtons = '';
    if (order.status === 'Pending') {
      actionButtons = `
        <div class="ticket-actions">
          <button class="btn-ticket-action primary" onclick="updateOrderStatus('${order.id}', 'Brewing')">Accept & Brew</button>
        </div>
      `;
    } else if (order.status === 'Brewing') {
      actionButtons = `
        <div class="ticket-actions">
          <button class="btn-ticket-action primary" onclick="updateOrderStatus('${order.id}', 'Pouring')">Froth & Pour</button>
        </div>
      `;
    } else if (order.status === 'Pouring') {
      actionButtons = `
        <div class="ticket-actions">
          <button class="btn-ticket-action primary" onclick="updateOrderStatus('${order.id}', 'Ready')">Mark Ready</button>
        </div>
      `;
    } else if (order.status === 'Ready') {
      actionButtons = `
        <div class="ticket-actions">
          <button class="btn-ticket-action primary" onclick="updateOrderStatus('${order.id}', 'Completed')">Hand Over</button>
        </div>
      `;
    }

    ticket.innerHTML = `
      <div class="ticket-top">
        <span class="ticket-id">${order.id} &bull; ${order.customerName}</span>
        <span class="ticket-timer ${timerClass}"><i class="fa-solid fa-hourglass-half"></i> ${order.status === 'Completed' ? 'Picked Up' : formattedTimer}</span>
      </div>
      <div class="ticket-items">
        ${itemsHtml}
      </div>
      ${actionButtons}
    `;

    // Append to correct column list
    if (order.status === 'Pending') {
      pendingList.appendChild(ticket);
    } else if (order.status === 'Brewing' || order.status === 'Pouring') {
      preparingList.appendChild(ticket);
    } else if (order.status === 'Ready') {
      readyList.appendChild(ticket);
    }
  });

  // Update metrics UI
  document.getElementById('barista-metric-active').innerText = activeCount;
  document.getElementById('barista-metric-revenue').innerText = `₹${revenue.toFixed(2)}`;
  document.getElementById('barista-metric-completed').innerText = completedCount;

  // Determine popular drink
  let popularDrink = '-';
  let maxSales = 0;
  Object.keys(drinkSalesMap).forEach(name => {
    if (drinkSalesMap[name] > maxSales) {
      maxSales = drinkSalesMap[name];
      popularDrink = name;
    }
  });
  document.getElementById('barista-metric-popular').innerText = popularDrink;

  // Update columns counts
  document.getElementById('count-pending').innerText = pendingList.children.length;
  document.getElementById('count-preparing').innerText = preparingList.children.length;
  document.getElementById('count-ready').innerText = readyList.children.length;

  // Draw dynamic bar chart
  drawPopularityChart(drinkSalesMap);
}

// Format seconds into MM:SS
function formatElapsedTime(secs) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

// Update order status workflow
window.updateOrderStatus = function(orderId, newStatus) {
  const orderIndex = state.orders.findIndex(o => o.id === orderId);
  if (orderIndex === -1) return;

  state.orders[orderIndex].status = newStatus;
  
  // Save modifications
  saveStateToStorage();

  // Play ready chime when order status changes to Ready
  if (newStatus === 'Ready') {
    playChime('audio-order-ready');
  }

  // Refresh
  renderBaristaDashboard();
  
  // If this is the active tracked order, refresh tracker
  if (state.activeOrderId === orderId) {
    renderTrackerView();
  }
};

// Draw popularity analytics chart
function drawPopularityChart(salesMap) {
  const chartEl = document.getElementById('barista-analytics-chart');
  chartEl.innerHTML = '';

  // Default menu items to populate chart in case no sales have occurred
  const displayItems = Object.keys(salesMap).length > 0 
    ? salesMap 
    : { 'Golden Latte': 12, 'Velvet Cappuccino': 8, 'Nitro Brew': 10, 'Buttery Croissant': 5 };

  const maxVal = Math.max(...Object.values(displayItems), 1);

  Object.keys(displayItems).forEach(drinkName => {
    const qty = displayItems[drinkName];
    const heightPercent = (qty / maxVal) * 100;

    const barCol = document.createElement('div');
    barCol.className = 'chart-col';
    barCol.innerHTML = `
      <div class="chart-bar-wrapper">
        <div class="chart-bar-fill" style="height: ${heightPercent}%;"></div>
        <span class="chart-bar-val">${qty}</span>
      </div>
      <span class="chart-label" title="${drinkName}">${drinkName}</span>
    `;
    chartEl.appendChild(barCol);
  });
}

// Chime player safely catching browser constraints
function playChime(audioId) {
  const audio = document.getElementById(audioId);
  if (audio) {
    audio.currentTime = 0;
    audio.play().catch(err => {
      console.log('Audio playback blocked by browser security. Audio will play after user interacts with view.', err);
    });
  }
}

// --- BARISTA SIMULATOR TOOLS ---
function simulateCustomOrder() {
  // Select random drink
  const randomDrinks = [
    { item: MENU_ITEMS[0], qty: 1 },
    { item: MENU_ITEMS[1], qty: 1 },
    { item: MENU_ITEMS[2], qty: 2 },
    { item: MENU_ITEMS[3], qty: 1 },
    { item: MENU_ITEMS[5], qty: 1 },
    { item: MENU_ITEMS[7], qty: 1 }
  ];

  const orderSize = Math.floor(1 + Math.random() * 2);
  const items = [];
  let subtotal = 0;

  for (let i = 0; i < orderSize; i++) {
    const sel = randomDrinks[Math.floor(Math.random() * randomDrinks.length)];
    const price = sel.item.price;
    
    // Randomize customizations
    const c = sel.item.customizable ? {
      temp: sel.item.customOptions.temp ? (Math.random() > 0.5 ? 'hot' : 'iced') : null,
      size: sel.item.customOptions.sizes ? (Math.random() > 0.5 ? 'grande' : 'venti') : null,
      milk: sel.item.customOptions.milk ? (Math.random() > 0.7 ? 'oat' : 'whole') : null,
      shots: sel.item.customOptions.shots ? Math.floor(1 + Math.random() * 3) : null,
      sweetness: sel.item.customOptions.sweetness ? 50 : null
    } : null;

    const calcPrice = c ? calculateCustomizedPrice(sel.item, c) : price;

    items.push({
      id: sel.item.id,
      name: sel.item.name,
      category: sel.item.category,
      price: calcPrice,
      quantity: sel.qty,
      image: sel.item.image,
      customizations: c
    });

    subtotal += calcPrice * sel.qty;
  }

  const tax = subtotal * 0.05;
  const grandTotal = subtotal + tax;
  const simId = `#CC-${Math.floor(1000 + Math.random() * 9000)}`;

  const customerNames = ["Aarav", "Dia", "Rohan", "Ananya", "Kabir", "Meera", "Aditya", "Tara"];
  const randomName = customerNames[Math.floor(Math.random() * customerNames.length)] + " (Simulated)";

  const newSimOrder = {
    id: simId,
    customerName: randomName,
    items: items,
    subtotal: subtotal,
    tax: tax,
    total: grandTotal,
    status: 'Pending',
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    createdTime: Date.now(),
    pointsEarned: Math.round(subtotal / 10)
  };

  state.orders.push(newSimOrder);
  saveStateToStorage();
  playChime('audio-new-order');
  renderBaristaDashboard();
}

// Timer tick generator to update ticket waiting clocks in real-time
setInterval(() => {
  if (document.getElementById('view-barista').classList.contains('active')) {
    // Only repaint if currently visible to optimize performance
    renderBaristaDashboard();
  }
}, 1000);
