const router = require('express').Router();
const SubscriptionPlanController = require('../controller/subscriptionPlanController');
const authentication = require('../middleware/authentication');
const authorization = require('../middleware/authorization');

// any logged-in user can read; only a Super Admin can change
router.use(authentication);

router.get('/', SubscriptionPlanController.getAllSubscriptionPlans);
router.get('/:id', SubscriptionPlanController.getSubscriptionPlanById);
router.post('/', authorization('Super Admin'), SubscriptionPlanController.createSubscriptionPlan);
router.put('/:id', authorization('Super Admin'), SubscriptionPlanController.updateSubscriptionPlan);
router.delete('/:id', authorization('Super Admin'), SubscriptionPlanController.deleteSubscriptionPlan);

module.exports = router;
