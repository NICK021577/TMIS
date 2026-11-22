const router = require('express').Router();
const AnnualBudgetController = require('../controller/annualBudgetController');
const authentication = require('../middleware/authentication');

// every route needs a logged-in user
router.use(authentication);

router.get('/', AnnualBudgetController.getAllAnnualBudgets);
router.get('/:id', AnnualBudgetController.getAnnualBudgetById);
router.post('/', AnnualBudgetController.createAnnualBudget);
router.put('/:id', AnnualBudgetController.updateAnnualBudget);
router.delete('/:id', AnnualBudgetController.deleteAnnualBudget);

module.exports = router;
