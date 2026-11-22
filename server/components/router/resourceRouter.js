const router = require('express').Router();
const ResourceController = require('../controller/resourceController');
const authentication = require('../middleware/authentication');

// every route needs a logged-in user
router.use(authentication);

router.get('/', ResourceController.getAllResources);
router.get('/:id', ResourceController.getResourceById);
router.post('/', ResourceController.createResource);
router.put('/:id', ResourceController.updateResource);
router.delete('/:id', ResourceController.deleteResource);

module.exports = router;
