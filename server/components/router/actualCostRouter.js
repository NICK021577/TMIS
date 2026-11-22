const router = require('express').Router();
const ActualCostController = require('../controller/actualCostController');
const authentication = require('../middleware/authentication');

// every route needs a logged-in user
router.use(authentication);

router.get('/', ActualCostController.getAllActualCosts);
router.get('/:id', ActualCostController.getActualCostById);
router.post('/', ActualCostController.createActualCost);
router.put('/:id', ActualCostController.updateActualCost);
router.delete('/:id', ActualCostController.deleteActualCost);

module.exports = router;
