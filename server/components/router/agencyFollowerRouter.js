const router = require('express').Router();
const AgencyFollowerController = require('../controller/agencyFollowerController');
const authentication = require('../middleware/authentication');

// every route needs a logged-in user
router.use(authentication);

router.get('/', AgencyFollowerController.getAllAgencyFollowers);
router.get('/:id', AgencyFollowerController.getAgencyFollowerById);
router.post('/', AgencyFollowerController.createAgencyFollower);
router.put('/:id', AgencyFollowerController.updateAgencyFollower);
router.delete('/:id', AgencyFollowerController.deleteAgencyFollower);

module.exports = router;
