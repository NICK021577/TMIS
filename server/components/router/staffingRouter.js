const router = require('express').Router();
const StaffingController = require('../controller/staffingController');
const authentication = require('../middleware/authentication');

// every route needs a logged-in user
router.use(authentication);

router.get('/', StaffingController.getAllStaffing);
router.get('/:id', StaffingController.getStaffingById);
router.post('/', StaffingController.createStaffing);
router.put('/:id', StaffingController.updateStaffing);
router.delete('/:id', StaffingController.deleteStaffing);

module.exports = router;
