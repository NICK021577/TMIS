const router = require('express').Router();
const ActivityOutcomeController = require('../controller/activityOutcomeController');
const authentication = require('../middleware/authentication');

// every route needs a logged-in user
router.use(authentication);

router.get('/', ActivityOutcomeController.getAllActivityOutcomes);
router.get('/:id', ActivityOutcomeController.getActivityOutcomeById);
router.post('/', ActivityOutcomeController.createActivityOutcome);
router.put('/:id', ActivityOutcomeController.updateActivityOutcome);
router.delete('/:id', ActivityOutcomeController.deleteActivityOutcome);

module.exports = router;
