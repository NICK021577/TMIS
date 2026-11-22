const router = require('express').Router();
const OutputSubmissionController = require('../controller/outputSubmissionController');
const authentication = require('../middleware/authentication');

// every route needs a logged-in user
router.use(authentication);

router.get('/', OutputSubmissionController.getAllOutputSubmissions);
router.get('/:id', OutputSubmissionController.getOutputSubmissionById);
router.post('/', OutputSubmissionController.createOutputSubmission);
router.put('/:id', OutputSubmissionController.updateOutputSubmission);
router.delete('/:id', OutputSubmissionController.deleteOutputSubmission);

module.exports = router;
