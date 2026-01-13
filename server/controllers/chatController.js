const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Access Chat (Create if not exists, else return)
const accessChat = async (req, res) => {
  const { userId } = req.body; // The other user ID
  if (!userId) return res.status(400).json({ message: "UserId param not sent with request" });

  try {
    // Check if chat exists between these two
    let isChat = await prisma.chat.findMany({
      where: {
        isGroup: false,
        AND: [
          { participants: { some: { id: req.user.id } } },
          { participants: { some: { id: userId } } },
        ]
      },
      include: {
        participants: { 
            select: { id: true, username: true, email: true, avatar: true, isOnline: true } 
        },
        messages: {
            orderBy: { createdAt: 'desc' },
            take: 1
        }
      }
    });

    if (isChat.length > 0) {
      res.json(isChat[0]);
    } else {
      // Create new chat
      const chatData = {
        name: "sender",
        isGroup: false,
        participants: {
          connect: [
            { id: req.user.id },
            { id: userId }
          ]
        }
      };

      const createdChat = await prisma.chat.create({
        data: chatData,
        include: {
          participants: {
             select: { id: true, username: true, email: true, avatar: true, isOnline: true } 
          }
        }
      });
      res.status(200).json(createdChat);
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Fetch all chats for user
const fetchChats = async (req, res) => {
  try {
    const chats = await prisma.chat.findMany({
      where: {
        participants: {
          some: { id: req.user.id }
        }
      },
      include: {
        participants: {
           select: { id: true, username: true, email: true, avatar: true, isOnline: true } 
        },
        messages: {
           orderBy: { createdAt: 'desc' },
           take: 1
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });
    res.json(chats);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = { accessChat, fetchChats };
