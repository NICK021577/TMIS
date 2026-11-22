const router = require('express').Router();
const ActivityController = require('../controller/activityController');
const authentication = require('../middleware/authentication');

// every route needs a logged-in user
router.use(authentication);

router.get('/', ActivityController.getAllActivities);
router.get('/:id', ActivityController.getActivityById);
router.post('/', ActivityController.createActivity);
router.put('/:id', ActivityController.updateActivity);
router.delete('/:id', ActivityController.deleteActivity);

module.exports = router;
