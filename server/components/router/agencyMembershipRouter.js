const router = require('express').Router();
const AgencyMembershipController = require('../controller/agencyMembershipController');
const authentication = require('../middleware/authentication');

// every route needs a logged-in user
router.use(authentication);

router.get('/', AgencyMembershipController.getAllAgencyMemberships);
router.get('/:id', AgencyMembershipController.getAgencyMembershipById);
router.post('/', AgencyMembershipController.createAgencyMembership);
router.put('/:id', AgencyMembershipController.updateAgencyMembership);
router.delete('/:id', AgencyMembershipController.deleteAgencyMembership);

module.exports = router;
