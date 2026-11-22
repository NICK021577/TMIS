const router = require('express').Router();
const FeedbackController = require('../controller/feedbackController');
const authentication = require('../middleware/authentication');

// every route needs a logged-in user
router.use(authentication);

router.get('/', FeedbackController.getAllFeedback);
router.get('/:id', FeedbackController.getFeedbackById);
router.post('/', FeedbackController.createFeedback);
router.put('/:id', FeedbackController.updateFeedback);
router.delete('/:id', FeedbackController.deleteFeedback);

module.exports = router;
