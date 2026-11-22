const router = require('express').Router();
const AgencySubscriptionController = require('../controller/agencySubscriptionController');
const authentication = require('../middleware/authentication');

// every route needs a logged-in user
router.use(authentication);

router.get('/', AgencySubscriptionController.getAllAgencySubscriptions);
router.get('/:id', AgencySubscriptionController.getAgencySubscriptionById);
router.post('/', AgencySubscriptionController.createAgencySubscription);
router.put('/:id', AgencySubscriptionController.updateAgencySubscription);
router.delete('/:id', AgencySubscriptionController.deleteAgencySubscription);

module.exports = router;
