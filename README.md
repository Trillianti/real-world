# 🧪 RealWorld API – Medium Clone (NestJS + Prisma + PostgreSQL)

This is a pet project that implements the [RealWorld API specification](https://github.com/gothinkster/realworld) using **NestJS**, **Prisma ORM**, and **PostgreSQL**.

It serves as a backend clone of Medium.com, featuring user authentication, article creation, comments, favoriting, and following profiles.

---

## 🚀 Tech Stack

- **NestJS** – Scalable Node.js framework for building efficient server-side applications
- **Prisma** – Modern TypeScript ORM for database access
- **PostgreSQL** – Relational database
- **JWT** – JSON Web Tokens for authentication
- **Swagger** – Interactive API documentation
- **Jest** – Testing framework for unit and end-to-end tests

---

## 📦 Features

- **User authentication** (register, login, update current user)
- **JWT-based authorization** for protected endpoints
- **Articles CRUD** (create, read, update, delete)
- **Feed** – articles by followed users
- **Filter articles** by tag, author, or favorites
- **Commenting system** (add, list, delete comments)
- **Favorites system** – like/unlike articles
- **Profiles** – follow/unfollow users
- **Tags** – retrieve all unique article tags

---

## 🛠 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Trillianti/real-world.git
cd real-world
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up your environment

Create a `.env` file and configure the database connection:

```
DATABASE_URL="postgresql://user:password@localhost:5432/realworld"
JWT_SECRET="your_jwt_secret"
```

### 4. Run Prisma migrations

```bash
npx prisma migrate dev --name init
```

### 5. Start the server

```bash
npm run start:dev
```

Visit the API at `http://localhost:3000`

---

## 🧪 Testing

```bash
# Unit and integration tests
npm run test
```

---

## 📚 API Documentation

Once the server is running, you can access Swagger documentation at:

```
http://localhost:3000/docs
```

It includes schemas, parameters, and example requests for every endpoint.

---

## 📝 Project Structure

```
src/
├── auth/          # JWT, login/register logic
├── users/         # User CRUD and profile updates
├── profiles/      # Following/unfollowing logic
├── articles/      # Articles and related logic
├── comments/      # Comment endpoints
├── tags/          # Tag list endpoint
├── prisma/        # Prisma schema and DB access
└── main.ts        # App bootstrap
```

---

## ✅ RealWorld Endpoints Checklist

- [x] Articles CRUD
- [x] Articles feed
- [x] Comments
- [x] Favorites
- [x] Profiles follow/unfollow
- [x] Auth (register/login)
- [x] Tags
- [ ] GraphQL (optional)
- [ ] Redis cache (optional)
- [ ] Rate limiting (optional)

---

## 📬 Contact

This project was built by Dmytro Shatokhin as a learning exercise.  
Feel free to fork, improve, or contact me via GitHub for collaboration!
