const router = require('express').Router();
const ParticipantProfileController = require('../controller/participantProfileController');
const authentication = require('../middleware/authentication');

// every route needs a logged-in user
router.use(authentication);

router.get('/', ParticipantProfileController.getAllParticipantProfiles);
router.get('/:id', ParticipantProfileController.getParticipantProfileById);
router.post('/', ParticipantProfileController.createParticipantProfile);
router.put('/:id', ParticipantProfileController.updateParticipantProfile);
router.delete('/:id', ParticipantProfileController.deleteParticipantProfile);

module.exports = router;
