# InkFlow

### A Modern Full Stack Blogging Platform

InkFlow is a full-stack blogging platform built with Next.js, Express.js, MongoDB, and TypeScript. It allows users to create, edit, publish, and manage blogs through a modern, responsive interface while providing a secure and scalable backend API.

---

## Overview

InkFlow is designed to provide a clean writing experience with authentication, rich blog management, image uploads, categories, comments, bookmarks, likes, and user profiles.

The project follows a separated frontend and backend architecture, making it easy to develop, maintain, and deploy independently.

---

## Features

- User Authentication (JWT)
- Secure Login & Registration
- Refresh Token Authentication
- Create, Update & Delete Blogs
- Rich Text Blog Editor
- Image Uploads with Cloudinary
- Categories
- Blog Search
- Comments
- Likes
- Bookmarks
- User Profiles
- Reading Time Calculation
- Responsive UI
- REST API
- Swagger Documentation
- Rate Limiting
- Helmet Security
- MongoDB Sanitization

---

# Tech Stack

## Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS
- Framer Motion
- Radix UI

## Backend

- Node.js
- Express.js
- TypeScript
- MongoDB
- Mongoose
- JWT Authentication
- Cloudinary
- Multer

---

# Project Structure

```
InkFlow/
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   └── validators/
│   │
│   ├── uploads/
│   ├── tests/
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── lib/
│   │   ├── services/
│   │   └── types/
│   │
│   ├── public/
│   └── package.json
│
└── README.md
```

---

# Installation

## Clone Repository

```bash
git clone https://github.com/Navaneeth-Mahesh/InkFlow-BlogPlatform.git
cd InkFlow-BlogPlatform
```

---

# Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file.

```env
NODE_ENV=development
PORT=5000

CLIENT_URL=http://localhost:3000

MONGODB_URI=YOUR_MONGODB_URI

JWT_ACCESS_SECRET=YOUR_ACCESS_SECRET
JWT_REFRESH_SECRET=YOUR_REFRESH_SECRET

JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=30d

CLOUDINARY_CLOUD_NAME=YOUR_CLOUD_NAME
CLOUDINARY_API_KEY=YOUR_API_KEY
CLOUDINARY_API_SECRET=YOUR_API_SECRET
```

Run the backend

```bash
npm run dev
```

---

# Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
```

Run the frontend

```bash
npm run dev
```

---

# API Documentation

Swagger documentation is available at

```
http://localhost:5000/api/docs
```

---

# Deployment

## Backend

Render

## Frontend

Vercel

---

# Available Scripts

## Backend

```bash
npm run dev
npm run build
npm start
npm test
```

## Frontend

```bash
npm run dev
npm run build
npm start
```

---

# Security

- JWT Authentication
- HTTP Only Refresh Cookies
- Helmet
- Rate Limiting
- MongoDB Sanitization
- Input Validation
- Password Hashing
- CORS Protection

---

# Author

**Navaneeth Mahesh**

GitHub

https://github.com/Navaneeth-Mahesh

---

# License

This project is licensed under the MIT License.
