const router = require('express').Router();
const MessageGroupController = require('../controller/messageGroupController');
const authentication = require('../middleware/authentication');

// every route needs a logged-in user
router.use(authentication);

router.get('/', MessageGroupController.getAllMessageGroups);
router.get('/:id', MessageGroupController.getMessageGroupById);
router.post('/', MessageGroupController.createMessageGroup);
router.put('/:id', MessageGroupController.updateMessageGroup);
router.delete('/:id', MessageGroupController.deleteMessageGroup);

module.exports = router;
