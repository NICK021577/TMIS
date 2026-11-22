const router = require('express').Router();
const RegistrationController = require('../controller/registrationController');
const authentication = require('../middleware/authentication');

// every route needs a logged-in user
router.use(authentication);

router.get('/', RegistrationController.getAllRegistrations);
router.get('/:id', RegistrationController.getRegistrationById);
router.post('/', RegistrationController.createRegistration);
router.put('/:id', RegistrationController.updateRegistration);
router.delete('/:id', RegistrationController.deleteRegistration);

module.exports = router;
