const router = require('express').Router();
const ActivityPartnerController = require('../controller/activityPartnerController');
const authentication = require('../middleware/authentication');

// every route needs a logged-in user
router.use(authentication);

router.get('/', ActivityPartnerController.getAllActivityPartners);
router.get('/:id', ActivityPartnerController.getActivityPartnerById);
router.post('/', ActivityPartnerController.createActivityPartner);
router.put('/:id', ActivityPartnerController.updateActivityPartner);
router.delete('/:id', ActivityPartnerController.deleteActivityPartner);

module.exports = router;
