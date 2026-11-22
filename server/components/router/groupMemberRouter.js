const router = require('express').Router();
const GroupMemberController = require('../controller/groupMemberController');
const authentication = require('../middleware/authentication');

// every route needs a logged-in user
router.use(authentication);

router.get('/', GroupMemberController.getAllGroupMembers);
router.get('/:id', GroupMemberController.getGroupMemberById);
router.post('/', GroupMemberController.createGroupMember);
router.put('/:id', GroupMemberController.updateGroupMember);
router.delete('/:id', GroupMemberController.deleteGroupMember);

module.exports = router;
