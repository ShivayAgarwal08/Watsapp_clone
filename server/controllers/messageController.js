const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const sendMessage = async (req, res) => {
  const { content, chatId, type, fileUrl, fileName, fileSize } = req.body;
  
  if ((!content && !fileUrl) || !chatId) {
    return res.status(400).json({ message: "Invalid data passed into request" });
  }

  const newMessage = {
    senderId: req.user.id,
    content: content || "",
    chatId: chatId,
    type: type || "text",
    fileUrl: fileUrl || null,
    fileName: fileName || null,
    fileSize: fileSize ? parseInt(fileSize) : null
  };

  try {
    let message = await prisma.message.create({
      data: newMessage,
      include: {
        sender: { select: { id: true, username: true, avatar: true } },
        chat: true
      }
    });

    // Update Chat's updatedAt
    await prisma.chat.update({
      where: { id: chatId },
      data: { updatedAt: new Date() }
    });

    res.json(message);
    
    // Emit via Socket.IO if we have access to io instance
    // (We will handle this better by letting the client emit the socket event after success, or emitting here if we attach io to req)
    const io = req.app.get('io');
    if(io) {
       io.to(chatId).emit("receive_message", message);
    }
    
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const allMessages = async (req, res) => {
  try {
    const messages = await prisma.message.findMany({
      where: { chatId: req.params.chatId },
      include: {
        sender: { select: { id: true, username: true, avatar: true } }
      },
      orderBy: { createdAt: 'asc' }
    });
    res.json(messages);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = { sendMessage, allMessages };
