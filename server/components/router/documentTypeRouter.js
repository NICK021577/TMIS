const router = require('express').Router();
const DocumentTypeController = require('../controller/documentTypeController');
const authentication = require('../middleware/authentication');

// every route needs a logged-in user
router.use(authentication);

router.get('/', DocumentTypeController.getAllDocumentTypes);
router.get('/:id', DocumentTypeController.getDocumentTypeById);
router.post('/', DocumentTypeController.createDocumentType);
router.put('/:id', DocumentTypeController.updateDocumentType);
router.delete('/:id', DocumentTypeController.deleteDocumentType);

module.exports = router;
