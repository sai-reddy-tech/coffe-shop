# Niloufer Cafe Hyderabad - Premium Ordering & Barista Dashboard

Niloufer Cafe is a high-fidelity, interactive single-page web application (SPA) built using modern Vanilla HTML5, CSS3, and JavaScript. The application models an end-to-end cafe lifecycle, combining a customer ordering interface with a real-time order status tracker and a live barista management dashboard.

Rebranded to represent the historic **Niloufer Cafe in Hyderabad**, the menu showcases authentic local treats like Irani Chai, frothed Filter Coffee, Osmania Biscuits, and fresh Bun Maska.
## Example Screenshot
<img width="1917" height="911" alt="order list" src="https://github.com/user-attachments/assets/733048c0-e1ff-4f51-8863-ac7a87e8dd6b" />



## ☕ Key Features

### 1. Customer Storefront
- **Interactive Menu**: Grouped into categories (*Chai & Coffee*, *Niloufer Bakery*, *Snacks & Eats*).
- **Interactive Customizer Modal**: Customize tea sizes (Regular, Special Mug, or Family Flask), malai cream floats (spoon count), sugar sweetness percentage levels, and brewing decoction strength.
- **Dynamic Pricing Engine**: Prices recalculate in real-time based on selected premium options.
- **Slide-out Cart Drawer**: Displays order summaries, item counts, quantities, tax (5% GST), and totals.

### 2. Live Order Tracker
- **Stage Progress Bar**: Pushes orders through four stages: *Pending* ➔ *Brewing* ➔ *Pouring* ➔ *Ready*.
- **Dynamic Micro-animations**: Features a custom visual tea cup container that fills with tea and generates rising steam bubbles according to the active status set by the barista.
- **Interactive Timestamps**: Tracks details, client names, and reward points.

### 3. Barista Kanban Board
- **Three-Column Ticket Queue**: Manage incoming tickets across *Pending*, *Preparing*, and *Ready* columns.
- **Barista Actions**: Change states on a ticket (Accept & Brew, Froth & Pour, Mark Ready, Hand Over).
- **Chime Notifications**: Audio alerts play automatically when a new client order comes in, and when an order is frothed and marked ready.

### 4. Barista Analytics & Simulator
- **Live Metrics**: Counters report Active Tickets, Total Revenue, Completed orders, and the Popular Eat.
- **Popularity Index Chart**: Sleek CSS Grid bar chart representing item sales volumes.
- **Simulator Controls**: Injects randomized customer orders or toggles an "Auto-Client" engine (spawning orders every 10 seconds) for load testing.

---

## 🛠️ Technology Stack

- **Core**: Vanilla HTML5 & JavaScript (ES6)
- **Styling**: Vanilla CSS3 (Custom Variables, Flexbox, CSS Grid, custom Keyframe animations, Glassmorphism, and Backdrop Blurs)
- **Icons**: Font Awesome (loaded via CDN)
- **State Engine**: Cross-view browser state tracker utilizing `localStorage` to support real-time sync across multiple tabs or browser windows.

---

## 📁 File Structure

```text
coffeecraft/
│
├── index.html          # Core single-page HTML layout & customizer structures
├── styles.css          # Chai-themed design system, visual variables & animations
├── app.js              # State machine, business logic & analytics engine
│
└── assets/             # Menu images and branding graphics
    ├── logo.jpg             # circular emblem cafe badge
    ├── irani_chai.jpg       # creamy Irani tea photo
    ├── filter_coffee.jpg    # frothed South Indian filter coffee
    ├── osmania_biscuits.jpg # golden baked local biscuits
    ├── bun_maska.jpg        # soft buttered bun
    └── samosa.jpg           # crispy triangular samosas
```

---

## 🚀 How to Run Locally

Since the application uses `localStorage` sync and modular assets, running it through a local HTTP server is recommended:

1. **Start a local server**:
   If you have Python installed, open terminal inside the project directory and run:
   ```bash
   python -m http.server 8000
   ```


2. **Open the browser**:
   Navigate to:
   ```text
   http://localhost:8000/
   ```

3. **Multi-Window Sync Testing**:
   Open the website in two browser windows side-by-side. 
   - Put one window in **Storefront** or **Track Order** view.
   - Put the other window in **Barista View**.
   - Place an order and watch the barista ticket arrive. Pushing the ticket forward on the Barista dashboard will update the tracker screen instantly in the other window.
