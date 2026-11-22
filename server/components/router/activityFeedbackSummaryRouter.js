const router = require('express').Router();
const ActivityFeedbackSummaryController = require('../controller/activityFeedbackSummaryController');
const authentication = require('../middleware/authentication');

// every route needs a logged-in user
router.use(authentication);

router.get('/', ActivityFeedbackSummaryController.getAllActivityFeedbackSummaries);
router.get('/:id', ActivityFeedbackSummaryController.getActivityFeedbackSummaryById);
router.post('/', ActivityFeedbackSummaryController.createActivityFeedbackSummary);
router.put('/:id', ActivityFeedbackSummaryController.updateActivityFeedbackSummary);
router.delete('/:id', ActivityFeedbackSummaryController.deleteActivityFeedbackSummary);

module.exports = router;
