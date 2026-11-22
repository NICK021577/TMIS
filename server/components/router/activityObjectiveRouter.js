const router = require('express').Router();
const ActivityObjectiveController = require('../controller/activityObjectiveController');
const authentication = require('../middleware/authentication');

// every route needs a logged-in user
router.use(authentication);

router.get('/', ActivityObjectiveController.getAllActivityObjectives);
router.get('/:id', ActivityObjectiveController.getActivityObjectiveById);
router.post('/', ActivityObjectiveController.createActivityObjective);
router.put('/:id', ActivityObjectiveController.updateActivityObjective);
router.delete('/:id', ActivityObjectiveController.deleteActivityObjective);

module.exports = router;
