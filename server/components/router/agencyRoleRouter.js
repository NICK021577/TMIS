const router = require('express').Router();
const AgencyRoleController = require('../controller/agencyRoleController');
const authentication = require('../middleware/authentication');

// every route needs a logged-in user
router.use(authentication);

router.get('/', AgencyRoleController.getAllAgencyRoles);
router.get('/:id', AgencyRoleController.getAgencyRoleById);
router.post('/', AgencyRoleController.createAgencyRole);
router.put('/:id', AgencyRoleController.updateAgencyRole);
router.delete('/:id', AgencyRoleController.deleteAgencyRole);

module.exports = router;
