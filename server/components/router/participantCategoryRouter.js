const router = require('express').Router();
const ParticipantCategoryController = require('../controller/participantCategoryController');
const authentication = require('../middleware/authentication');

// every route needs a logged-in user
router.use(authentication);

router.get('/', ParticipantCategoryController.getAllParticipantCategories);
router.get('/:id', ParticipantCategoryController.getParticipantCategoryById);
router.post('/', ParticipantCategoryController.createParticipantCategory);
router.put('/:id', ParticipantCategoryController.updateParticipantCategory);
router.delete('/:id', ParticipantCategoryController.deleteParticipantCategory);

module.exports = router;
