const router = require('express').Router();
const SessionController = require('../controller/sessionController');
const authentication = require('../middleware/authentication');

// every route needs a logged-in user
router.use(authentication);

router.get('/', SessionController.getAllSessions);
router.get('/:id', SessionController.getSessionById);
router.post('/', SessionController.createSession);
router.put('/:id', SessionController.updateSession);
router.delete('/:id', SessionController.deleteSession);

module.exports = router;
