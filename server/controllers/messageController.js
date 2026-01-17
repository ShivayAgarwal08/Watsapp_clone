const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const sendMessage = async (req, res) => {
  const { content, chatId, type, fileUrl, fileName, fileSize, replyToId } = req.body;
  
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
    fileSize: fileSize ? parseInt(fileSize) : null,
    replyToId: replyToId || null
  };

  try {
    let message = await prisma.message.create({
      data: newMessage,
      include: {
        sender: { select: { id: true, username: true, avatar: true } },
        chat: true,
        replyTo: {
          select: { id: true, content: true, type: true, sender: { select: { username: true } } }
        }
      }
    });

    await prisma.chat.update({
      where: { id: chatId },
      data: { updatedAt: new Date() }
    });

    res.json(message);
    
    // Fix: We emit message logic in controller but index.js handles socket routing usually
    const io = req.app.get('io');
    if(io) {
       // We can iterate participants here to send notification
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
        sender: { select: { id: true, username: true, avatar: true } },
        replyTo: {
          select: { id: true, content: true, type: true, sender: { select: { username: true } } }
        },
        reactions: {
          include: {
             user: { select: { id: true, username: true } }
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    });
    res.json(messages);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const addReaction = async (req, res) => {
  const { messageId, emoji } = req.body;
  try {
    // Check if exists
    const existing = await prisma.reaction.findUnique({
      where: {
        userId_messageId: {
          userId: req.user.id,
          messageId: messageId
        }
      }
    });

    if(existing) {
       // Update or Remove? Let's toggle or update
       if(existing.emoji === emoji) {
          await prisma.reaction.delete({
             where: { id: existing.id }
          });
          return res.json({ messageId, type: 'remove', reactionId: existing.id });
       } else {
          const updated = await prisma.reaction.update({
             where: { id: existing.id },
             data: { emoji }
          });
          return res.json({ messageId, type: 'update', reaction: updated });
       }
    }

    const reaction = await prisma.reaction.create({
      data: {
        userId: req.user.id,
        messageId,
        emoji
      },
      include: {
         user: { select: { id: true, username: true } }
      }
    });
    res.json({ messageId, type: 'add', reaction });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = { sendMessage, allMessages, addReaction };
