const router = require('express').Router();
const SessionFeedbackSummaryController = require('../controller/sessionFeedbackSummaryController');
const authentication = require('../middleware/authentication');

// every route needs a logged-in user
router.use(authentication);

router.get('/', SessionFeedbackSummaryController.getAllSessionFeedbackSummaries);
router.get('/:id', SessionFeedbackSummaryController.getSessionFeedbackSummaryById);
router.post('/', SessionFeedbackSummaryController.createSessionFeedbackSummary);
router.put('/:id', SessionFeedbackSummaryController.updateSessionFeedbackSummary);
router.delete('/:id', SessionFeedbackSummaryController.deleteSessionFeedbackSummary);

module.exports = router;
