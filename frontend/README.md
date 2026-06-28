# InkFlow Frontend

A modern blogging platform built with **Next.js App Router**, **TypeScript**, **Tailwind CSS v4**, **Framer Motion**, and **Radix UI**. The application communicates with the companion **InkFlow API** to provide authentication, blog management, user profiles, comments, bookmarks, and more.

---

# Getting Started

## Install Dependencies

```bash
npm install
```

## Configure Environment Variables

```bash
cp .env.example .env.local
```

By default, the frontend connects to:

```text
http://localhost:5000/api/v1
```

## Start the Development Server

```bash
npm run dev
```

Application URL:

```text
http://localhost:3000
```

> **Note:** The backend server must be running before starting the frontend. Refer to the backend documentation for setup instructions.

---

# Production Commands

Build the application:

```bash
npm run build
```

Run lint checks:

```bash
npm run lint
```

---

# Improvements in This Revision

This release introduces several major improvements and bug fixes:

### Initials-Based User Avatars

* Removed the unused `avatar` field from all types and components.
* Added `InitialsAvatar` (`src/components/shared/initials-avatar.tsx`) to generate deterministic, colored avatar circles using user initials.

### Improved Seed Data

* Displays **8 unique, realistic authors** from the updated backend seed data.
* Blog posts now contain **complete, multi-paragraph articles** instead of placeholder content.

### Reliable Toast Notification System

The notification system has been completely rebuilt.

Key improvements:

* Explicit timer management using `setTimeout`
* Active timers tracked inside a `Map`
* Guaranteed dismissal without relying on CSS `animationend`
* Manual close button follows the same dismissal logic as automatic timeout
* Smooth fade-out animations with consistent behavior

Files:

```text
src/hooks/use-toast.ts
src/components/shared/toaster.tsx
```

### Blog Management

Improved profile management functionality:

* Owner-only **Edit/Delete** menu on published blog cards
* Draft deletion now calls the real `deleteBlog` API
* Removed the previous placeholder implementation

### Demo Authentication

Updated the demo login credentials to match the backend seed data.

```text
Email:    demo@inkflow.app
Password: password123
```

If the backend server is unavailable, the application now displays a clear error notification instead of failing silently.

---

# Project Architecture

```text
src/
├── lib/
│   ├── api-client.ts        # Fetch wrapper, JWT storage, automatic token refresh
│   ├── mappers.ts           # API response mapping
│   └── services/            # Resource-specific API modules
│
├── hooks/
│   ├── use-app-state.tsx    # Authentication, optimistic updates, rollback handling
│   └── use-toast.ts         # Timer-based toast queue
│
└── components/
    ├── profile/
    └── shared/
```

---

# Tech Stack

* Next.js App Router
* React
* TypeScript
* Tailwind CSS v4
* Framer Motion
* Radix UI
* React Hook Form
* Zod
* Axios / Fetch API
* JWT Authentication

---

# Current Features

* Authentication
* User Profiles
* Blog CRUD
* Rich Text Rendering
* Categories
* Search
* Comments
* Bookmarks
* Follow / Unfollow
* Optimistic UI Updates
* Responsive Design
* Animated UI Components
* Toast Notifications

---

# Known Limitations

The following features are intentionally documented:

* **Comment Likes**

  * Currently handled locally.
  * No dedicated backend endpoint exists yet.
  * Blog likes are fully supported.

* **Featured Content**

  * "Featured" posts and "Popular Authors" are generated using the backend's trending/search endpoints.
  * There is currently no dedicated featured flag.

* **Image Upload**

  * Uses Cloudinary when configured.
  * Falls back to local server storage if Cloudinary credentials are unavailable.

---

# Backend Requirement

This frontend requires the companion **InkFlow API** to be running for authentication, blog management, user data, and all other dynamic functionality.

Configure the API endpoint inside:

```text
.env.local
```

Default:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
```

---

# License

This project is intended for educational and portfolio purposes.
