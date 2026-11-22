const router = require('express').Router();
const PlatformDefaultItemController = require('../controller/platformDefaultItemController');
const authentication = require('../middleware/authentication');
const authorization = require('../middleware/authorization');

// any logged-in user can read; only a Super Admin can change
router.use(authentication);

router.get('/', PlatformDefaultItemController.getAllPlatformDefaultItems);
router.get('/:id', PlatformDefaultItemController.getPlatformDefaultItemById);
router.post('/', authorization('Super Admin'), PlatformDefaultItemController.createPlatformDefaultItem);
router.put('/:id', authorization('Super Admin'), PlatformDefaultItemController.updatePlatformDefaultItem);
router.delete('/:id', authorization('Super Admin'), PlatformDefaultItemController.deletePlatformDefaultItem);

module.exports = router;
