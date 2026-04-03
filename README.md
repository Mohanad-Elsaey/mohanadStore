# Mohaned E-commerce - Modern Shopping Experience

A premium, full-stack e-commerce platform built with **React/Vite** and **Laravel (PHP)**.

## 🚀 Overview

Mohaned E-commerce is a modernized boutique shopping platform focusing on premium aesthetics, seamless navigation, and powerful administrative control.

### Key Features

*   **Premium Storefront**: Mobile-first responsive design with high-density product grids.
*   **Dynamic Collections**: Intelligent category-based browsing with advanced sorting (Newest, Price High/Low).
*   **Admin Console**: Comprehensive management system for products, categories, orders, and stats.
*   **Inventory Control**: Modern stock management with stock-level indicators and alerts.
*   **Modern Auth**: Reliable authentication system with wishlist and profile management.

## 🏗️ Architecture

*   **Frontend**: React, Tailwind CSS, TanStack Query, Lucide Icons.
*   **Backend**: Laravel (PHP), Eloquent ORM, RESTful API.
*   **Database**: PostgreSQL / MySQL.

## 🛠️ Installation

### Prerequisites
*   Node.js (v18+)
*   PHP (v8.2+)
*   Composer
*   PostgreSQL/MySQL

### 1. Backend Setup
```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## 📖 License

This project is proprietary. All rights reserved.
