const router = require('express').Router();
const ActivityReportSectionController = require('../controller/activityReportSectionController');
const authentication = require('../middleware/authentication');

// every route needs a logged-in user
router.use(authentication);

router.get('/', ActivityReportSectionController.getAllActivityReportSections);
router.get('/:id', ActivityReportSectionController.getActivityReportSectionById);
router.post('/', ActivityReportSectionController.createActivityReportSection);
router.put('/:id', ActivityReportSectionController.updateActivityReportSection);
router.delete('/:id', ActivityReportSectionController.deleteActivityReportSection);

module.exports = router;
