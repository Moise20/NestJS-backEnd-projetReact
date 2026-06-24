# E-Commerce Blog — Backend API

REST API for an e-commerce platform built with **NestJS**, **TypeORM** and **PostgreSQL**.

![NestJS](https://img.shields.io/badge/NestJS-v9-red?logo=nestjs)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue?logo=postgresql)
![JWT](https://img.shields.io/badge/Auth-JWT-orange)
![CI](https://github.com/Moise20/NestJS-backEnd-projetReact/actions/workflows/ci.yml/badge.svg)

---

## About the project

This API powers a product catalog presented as a blog. Users can browse products (articles), add them to a cart and place orders. Admins can create, update and delete products.

This is a personal portfolio project built to demonstrate full-stack skills with React and NestJS.

---

## Tech stack

| Layer | Technology |
|---|---|
| Framework | NestJS 9 |
| Language | TypeScript |
| ORM | TypeORM 0.3 |
| Database | PostgreSQL (Neon in production) |
| Auth | JWT + Passport + bcrypt |
| Validation | class-validator / class-transformer |
| File uploads | Multer |
| CI/CD | GitHub Actions + SonarCloud |
| Hosting | Render |

---

## Features

- **Authentication** — register and login with JWT tokens
- **Product catalog** — CRUD for articles/products with image upload
- **Tags & comments** — tag management and per-product comments
- **Likes** — like system on articles
- **Cart** — add, update, remove items (authenticated)
- **Orders** — checkout flow with price snapshot at order time, order history

---

## Getting started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+ (or a [Neon](https://neon.tech) account for cloud hosting)

### Installation

```bash
git clone https://github.com/Moise20/NestJS-backEnd-projetReact.git
cd NestJS-backEnd-projetReact
npm install --legacy-peer-deps
```

### Environment variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

| Variable | Description |
|---|---|
| `DB_HOST` | PostgreSQL host |
| `DB_PORT` | PostgreSQL port (default: 5432) |
| `DB_USERNAME` | Database user |
| `DB_PASSWORD` | Database password |
| `DB_NAME` | Database name |
| `JWT_SECRET` | Secret key for signing JWT tokens — use a long random string in production |
| `JWT_EXPIRES_IN` | Token expiration (e.g. `7d`) |
| `PORT` | Server port (default: 3301) |

### Run in development

```bash
npm run start:dev
```

The API will be available at `http://localhost:3301`.

---

## API endpoints

### Authentication (public)

| Method | Route | Description |
|---|---|---|
| POST | `/auth/register` | Create an account |
| POST | `/auth/login` | Login — returns a JWT token |

### Products / Articles

| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/blog` | — | List all products |
| GET | `/blog/:id` | — | Get one product |
| POST | `/blog/article` | Required | Create a product |
| PUT | `/blog/:id` | Required | Update a product |
| DELETE | `/blog/:id` | Required | Delete a product |
| POST | `/blog/:id/like` | — | Like a product |
| POST | `/blog/comment/:id` | — | Add a comment |
| POST | `/blog/tag/:name` | Required | Create a tag |
| PATCH | `/blog/:id/tag/:tagId` | Required | Associate a tag |

### Cart (authenticated)

| Method | Route | Description |
|---|---|---|
| GET | `/cart` | Get current cart |
| POST | `/cart/items` | Add item to cart |
| PATCH | `/cart/items/:itemId` | Update item quantity |
| DELETE | `/cart/items/:itemId` | Remove item |

### Orders (authenticated)

| Method | Route | Description |
|---|---|---|
| POST | `/orders` | Place order from current cart |
| GET | `/orders` | Get order history |
| GET | `/orders/:id` | Get a specific order |

---

## Project structure

```
src/
├── auth/           # JWT authentication (register, login, guard, strategy)
├── users/          # User entity and service
├── blog/           # Product catalog (articles, comments, tags, likes)
├── cart/           # Shopping cart
├── orders/         # Order management
└── dtos/           # Shared DTOs
```

---

## Deployment

This API is designed to be deployed on [Render](https://render.com) with a [Neon](https://neon.tech) PostgreSQL database.

Set all environment variables in your Render service settings. SSL is enabled automatically when `DB_HOST` is not `localhost`.

---

*Portfolio project — Moïse PANA*
