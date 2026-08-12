# ANCIENT-WISDOM-STORE 🏛️

[![License: MIT](https://img.shields.io/badge/License-MIT-gold.svg)](LICENSE)
[![Stack](https://img.shields.io/badge/Stack-HTML5%20%7C%20CSS3%20%7C%20Vanilla%20JS-brown.svg)](#️-technology-stack)
[![AI Powered](https://img.shields.io/badge/AI-Backend%20Streaming%20%2B%20Local%20Fallback-orange.svg)](#-ai-assistant-architecture)

> **Where every page holds a secret of the ages.**

**Ancient Wisdom Store** is a feature-rich, single-page e-commerce web application designed to offer an authentic, antique-inspired digital library experience. Built with classic serif typography, gold accents, and parchment aesthetic, the application provides an interactive platform for browsing, buying, renting, and reading curated titles in Engineering, Self Improvement, Ethics, and Tamil Literature.

---

## 📖 Table of Contents
- [Features](#-features)
- [AI Assistant Architecture](#-ai-assistant-architecture)
- [Technology Stack](#️-technology-stack)
- [File Structure](#-file-structure)
- [Installation & Setup](#-installation--setup)
- [Backend AI Configuration](#-backend-ai-configuration)
- [Account Tiers & Membership](#-account-tiers--membership)
- [Author Information](#-author)

---

## ✨ Features

### 📚 Catalog & Book Management
- **Curated Collection**: Browse books across 4 core categories:
  - **Engineering**: *Fundamentals of Programming*, *Data Structures Simplified*, *Database Management Essentials*
  - **Self Improvement**: *The Student's Power Guide*, *Focus & Flourish*, *Dream, Plan, Achieve*
  - **Moral & Ethics**: *Virtues of Life*, *The Right Path*, *Character Counts*
  - **Tamil Literature**: *Tamil Mozhi Amudam*, *Uyir Ezhuthukal*, *Vetri Vazhi*
- **Instant Search & Filter**: Real-time title search and category-based filtering.
- **Wishlist**: Quick toggle option to store favorite titles for future viewing or purchase.

### ⏳ Timed Online Rental Service
- **Premium Access**: Exclusive feature unlocked via Premium Membership.
- **Flexible Pricing**: Hourly, Daily, and 3-Day rental options.
- **Interactive E-Reader**: Full-screen modal reader equipped with live countdown timers, dynamic page navigation, and automatic access revocation when time expires.

### 🪙 Token Loyalty & Rewards
- **Earn Rate**: Automatically earn **1 Token for every ₹100 spent**.
- **Progress Tracking**: Real-time progress visualizer tracking total spend and token balances.
- **Redemption Store**: Exchange 50, 75, or 100 accumulated tokens directly for free physical titles.

### 💳 Complete Checkout & Return Flow
- **Multi-Method Payments**: Simulated payment gateway handling:
  - Cash on Delivery (COD)
  - Google Pay & PhonePe (UPI Reference Validation)
  - Generic UPI (Paytm / BHIM)
  - Debit / Credit Cards (SSL Format Masking)
  - Net Banking (SBI, HDFC, ICICI, Axis, Canara, BOI)
- **Order Tracking**: Track real-time progress through 4 distinct stages (`Ordered` ➔ `Packed` ➔ `Shipped` ➔ `Delivered`) using Order IDs (`AWS-XXXXXXXX`) or email.
- **Easy Returns**: Process return requests and refunds directly through the Cart view.

---

## 💬 AI Assistant Architecture

The **Ancient Wisdom Bot** uses a hybrid dual-engine setup ensuring 100% uptime and dynamic real-time interaction:

1. **Primary Streaming AI Path**:
   - Sends conversation payloads to an external AI backend.
   - Parses Server-Sent Events (`text/event-stream`) to stream response tokens into the UI in real time (similar to ChatGPT or Gemini).
2. **Local Offline Fallback Engine**:
   - Automatically activates if the AI backend endpoint is unreachable or offline.
   - Utilizes a local search matcher over a **115-entry dataset** covering catalog pricing, author details, rental policies, order procedures, and token rules.

---

## 🛠️ Technology Stack

- **Frontend Core**: HTML5 (Single-Page Application setup)
- **Styling**: CSS3 (Custom Properties, Flexbox, CSS Grid, Custom Parchment Theme, Responsive Breakpoints)
- **Scripting**: JavaScript (Vanilla ES6+ DOM manipulation, State Management, Stream Decoding)
- **Typography**: Google Fonts (*Cinzel* & *Cormorant Garamond*)
- **Integrations**: Razorpay Checkout SDK (`v1`)

---

## 📂 File Structure

├── index.html        # Main HTML structure containing all SPA pages, modals, and Chatbot UI
├── style.css         # Styling sheet defining antique parchment aesthetics, layouts, and animations
├── script.js        # JavaScript file controlling navigation, cart, rentals, orders, and AI logic
└── README.md         # Complete project documentation

## 🚀 Installation & Setup

1. **Clone the Repository**:
    git clone [https://github.com/nithiyasree-p/ancient-wisdom-store.git](https://github.com/nithiyasree-p/ancient-wisdom-store.git)
   cd ancient-wisdom-store

Serve the Application:

Since this is a client-side Single Page Application, you can open index.html directly in any web browser, or serve it via standard HTTP servers:
# Using Python 3 HTTP Server
python -m http.server 8000
Open http://localhost:8000 in your browser.

Backend AI Configuration
To link the AI Chatbot to your live backend endpoint:
     Open index.html.
     Locate the <script> tag containing the AI Chatbot configuration.
     Update the AWS_CHAT_API_URL variable with your live API endpoint:
           const AWS_CHAT_API_URL = "[https://your-api-domain.com/api/chat](https://your-api-domain.com/api/chat)";
           
Expected API Interface
Method: POST
Request Body:
{
  "messages": [
{ "role": "user", "content": "What engineering books are available?" }
  ],
  "sessionId": "aws_unique_session_id"
}

Response Format: 
text/event-stream returning data chunks formatted as data: {"delta": "token"} or standard JSON { "reply": "response text" }.

👑 Account Tiers & Membership
Feature                             Normal Plan (Free)                  Premium Plan (₹199/month)
Buy Books & Order Tracking                ✅                                    ✅
Wishlist & Cart Access                    ✅                                    ✅
Earn & Redeem Loyalty Tokens              ✅                                    ✅
Timed Online Book Rentals                 ❌                                    ✅
Interactive E-Reader Access               ❌                                    ✅

📝 Author
Nithiyasree P — Lead Developer & Author
Degree: B.E. Computer Science & Engineering
Institution: National Engineering College
Roll Number: 25104016
Email: 25104016@nec.edu.in
Phone: +91 9003974778
Technical Skills: C, C++, Python, HTML, CSS, JavaScript, SQL
