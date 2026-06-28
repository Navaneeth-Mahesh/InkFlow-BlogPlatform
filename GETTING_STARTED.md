# Getting Started

Welcome to **InkFlow**, a modern full-stack blogging platform built with **Next.js**, **Express.js**, **TypeScript**, and **MongoDB**.

## Project Structure

```text
inkflow/
├── inkflow/            # Next.js Frontend
└── inkflow-server/     # Express.js Backend
```

---

# Tech Stack

## Frontend

* Next.js (App Router)
* TypeScript
* Tailwind CSS v4
* Framer Motion
* Radix UI
* React Hook Form
* Zod

## Backend

* Express.js
* TypeScript
* MongoDB
* Mongoose
* JWT Authentication
* Express Validator
* Swagger API Documentation
* Jest & Supertest

---

# What's New

This version includes several improvements and bug fixes:

* Removed profile pictures throughout the application and replaced them with deterministic initials-based avatars.
* Updated seed data with **8 unique, realistic users**.
* Added **12 fully written blog articles** with rich content.
* Rebuilt the toast notification system for reliable automatic and manual dismissal.
* Added blog deletion support for both published posts and drafts directly from the profile page.
* Fixed the demo login to use a real seeded account.

---

# Installation

## 1. Clone the Repository

```bash
git clone <repository-url>
cd inkflow
```

---

# Backend Setup

Navigate to the backend project:

```bash
cd inkflow-server
```

## Install Dependencies

```bash
npm install
```

## Configure Environment Variables

```bash
cp .env.example .env
```

Update the following variables inside `.env`:

* `MONGODB_URI`
* `CLIENT_URL`
* JWT secrets (recommended before production)

## Seed the Database

```bash
npm run seed
```

This creates:

* 8 Demo Users
* 8 Categories
* 12 Complete Blog Posts

## Start the Backend

```bash
npm run dev
```

Backend URL:

```text
http://localhost:5000
```

Verify the server is running:

```text
http://localhost:5000/health
```

---

# Frontend Setup

Open a **new terminal** and navigate to the frontend project:

```bash
cd inkflow
```

## Install Dependencies

```bash
npm install
```

## Configure Environment Variables

```bash
cp .env.example .env.local
```

Default API URL:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
```

## Start the Frontend

```bash
npm run dev
```

Frontend URL:

```text
http://localhost:3000
```

---

# Demo Account

You can log in using either the **Demo Login** button or the credentials below:

```text
Email:    demo@inkflow.app
Password: password123
```

---

# Verify Everything Works

After starting both applications, verify the following:

### Home Feed

* 12 seeded blog posts are displayed.
* Posts are written by 8 different users.
* User avatars display initials instead of profile pictures.

### Authentication

* Demo login works successfully.
* Authentication persists after refreshing the page.

### Blog Features

* Create a new blog.
* Edit your blog.
* Delete published posts.
* Delete drafts.
* Refresh the page to verify changes persist.

### Interactions

* Like a blog.
* Bookmark a blog.
* Follow another user.
* Refresh the page and verify changes remain.

### Notifications

Trigger several toast notifications by:

* Logging in
* Creating a post
* Triggering a validation error
* Liking or bookmarking a post

Verify that:

* Toasts automatically disappear after a few seconds.
* Clicking the close button dismisses them immediately.
* Fade-out animations complete correctly.

---

# Useful Commands

## Backend

```bash
npm run dev      # Start development server
npm run seed     # Seed demo data
npm test         # Run test suite
```

## Frontend

```bash
npm run dev      # Start development server
npm run build    # Production build
npm run lint     # Run ESLint
```

---

# Troubleshooting

## Backend cannot connect to MongoDB

* Verify `MONGODB_URI` is correct.
* Ensure MongoDB Atlas Network Access allows your IP address.
* Confirm your database user credentials are valid.

---

## Frontend displays empty pages

* Confirm the backend server is running.
* Verify `NEXT_PUBLIC_API_URL` points to the correct backend endpoint.

---

## CORS Errors

Ensure:

```env
CLIENT_URL=http://localhost:3000
```

matches the frontend URL exactly.

---

## Authentication Doesn't Persist

Use the same hostname for both applications.

Recommended:

```text
Frontend: http://localhost:3000
Backend : http://localhost:5000
```

Avoid mixing:

* `localhost`
* `127.0.0.1`

within the same project.

---

# Project Documentation

## Backend

* `README.md`
* `docs/API.md`
* `docs/DEPLOYMENT.md`
* `http://localhost:5000/api/docs`

## Frontend

* `README.md`

---

# License

This project is intended for educational and portfolio purposes.
