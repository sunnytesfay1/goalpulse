# GoalPulse 🚀

GoalPulse is a full-stack goal accountability platform that helps users
stay consistent with daily, weekly, and monthly goals through automated
reminders and progress tracking.

## 🌐 Live Demo

Website Link: https://GoalPulse.com

## 📌 Overview

GoalPulse allows users to create recurring goals and receive automated
reminders when goals are nearing deadlines.\
The system uses scheduled background processing to evaluate goal cadence
and trigger notifications, simulating real-world backend workflows
beyond standard request/response applications.

## ✨ Features

- Secure user authentication (JWT)
- Create and manage recurring goals
- Daily, weekly, and monthly goal cadence
- Goal completion tracking
- Automated reminder notifications
- Scheduled background job processing
- Responsive dashboard UI

## 🏗 Architecture

Client (Next.js) ↓ Express REST API ↓ PostgreSQL Database ↓ Cron
Scheduler → Notification Service

## 🛠 Tech Stack

**Frontend** - Next.js (App Router) - React - Tailwind CSS

**Backend** - Node.js - Express - JWT Authentication - node-cron
scheduler

**Database** - PostgreSQL - Prisma ORM

**Deployment** - Vercel (Frontend) - Railway (API + Database)

## ⚙️ System Design Highlights

- Implemented scheduled background workers to process reminders
  independently from user requests.
- Designed frequency-aware scheduling logic supporting daily, weekly,
  and monthly goals.
- Prevented duplicate notifications using reminder state tracking.
- Structured API using RESTful design principles.

## 🚀 Local Setup

### Clone repo

```bash
git clone https://github.com/sunnytesfay1/goalpulse.git
cd goalpulse
```

### Backend setup

```bash
cd server
npm install
npm run dev
```

### Frontend setup

```bash
cd frontend
npm install
npm run dev
```

## 🔐 Environment Variables

Create a `.env` file:

    DATABASE_URL=
    JWT_SECRET=
    EMAIL_API_KEY=

## 📈 Future Improvements

- Push notifications
- Redis job queue
- Analytics dashboard
- Mobile support

## 👨‍💻 Author

Sanny Tesfay\
Software Engineer\
LinkedIn: https://www.linkedin.com/in/sanny-tesfay/
