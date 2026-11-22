const router = require('express').Router();
const PlatformSettingController = require('../controller/platformSettingController');
const authentication = require('../middleware/authentication');
const authorization = require('../middleware/authorization');

// any logged-in user can read; only a Super Admin can change
router.use(authentication);

router.get('/', PlatformSettingController.getAllPlatformSettings);
router.get('/:id', PlatformSettingController.getPlatformSettingById);
router.post('/', authorization('Super Admin'), PlatformSettingController.createPlatformSetting);
router.put('/:id', authorization('Super Admin'), PlatformSettingController.updatePlatformSetting);
router.delete('/:id', authorization('Super Admin'), PlatformSettingController.deletePlatformSetting);

module.exports = router;
