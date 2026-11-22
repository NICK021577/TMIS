const router = require('express').Router();
const MessageController = require('../controller/messageController');
const authentication = require('../middleware/authentication');

// every route needs a logged-in user
router.use(authentication);

router.get('/', MessageController.getAllMessages);
router.get('/:id', MessageController.getMessageById);
router.post('/', MessageController.createMessage);
router.put('/:id', MessageController.updateMessage);
router.delete('/:id', MessageController.deleteMessage);

module.exports = router;
