const router = require('express').Router();
const FeedbackQuestionController = require('../controller/feedbackQuestionController');
const authentication = require('../middleware/authentication');

// every route needs a logged-in user
router.use(authentication);

router.get('/', FeedbackQuestionController.getAllFeedbackQuestions);
router.get('/:id', FeedbackQuestionController.getFeedbackQuestionById);
router.post('/', FeedbackQuestionController.createFeedbackQuestion);
router.put('/:id', FeedbackQuestionController.updateFeedbackQuestion);
router.delete('/:id', FeedbackQuestionController.deleteFeedbackQuestion);

module.exports = router;
