const router = require('express').Router();
const DocumentController = require('../controller/documentController');
const authentication = require('../middleware/authentication');

// every route needs a logged-in user
router.use(authentication);

router.get('/', DocumentController.getAllDocuments);
router.get('/:id', DocumentController.getDocumentById);
router.post('/', DocumentController.createDocument);
router.put('/:id', DocumentController.updateDocument);
router.delete('/:id', DocumentController.deleteDocument);

module.exports = router;
