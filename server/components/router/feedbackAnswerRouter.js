const router = require('express').Router();
const FeedbackAnswerController = require('../controller/feedbackAnswerController');
const authentication = require('../middleware/authentication');

// every route needs a logged-in user
router.use(authentication);

router.get('/', FeedbackAnswerController.getAllFeedbackAnswers);
router.get('/:id', FeedbackAnswerController.getFeedbackAnswerById);
router.post('/', FeedbackAnswerController.createFeedbackAnswer);
router.put('/:id', FeedbackAnswerController.updateFeedbackAnswer);
router.delete('/:id', FeedbackAnswerController.deleteFeedbackAnswer);

module.exports = router;
