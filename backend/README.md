# InkFlow API

A scalable **Express.js + TypeScript + MongoDB (Mongoose)** backend powering **InkFlow**, a modern blogging platform with authentication, blog management, categories, comments, bookmarks, and role-based access control.

---

## Getting Started

### Install Dependencies

```bash
npm install
```

### Configure Environment Variables

```bash
cp .env.example .env
```

Update the `.env` file with your MongoDB Atlas connection string and other required environment variables.

### Seed the Database

```bash
npm run seed
```

This command creates:

* 8 demo users
* 8 blog categories
* 12 fully written blog posts with realistic content

### Start the Development Server

```bash
npm run dev
```

Server URL:

```
http://localhost:5000
```

### Run Tests

```bash
npm test
```

**31 automated tests** covering authentication, authorization, CRUD operations, validation, and blog deletion.

---

## Demo Account

```
Email:    demo@inkflow.app
Password: password123
```

---

# Highlights

This version of the backend includes several improvements over previous revisions:

* Removed the unused **avatar** field from the User model.
* Frontend now displays automatically generated user initials instead of profile images.
* Added **8 unique, realistic demo users** with no duplicate identities.
* Seed script generates **12 complete blog articles** containing:

  * Multiple paragraphs
  * Headings
  * Blockquotes
  * Lists
  * Rich, realistic content
* Fully implemented and tested **blog deletion**.
* `DELETE /api/v1/blogs/:id`

  * Owner/Admin authorization
  * Automatic bookmark cleanup
  * Comprehensive test coverage (6 dedicated test cases)

---

# API Documentation

| Resource                         | Description                                                  |
| -------------------------------- | ------------------------------------------------------------ |
| `docs/API.md`                    | Complete API reference                                       |
| `docs/DEPLOYMENT.md`             | Deployment guide for MongoDB Atlas, Render, Railway & Vercel |
| `http://localhost:5000/api/docs` | Interactive Swagger UI                                       |

---

# Testing

The test suite runs against the complete Express application, including:

* Authentication middleware
* JWT authorization
* Route handlers
* Controllers
* Validation
* Error handling

Only the **Mongoose model layer** is mocked.

Because this environment does not allow outbound network access to MongoDB Atlas or `mongodb-memory-server`, live database integration tests cannot run here.

Before deploying to production:

1. Configure a real MongoDB Atlas database.
2. Run:

```bash
npm run seed
```

3. Verify the application by testing the API or frontend manually.

---

# Project Structure

```text
src/
├── config/          # Environment, database, Cloudinary
├── controllers/     # Route controllers
├── middleware/      # Authentication, validation, uploads, rate limiting
├── models/          # User, Blog, Comment, Bookmark, Category
├── routes/          # API routes
├── scripts/         # Database seed script
├── services/        # Business logic
├── utils/           # Helpers and reusable utilities
├── validators/      # Express-validator schemas
├── app.ts
└── server.ts
```

---

# Tech Stack

* Express.js
* TypeScript
* MongoDB
* Mongoose
* JWT Authentication
* Express Validator
* Cloudinary
* Swagger (OpenAPI)
* Jest
* Supertest

---

# License

This project is intended for educational and portfolio purposes.
