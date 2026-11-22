const router = require('express').Router();
const FundingSourceController = require('../controller/fundingSourceController');
const authentication = require('../middleware/authentication');

// every route needs a logged-in user
router.use(authentication);

router.get('/', FundingSourceController.getAllFundingSources);
router.get('/:id', FundingSourceController.getFundingSourceById);
router.post('/', FundingSourceController.createFundingSource);
router.put('/:id', FundingSourceController.updateFundingSource);
router.delete('/:id', FundingSourceController.deleteFundingSource);

module.exports = router;
