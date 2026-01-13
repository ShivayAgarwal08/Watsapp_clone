const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Send Friend Request
const sendFriendRequest = async (req, res) => {
  const { toUserId } = req.body;
  const fromUserId = req.user.id;

  if(toUserId === fromUserId) {
    return res.status(400).json({ message: "Cannot friend yourself" });
  }

  try {
    const existing = await prisma.friendship.findFirst({
      where: {
        OR: [
          { requesterId: fromUserId, addresseeId: toUserId },
          { requesterId: toUserId, addresseeId: fromUserId }
        ]
      }
    });

    if (existing) {
      if(existing.status === 'ACCEPTED') return res.status(400).json({ message: "Already friends" });
      if(existing.status === 'PENDING') return res.status(400).json({ message: "Request pending" });
    }

    const friendship = await prisma.friendship.create({
      data: {
        requesterId: fromUserId,
        addresseeId: toUserId,
        status: 'PENDING'
      }
    });

    res.status(201).json(friendship);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Accept Request
const acceptFriendRequest = async (req, res) => {
  const { friendshipId } = req.body;

  try {
    const friendship = await prisma.friendship.update({
      where: { id: friendshipId },
      data: { status: 'ACCEPTED' }
    });
    
    // Create a chat automatically when friends accept
    // Check if chat exists first (optional, but good for cleanliness)
    
    // For now, we just establish friendship. Chat creation can happen when they click "Message"
    
    res.json(friendship);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Friends List (Accepted)
const getFriends = async (req, res) => {
  const userId = req.user.id;
  try {
    const friendships = await prisma.friendship.findMany({
      where: {
        AND: [
          { status: 'ACCEPTED' },
          { OR: [{ requesterId: userId }, { addresseeId: userId }] }
        ]
      },
      include: {
        requester: { select: { id: true, username: true, email: true, avatar: true, isOnline: true } },
        addressee: { select: { id: true, username: true, email: true, avatar: true, isOnline: true } }
      }
    });

    // Format to return just the "other" user
    const friends = friendships.map(f => {
      return f.requesterId === userId ? f.addressee : f.requester;
    });

    res.json(friends);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Pending Requests (Received)
const getPendingRequests = async (req, res) => {
  const userId = req.user.id;
  try {
    const requests = await prisma.friendship.findMany({
      where: {
        addresseeId: userId,
        status: 'PENDING'
      },
      include: {
        requester: { select: { id: true, username: true, email: true, avatar: true } }
      }
    });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { sendFriendRequest, acceptFriendRequest, getFriends, getPendingRequests };
