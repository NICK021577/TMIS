const router = require('express').Router();
const BudgetCategoryController = require('../controller/budgetCategoryController');
const authentication = require('../middleware/authentication');

// every route needs a logged-in user
router.use(authentication);

router.get('/', BudgetCategoryController.getAllBudgetCategories);
router.get('/:id', BudgetCategoryController.getBudgetCategoryById);
router.post('/', BudgetCategoryController.createBudgetCategory);
router.put('/:id', BudgetCategoryController.updateBudgetCategory);
router.delete('/:id', BudgetCategoryController.deleteBudgetCategory);

module.exports = router;
