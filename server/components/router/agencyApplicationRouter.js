const router = require('express').Router();
const AgencyApplicationController = require('../controller/agencyApplicationController');
const authentication = require('../middleware/authentication');

// every route needs a logged-in user
router.use(authentication);

router.get('/', AgencyApplicationController.getAllAgencyApplications);
router.get('/:id', AgencyApplicationController.getAgencyApplicationById);
router.post('/', AgencyApplicationController.createAgencyApplication);
router.put('/:id', AgencyApplicationController.updateAgencyApplication);
router.delete('/:id', AgencyApplicationController.deleteAgencyApplication);

module.exports = router;
