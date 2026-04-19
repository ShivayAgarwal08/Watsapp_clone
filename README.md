# 💬 ChatWave - Ultimate WhatsApp Clone

![ChatWave Logo](https://img.shields.io/badge/ChatWave-Premium-blue?style=for-the-badge&logo=whatsapp)
![Tech Stack](https://img.shields.io/badge/Stack-Next.js%20|%20Express%20|%20Socket.io-orange?style=for-the-badge)

ChatWave is a modern, full-stack real-time messaging application inspired by WhatsApp. Built with a focus on speed, aesthetics, and user experience, it features seamless real-time communication, presence tracking, and a sleek glassmorphic UI.

---

## ✨ Features

- **🚀 Real-time Messaging**: Instant communication powered by Socket.io.
- **👥 Friend Management**: Send and receive friend requests, manage your social circle.
- **🖼️ Media Sharing**: Upload and share images with ease.
- **🟢 Presence Tracking**: See who's online and when they were last seen.
- **✨ Premium UI**: Responsive, glassmorphic design built with Tailwind CSS and Framer Motion.
- **🔒 Secure Auth**: JWT-based authentication with protected routes.
- **💾 Persistent Storage**: Message history and user data managed by Prisma and SQLite.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS, CSS Modules
- **Animations**: Framer Motion, Lucide React (Icons)
- **State Management**: React Context API
- **Real-time**: Socket.io-client

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: SQLite (via Prisma ORM)
- **Real-time**: Socket.io
- **Auth**: JWT, BcryptJS
- **Storage**: Multer (Local storage)

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/Watsapp_clone.git
cd Watsapp_clone
```

### 2. Backend Setup

```bash
cd server
npm install
```

Create a `.env` file in the `server` directory:
```env
PORT=4000
DATABASE_URL="file:./dev.db"
JWT_SECRET="your_secure_secret"
CLIENT_URL="http://localhost:3000"
```

Initialize the database:
```bash
npx prisma generate
npx prisma db push
```

Start the server:
```bash
npm run dev
```

### 3. Frontend Setup

```bash
cd ../client
npm install
```

Create a `.env.local` file in the `client` directory:
```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

Start the client:
```bash
npm run dev
```

---

## 📸 Screenshots

*(Add your screenshots here later)*

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is licensed under the ISC License.
