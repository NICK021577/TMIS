const router = require('express').Router();
const ActivityTypeController = require('../controller/activityTypeController');
const authentication = require('../middleware/authentication');

// every route needs a logged-in user
router.use(authentication);

router.get('/', ActivityTypeController.getAllActivityTypes);
router.get('/:id', ActivityTypeController.getActivityTypeById);
router.post('/', ActivityTypeController.createActivityType);
router.put('/:id', ActivityTypeController.updateActivityType);
router.delete('/:id', ActivityTypeController.deleteActivityType);

module.exports = router;
