# 🗣️ Bolna Dey — Nepal's Civic Accountability Platform

> *"Let the People Speak."* | बोल्न देउ

A full-stack civic journalism and government transparency platform for Nepal — built with Next.js 14, MongoDB, and NextAuth.

---

## ✨ Features

- **📰 News & Articles** — Publish, categorise, and search civic journalism with rich engagement (reactions, comments)
- **🏛️ Government Project Tracker** — Track 147+ public projects with live progress, budget transparency, and voting
- **📢 Citizen Reports** — Anonymous or attributed issue reporting directly escalated to journalists
- **👤 User Profiles** — Journalists, editors, admins with role-based access control
- **🔐 Auth** — NextAuth v4 with credentials (email/password) + role system
- **⚡ Gen Z Design** — Dark mode, gradient text, bento grid, glassmorphism, animated blobs

---

## 🚀 Quick Start (5 minutes)

### 1. Prerequisites
- Node.js 18+
- MongoDB Atlas account (free tier works)
- Git

### 2. Clone & install
```bash
git clone https://github.com/YOUR_USERNAME/bolna-dey.git
cd bolna-dey
npm install
```

### 3. Set up environment variables
```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/bolna-dey?retryWrites=true&w=majority
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-super-secret-key-at-least-32-chars-long
SEED_SECRET=any-random-string-for-seeding
```

> 💡 **Getting NEXTAUTH_SECRET:** Run `openssl rand -base64 32` in terminal

### 4. Run development server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

### 5. Seed the database
```bash
curl -X POST http://localhost:3000/api/seed
```

This creates:
| Role | Email | Password |
|------|-------|----------|
| 🔴 Admin | admin@bolnadey.np | Admin@1234 |
| ✍️ Editor | priya@bolnadey.np | Editor@1234 |
| 👤 User | raj@bolnadey.np | User@12345 |

And seeds: 4 articles, 5 projects, 3 reports.

---

## 🌐 Deploy to Vercel (Recommended)

### One-click deploy
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/bolna-dey)

### Manual deploy
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard:
# Settings → Environment Variables → add:
# MONGODB_URI, NEXTAUTH_URL (your-app.vercel.app), NEXTAUTH_SECRET, SEED_SECRET
```

After deploy, seed production:
```bash
curl -X POST https://your-app.vercel.app/api/seed?secret=YOUR_SEED_SECRET
```

---

## 📁 Project Structure

```
src/
├── app/
│   ├── page.jsx              # Home page (server component, fetches DB)
│   ├── layout.jsx            # Root layout with Navbar, Footer, AuthProvider
│   ├── news/
│   │   ├── page.jsx          # Articles listing + search + category filter
│   │   ├── new/page.jsx      # Create article (editors/admins only)
│   │   └── [slug]/           # Article detail + comments
│   ├── tracker/
│   │   ├── page.jsx          # Projects grid + filters + stats
│   │   └── [id]/             # Project detail + votes + comments
│   ├── report/page.jsx       # Submit citizen report
│   ├── profile/[id]/         # User profile + articles + settings
│   ├── dashboard/            # Admin/editor panel (protected)
│   ├── (auth)/login|register # Auth pages
│   └── api/                  # REST API routes
│       ├── auth/[...nextauth] # NextAuth handler
│       ├── articles/          # CRUD + search + views
│       ├── projects/          # CRUD + voting
│       ├── reports/           # CRUD + status updates
│       ├── comments/          # Create comments
│       ├── votes/             # Article reactions + project votes
│       ├── users/             # Register + profile updates
│       └── seed/              # Database seeder
├── components/
│   ├── Navbar.jsx            # Floating pill navbar + live ticker
│   ├── Footer.jsx            # Footer with links
│   ├── ArticleCard.jsx       # Reusable article card
│   ├── ProjectCard.jsx       # Reusable project card with vote buttons
│   ├── AuthProvider.jsx      # NextAuth session provider
│   └── CursorEffect.jsx      # Custom cursor (client)
├── lib/
│   ├── mongodb.js            # Mongoose connection (serverless-safe)
│   ├── auth.js               # Session helpers + requireAuth/requireAdmin
│   └── utils.js              # makeSlug, timeAgo, readTime, constants
├── models/
│   ├── User.js               # name, email, password(bcrypt), role, bio
│   ├── Article.js            # title, slug, content, category, reactions
│   ├── Project.js            # title, status, progress, budget, location
│   ├── Report.js             # type, status, district, anonymous option
│   └── Comment.js            # polymorphic (Article|Project|Report)
└── middleware.js             # Route protection for /dashboard, /news/new
```

---

## 🔑 API Reference

### Articles
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/articles` | — | List with `?category=&search=&featured=&page=` |
| POST | `/api/articles` | editor/admin | Create article |
| GET | `/api/articles/[id]` | — | Get by ID or slug, increments views |
| PUT | `/api/articles/[id]` | owner/admin | Update |
| DELETE | `/api/articles/[id]` | admin | Delete + cascade comments |

### Projects
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/projects` | — | List with `?status=&category=&page=` |
| POST | `/api/projects` | editor/admin | Create |
| PUT | `/api/projects/[id]` | editor/admin | Update; `?action=vote&dir=up/down` for voting |

### Reports
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/reports` | — | Public reports; `?mine=true` for own |
| POST | `/api/reports` | any (anon ok) | Submit report |
| PUT | `/api/reports/[id]` | editor/admin | Update status + admin notes |

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/users` | Register new user |
| GET/POST | `/api/auth/...` | NextAuth (login/logout/session) |

---

## 🎨 Design System

```css
/* Fonts: Unbounded (display) + Outfit (body) + Playfair Display (italic serif) */
/* Colors */
--red:    #FF0A16   /* Primary brand */
--pink:   #FF4D88   /* Accent 1 */
--cyan:   #00F0FF   /* Accent 2 */
--purple: #C77DFF   /* Accent 3 */
--yellow: #FFD60A   /* Accent 4 */
--green:  #00E676   /* Success */
--orange: #FF6D00   /* Warning */

/* Gradient utilities: .gt .gt2 .gt3 .gt4 */
/* Form inputs: .form-input */
/* Animations: blobPulse, shimmer, tickerAnim, floatAnim, pulseAnim, slideUp */
```

---

## 🛠️ Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGODB_URI` | ✅ | MongoDB Atlas connection string |
| `NEXTAUTH_URL` | ✅ | Your app URL (e.g. https://bolnadey.vercel.app) |
| `NEXTAUTH_SECRET` | ✅ | Secret for JWT signing (32+ chars) |
| `SEED_SECRET` | Optional | Protects `/api/seed` in production |
| `CLOUDINARY_CLOUD_NAME` | Optional | For image uploads |
| `CLOUDINARY_API_KEY` | Optional | For image uploads |
| `CLOUDINARY_API_SECRET` | Optional | For image uploads |

---

## 🗺️ Roadmap

- [ ] Rich text editor (TipTap) for article writing
- [ ] Cloudinary image uploads
- [ ] RTI request tracker
- [ ] Email notifications for report status updates
- [ ] PWA support + offline reading
- [ ] Nepali language (i18n) support
- [ ] Search with full-text MongoDB Atlas Search
- [ ] Social sharing with OG images

---

## 🤝 Contributing

This is an open-source civic tech project. PRs welcome.

```bash
git checkout -b feature/your-feature
git commit -m 'feat: add your feature'
git push origin feature/your-feature
```

---

## 📄 License

MIT — free for civic use, journalism, and education.

---

*Built with 🇳🇵 for Nepal. Independent. Fearless. Free.*
