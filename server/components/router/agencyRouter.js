const router = require('express').Router();
const AgencyController = require('../controller/agencyController');
const authentication = require('../middleware/authentication');

// every route needs a logged-in user
router.use(authentication);

router.get('/', AgencyController.getAllAgencies);
router.get('/:id', AgencyController.getAgencyById);
router.post('/', AgencyController.createAgency);
router.put('/:id', AgencyController.updateAgency);
router.delete('/:id', AgencyController.deleteAgency);

module.exports = router;
