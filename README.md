# 🗂️ Team Task Manager

A **production-ready, full-stack Team Task Manager** with authentication, role-based access control, project management, Kanban task tracking, and a real-time admin dashboard.

## 🏗️ Tech Stack

### Backend
- **Node.js + Express.js** — REST API
- **MongoDB + Mongoose** — Database & ODM
- **JWT** — Access & Refresh token authentication
- **bcryptjs** — Password hashing
- **express-validator** — Input validation

### Frontend
- **React 19** (Vite) — UI framework
- **Tailwind CSS 3** — Styling
- **React Router v6** — Navigation
- **TanStack Query** — Server state management
- **React Hook Form + Zod** — Form validation
- **Recharts** — Dashboard charts
- **@hello-pangea/dnd** — Kanban drag & drop
- **Lucide React** — Icons

## ✨ Features

- 🔐 **Authentication** — Register, login, JWT access/refresh tokens, httpOnly cookies
- 👥 **Role-Based Access Control** — Global admin & project-level roles
- 📊 **Dashboard** — Stat cards, donut chart (task status), bar chart (priority), overdue table
- 📁 **Project Management** — CRUD projects, add/remove members, search & filter
- 📋 **Kanban Board** — Drag-and-drop tasks across TODO → IN_PROGRESS → IN_REVIEW → DONE
- 🛡️ **Admin Panel** — User management, login history, activity logs, user deletion
- 📝 **Activity Logging** — Tracks login/logout, project/task CRUD, member changes

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### 1. Clone the repo
```bash
git clone https://github.com/YOUR_USERNAME/team-task-manager.git
cd team-task-manager
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in `backend/`:
```env
MONGODB_URI=mongodb+srv://your-connection-string
JWT_SECRET=your_jwt_secret_min_32_chars
JWT_REFRESH_SECRET=your_jwt_refresh_secret_min_32_chars
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:5173
```

Seed the database:
```bash
npm run seed
```

Start the backend:
```bash
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### 4. Open the app
Visit **http://localhost:5173**

### Demo Credentials
| Role   | Email           | Password     |
|--------|-----------------|--------------|
| Admin  | admin@demo.com  | Admin@1234   |
| Member | alice@demo.com  | Member@1234  |
| Member | bob@demo.com    | Member@1234  |
| Member | carol@demo.com  | Member@1234  |

## 📁 Project Structure

```
team-task-manager/
├── backend/
│   ├── server.js              # Entry point
│   ├── src/
│   │   ├── app.js             # Express app config
│   │   ├── models/            # Mongoose models
│   │   ├── controllers/       # Route handlers
│   │   ├── routes/            # API routes
│   │   ├── middleware/        # Auth, RBAC, validation
│   │   ├── validators/        # Express-validator rules
│   │   ├── utils/             # JWT, response helpers, logger
│   │   └── db/seed.js         # Database seeder
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── api/               # Axios config
│   │   ├── context/           # Auth context
│   │   ├── components/layout/ # Layout, Sidebar, Navbar
│   │   └── pages/             # All page components
│   └── tailwind.config.js
└── README.md
```

## 📜 API Endpoints

| Method | Endpoint                          | Description              | Auth  |
|--------|-----------------------------------|--------------------------|-------|
| POST   | `/api/auth/register`              | Register user            | ❌    |
| POST   | `/api/auth/login`                 | Login                    | ❌    |
| POST   | `/api/auth/refresh`               | Refresh token            | ❌    |
| POST   | `/api/auth/logout`                | Logout                   | ✅    |
| GET    | `/api/auth/me`                    | Current user             | ✅    |
| GET    | `/api/projects`                   | List projects            | ✅    |
| POST   | `/api/projects`                   | Create project           | ✅    |
| GET    | `/api/projects/:id`               | Project details          | ✅    |
| PUT    | `/api/projects/:id`               | Update project           | ✅ 🛡️ |
| DELETE | `/api/projects/:id`               | Delete project           | ✅ 🛡️ |
| POST   | `/api/projects/:id/members`       | Add member               | ✅ 🛡️ |
| GET    | `/api/tasks/project/:projectId`   | List project tasks       | ✅    |
| POST   | `/api/tasks/project/:projectId`   | Create task              | ✅    |
| PATCH  | `/api/tasks/:id/status`           | Update task status       | ✅    |
| DELETE | `/api/tasks/:id`                  | Delete task              | ✅    |
| GET    | `/api/dashboard/stats`            | Dashboard statistics     | ✅    |
| GET    | `/api/dashboard/overdue`          | Overdue tasks            | ✅    |
| GET    | `/api/admin/activity-logs`        | Activity logs            | ✅ 👑 |
| GET    | `/api/admin/login-history`        | Login history            | ✅ 👑 |
| DELETE | `/api/admin/users/:id`            | Delete user              | ✅ 👑 |

✅ = Auth required · 🛡️ = Project admin · 👑 = Global admin only

## 📄 License

MIT
