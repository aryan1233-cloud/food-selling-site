# Food Selling Website

A starter Node.js + Express + MongoDB project for selling food online. Includes user registration, login, forgotten password flow, menu browsing, add-to-cart, and simple account dashboard.

## Setup

```bash
git clone <repo>
cd food-selling-website
npm install
cp .env.example .env   # edit secrets
npm run seed:products  # optional demo data
npm run dev            # http://localhost:3000
```

## Features

- EJS templates with partials
- Secure sessions stored in MongoDB
- Password hashing, reset via email
- Simple cart stored in session
- Seed script and example menu items
- Minimal CSS in `public/css/style.css` (replace with Tailwind or your own)
- Ready for payment integration (Razorpay, Stripe, etc.)
