const express = require('express');
const router = express.Router();
const { sendFriendRequest, acceptFriendRequest, getFriends, getPendingRequests } = require('../controllers/friendController');
const { protect } = require('../middleware/authMiddleware');

router.post('/request', protect, sendFriendRequest);
router.post('/accept', protect, acceptFriendRequest);
router.get('/', protect, getFriends);
router.get('/pending', protect, getPendingRequests);

module.exports = router;
