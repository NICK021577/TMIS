const router = require('express').Router();
const ReentryPlanController = require('../controller/reentryPlanController');
const authentication = require('../middleware/authentication');

// every route needs a logged-in user
router.use(authentication);

router.get('/', ReentryPlanController.getAllReentryPlans);
router.get('/:id', ReentryPlanController.getReentryPlanById);
router.post('/', ReentryPlanController.createReentryPlan);
router.put('/:id', ReentryPlanController.updateReentryPlan);
router.delete('/:id', ReentryPlanController.deleteReentryPlan);

module.exports = router;
