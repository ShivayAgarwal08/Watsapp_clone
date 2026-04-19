const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const { PrismaClient } = require('@prisma/client');
const path = require('path');

const authRoutes = require('./routes/authRoutes');
const friendRoutes = require('./routes/friendRoutes');
const chatRoutes = require('./routes/chatRoutes');
const messageRoutes = require('./routes/messageRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

dotenv.config();

const app = express();
const server = http.createServer(app);
const prisma = new PrismaClient();

const CLIENT_URL = process.env.CLIENT_URL || "*";

const io = new Server(server, {
  cors: {
    origin: CLIENT_URL, 
    methods: ["GET", "POST"]
  }
});

app.use(cors({ origin: CLIENT_URL }));
app.use(express.json());
// Serve static uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/friends', friendRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/message', messageRoutes);
app.use('/api/upload', uploadRoutes);

app.get('/', (req, res) => {
  res.send('ChatWave Server is running');
});

// Socket.IO Logic
const onlineUsers = new Map(); 

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('setup', (userData) => {
    if(!userData?.id) return;
    socket.join(userData.id);
    onlineUsers.set(userData.id, socket.id);
    socket.emit("connected");
    
    // Broadcast status
    io.emit('presence_update', { userId: userData.id, isOnline: true });
    prisma.user.update({
        where: { id: userData.id },
        data: { isOnline: true }
    }).catch(err => console.error(err));
  });

  socket.on('join_chat', (room) => {
    socket.join(room);
  });

  socket.on('typing', ({ chatId, username }) => {
    socket.in(chatId).emit("typing", { chatId, username });
  });
  
  socket.on('stop_typing', (chatId) => {
    socket.in(chatId).emit("stop_typing", chatId);
  });

  socket.on('new_message', (newMessageReceived) => {
    var chat = newMessageReceived.chat;
    if(!chat.participants) return;

    chat.participants.forEach(user => {
      if(user.id == newMessageReceived.senderId) return;
      socket.in(user.id).emit("message_received", newMessageReceived);
    });
  });

  socket.on('new_reaction', (reactionData) => {
     // reactionData: { chatId, messageId, reaction, type }
     socket.in(reactionData.chatId).emit("reaction_received", reactionData);
  });

  socket.on('disconnect', () => {
    let outputId = null;
    onlineUsers.forEach((value, key) => {
        if(value === socket.id) outputId = key;
    });

    if (outputId) {
       onlineUsers.delete(outputId);
       io.emit('presence_update', { userId: outputId, isOnline: false });
       prisma.user.update({
          where: { id: outputId },
          data: { isOnline: false, lastSeen: new Date() }
       }).catch(err => console.error(err));
    }
  });
});

app.set('io', io);

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
