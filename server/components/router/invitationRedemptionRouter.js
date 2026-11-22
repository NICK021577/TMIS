const router = require('express').Router();
const InvitationRedemptionController = require('../controller/invitationRedemptionController');
const authentication = require('../middleware/authentication');

// every route needs a logged-in user
router.use(authentication);

router.get('/', InvitationRedemptionController.getAllInvitationRedemptions);
router.get('/:id', InvitationRedemptionController.getInvitationRedemptionById);
router.post('/', InvitationRedemptionController.createInvitationRedemption);
router.put('/:id', InvitationRedemptionController.updateInvitationRedemption);
router.delete('/:id', InvitationRedemptionController.deleteInvitationRedemption);

module.exports = router;
