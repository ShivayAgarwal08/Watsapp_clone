const express = require('express');
const router = express.Router();
const { sendMessage, allMessages, addReaction } = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').post(protect, sendMessage);
router.route('/:chatId').get(protect, allMessages);
router.route('/reaction').post(protect, addReaction);

module.exports = router;
