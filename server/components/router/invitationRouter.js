const router = require('express').Router();
const InvitationController = require('../controller/invitationController');
const authentication = require('../middleware/authentication');

// every route needs a logged-in user
router.use(authentication);

router.get('/', InvitationController.getAllInvitations);
router.get('/:id', InvitationController.getInvitationById);
router.post('/', InvitationController.createInvitation);
router.put('/:id', InvitationController.updateInvitation);
router.delete('/:id', InvitationController.deleteInvitation);

module.exports = router;
