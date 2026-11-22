const router = require('express').Router();
const ActivityReportController = require('../controller/activityReportController');
const authentication = require('../middleware/authentication');

// every route needs a logged-in user
router.use(authentication);

router.get('/', ActivityReportController.getAllActivityReports);
router.get('/:id', ActivityReportController.getActivityReportById);
router.post('/', ActivityReportController.createActivityReport);
router.put('/:id', ActivityReportController.updateActivityReport);
router.delete('/:id', ActivityReportController.deleteActivityReport);

module.exports = router;
