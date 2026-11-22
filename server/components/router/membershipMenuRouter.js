const router = require('express').Router();
const MembershipMenuController = require('../controller/membershipMenuController');
const authentication = require('../middleware/authentication');

// every route needs a logged-in user
router.use(authentication);

router.get('/', MembershipMenuController.getAllMembershipMenus);
router.get('/:id', MembershipMenuController.getMembershipMenuById);
router.post('/', MembershipMenuController.createMembershipMenu);
router.put('/:id', MembershipMenuController.updateMembershipMenu);
router.delete('/:id', MembershipMenuController.deleteMembershipMenu);

module.exports = router;
