const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const { PrismaClient } = require('@prisma/client');
const path = require('path');

dotenv.config();

const app = express();
const server = http.createServer(app);
const prisma = new PrismaClient();

const io = new Server(server, {
  cors: {
    origin: "*", 
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
// app.use('/api/auth', authRoutes);
// app.use('/api/chat', chatRoutes);

app.get('/', (req, res) => {
  res.send('ChatWave Server is running');
});

// Socket.IO State
const onlineUsers = new Map(); // userId -> socketId

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('authenticate', async (userId) => {
    if(!userId) return;
    onlineUsers.set(userId, socket.id);
    socket.join(userId); // Join a room with their own ID for private events
    
    // Broadcast online status
    io.emit('presence_update', { userId, isOnline: true });
    
    try {
      await prisma.user.update({
        where: { id: userId },
        data: { isOnline: true }
      });
    } catch (e) {
      console.error("Error updating online status:", e);
    }
  });

  socket.on('send_message', async (data) => {
    // data: { chatId, senderId, content, type, ... }
    // Ideally we assume the message is already saved via API, and we are just emitting it.
    // Or we save it here. Saving via API is cleaner for error handling.
    // Let's assume API emits 'new_message' via IO.
    
    // But for real-time typing:
  });

  socket.on('typing', ({ chatId, userId }) => {
    socket.to(chatId).emit('typing', { chatId, userId });
  });

  socket.on('stop_typing', ({ chatId, userId }) => {
    socket.to(chatId).emit('stop_typing', { chatId, userId });
  });
  
  socket.on('join_chat', (chatId) => {
    socket.join(chatId);
  });

  socket.on('disconnect', async () => {
    let disconnectedUserId = null;
    for (const [uid, sid] of onlineUsers.entries()) {
      if (sid === socket.id) {
        disconnectedUserId = uid;
        break;
      }
    }
    
    if (disconnectedUserId) {
      onlineUsers.delete(disconnectedUserId);
      io.emit('presence_update', { userId: disconnectedUserId, isOnline: false });
      
      try {
        await prisma.user.update({
          where: { id: disconnectedUserId },
          data: { isOnline: false, lastSeen: new Date() }
        });
      } catch (e) {
        console.error("Error updating offline status:", e);
      }
    }
  });
});

// Make io accessible to routes
app.set('io', io);

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
