const router = require('express').Router();
const ApplicationDocumentController = require('../controller/applicationDocumentController');
const authentication = require('../middleware/authentication');

// every route needs a logged-in user
router.use(authentication);

router.get('/', ApplicationDocumentController.getAllApplicationDocuments);
router.get('/:id', ApplicationDocumentController.getApplicationDocumentById);
router.post('/', ApplicationDocumentController.createApplicationDocument);
router.put('/:id', ApplicationDocumentController.updateApplicationDocument);
router.delete('/:id', ApplicationDocumentController.deleteApplicationDocument);

module.exports = router;
