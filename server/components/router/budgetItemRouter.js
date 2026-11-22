const router = require('express').Router();
const BudgetItemController = require('../controller/budgetItemController');
const authentication = require('../middleware/authentication');

// every route needs a logged-in user
router.use(authentication);

router.get('/', BudgetItemController.getAllBudgetItems);
router.get('/:id', BudgetItemController.getBudgetItemById);
router.post('/', BudgetItemController.createBudgetItem);
router.put('/:id', BudgetItemController.updateBudgetItem);
router.delete('/:id', BudgetItemController.deleteBudgetItem);

module.exports = router;
