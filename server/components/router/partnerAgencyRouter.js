const router = require('express').Router();
const PartnerAgencyController = require('../controller/partnerAgencyController');
const authentication = require('../middleware/authentication');

// every route needs a logged-in user
router.use(authentication);

router.get('/', PartnerAgencyController.getAllPartnerAgencies);
router.get('/:id', PartnerAgencyController.getPartnerAgencyById);
router.post('/', PartnerAgencyController.createPartnerAgency);
router.put('/:id', PartnerAgencyController.updatePartnerAgency);
router.delete('/:id', PartnerAgencyController.deletePartnerAgency);

module.exports = router;
