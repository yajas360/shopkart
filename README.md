# 🛒 ShopKart — Modern Full-Stack E-Commerce Platform

A sleek, responsive, full-stack e-commerce web application featuring real-time cart and wishlist management, product catalog filters, secure customer authentication, order lifecycle tracking, and dual-mode checkout supporting both **Razorpay Test Gateway** and **Instant Dummy Simulation**.

---

## ✨ Features

- **🛍️ Dynamic Product Catalog**: Browse products with search, category filtering (Electronics, Fashion, Books, Home), and price sorting.
- **❤️ Wishlist System**: Add and remove items with instant sync across components and reactive navbar badges.
- **🛒 Shopping Cart**: Real-time quantity increment/decrement, inventory stock limits, subtotal calculation, and free delivery estimation.
- **💳 Dual-Mode Checkout**:
  - **Razorpay Test Gateway**: Official checkout popup supporting test Cards, UPI, Netbanking, and Wallets with server-side HMAC-SHA256 signature verification.
  - **Instant Dummy Mode**: Offline simulation mode for instant 1-click test checkout without requiring active API keys.
- **📦 Order Lifecycle & Tracking**: Live step-by-step tracking (`PLACED` ➔ `CONFIRMED` ➔ `SHIPPED` ➔ `DELIVERED`) with delivery destination and item breakdown.
- **🔐 Secure Authentication**: JWT-based session management, bcrypt password hashing, and protected routes.
- **🎨 Modern Dark UI**: Plus Jakarta Sans typography, frosted glass headers, midnight palettes (`#080D18`), and responsive mobile navigation.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 with Vite
- **Styling**: Tailwind CSS 4
- **Routing**: React Router DOM (v7)
- **Icons**: Custom SVG & Unicode emoji indicators
- **Payments**: Razorpay Checkout SDK

### Backend
- **Runtime**: Node.js (ES Modules)
- **Framework**: Express 5
- **Database**: MongoDB via Mongoose
- **Payments**: Razorpay Node.js SDK & HMAC-SHA256 verification
- **Auth**: JSON Web Tokens (JWT) & bcrypt

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v18+)
- MongoDB connection URI

### 2. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in `backend/` (or copy from `.env.example`):
```env
MONGO_URI=your_mongodb_connection_string
PORT=3000
JWT_SECRET=your_jwt_secret_key
PAYMENT_MODE=test

# Razorpay Test Credentials (Optional - Dummy mode works without them)
RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_key_secret
```

Start the backend server:
```bash
npm run dev
# or: npm start
```

### 3. Frontend Setup
```bash
cd frontend/shopkart-frontend
npm install
npm run dev
```

The frontend will run at `http://localhost:5173`.

---

## 🔒 Security & Git Hygiene
- Sensitive credentials (`.env`, database passwords, API secrets) are excluded from Git via `.gitignore`.
- Heavy `node_modules` folders are ignored to ensure fast, clean GitHub commits.
