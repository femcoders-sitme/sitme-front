# SitMe Frontend

SitMe Frontend is a web application built with [Next.js 14](https://nextjs.org) and [TypeScript](https://www.typescriptlang.org/).  
It provides the user interface for **SitMe**, a room and table reservation system for corporate environments.  

The frontend communicates with the [SitMe Backend API](https://github.com/femcoders-sitme/sitme) to handle authentication, reservations, and space management.

---


## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [Available Scripts](#available-scripts)
- [Backend Integration](#backend-integration)
- [Team](#team)
- [License](#license)
- [Support](#support)

---

## Features

- **Home page** with branding and CTAs.
- **Spaces**: list and detail pages for rooms and tables.
- **Login** with JWT (session persisted via cookies).
- **Reservations**:
  - Users can create reservations for a selected space.
  - **Admin-only** listing of all reservations.
- **Role-based UI** (visibility based on `USER` or `ADMIN`).
- **Route Handlers** under `app/api/*` acting as a thin proxy to the backend.
- **Responsive UI** built with Tailwind CSS.

---

## Tech Stack

- **Next.js** (App Router)
- **React** + **TypeScript**
- **Tailwind CSS**
- **JWT** (issued by backend, stored in cookie)
- **Node.js** (for local development)
- **Docker** (optional)

---

## Prerequisites

- **Node.js** ≥ 18 (LTS recommended)
- **npm** or **yarn**
- Running instance of the **SitMe Backend** (Spring Boot) or a reachable backend URL

---

## Getting Started

Clone the repository:

```bash
git clone https://github.com/femcoders-sitme/sitme-frontend.git
cd sitme-frontend
```

Install dependencies:

```bash
npm install
# or
yarn install
```

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

---

## Environment Variables

Create a `.env.local` file at the project root:

```env
NEXT_PUBLIC_BACKEND_API_URL=http://localhost:8080
JWT_COOKIE_NAME=pt_jwt
```

NEXT_PUBLIC_BACKEND_API_URL — URL of the SitMe backend (must be prefixed with NEXT_PUBLIC_ to be available on the client).

JWT_COOKIE_NAME — Name of the cookie where the JWT is stored (used by route handlers and hooks).

Note: In production, set these values in your hosting provider’s environment settings.

---

## Project Structure

```bash
src/
 ├─ app/
 │   ├─ api/
 │   │   ├─ auth/
 │   │   │   ├─ login/route.ts     # POST login → proxies to backend
 │   │   │   ├─ logout/route.ts    # POST logout (clear cookie)
 │   │   │   └─ me/route.ts        # GET current user (optional helper)
 │   │   └─ reservations/route.ts  # GET/POST reservations → proxy
 │   ├─ login/page.tsx             # Login page
 │   ├─ reservations/page.tsx      # Admin-only reservations page
 │   ├─ spaces/                    # Spaces list (and optional [id] detail)
 │   └─ page.tsx                   # Home page
 ├─ components/
 │   └─ Header.tsx                 # Shared header / nav
 ├─ hooks/
 │   └─ useAuth.ts                 # Auth state & helpers
 └─ styles/                        # Global styles (Tailwind)
```

---

## Available Scripts

```bash
npm run dev       # Start development server
npm run build     # Create production build
npm run start     # Start production server (after build)
npm run lint      # Run linter
```

---

## Backend Integration

The frontend communicates with the SitMe backend (Spring Boot + MySQL).
Typical endpoints consumed:

```bash
POST /api/auth/login — authenticate and receive JWT.
GET /api/spaces — fetch available spaces.
GET /api/spaces/{id} — fetch a specific space detail.
POST /api/reservations — create a reservation.
GET /api/reservations — list reservations (ADMIN only).
```

Route Handlers (under app/api/*) forward requests to the backend and attach the Authorization: Bearer <token> header when a JWT cookie exists.

---

## Team

- **Débora Rubio** – Team Leader and Scrum Master
- **Lara Pla** – Product Owner
- **Mariia Sycheva** – Developer
- **Mayleris Echezuria** – Developer
- **Vita Poperechna** – Developer
- **Saba Ur Rehman** – Developer

---

## License

This project is part of a learning bootcamp and is intended for educational purposes.

---

## Support

For questions or issues, please create an issue in the repository or contact the development team.

---

**Built with 💜 using Next.js**