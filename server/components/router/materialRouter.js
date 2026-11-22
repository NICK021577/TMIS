const router = require('express').Router();
const MaterialController = require('../controller/materialController');
const authentication = require('../middleware/authentication');

// every route needs a logged-in user
router.use(authentication);

router.get('/', MaterialController.getAllMaterials);
router.get('/:id', MaterialController.getMaterialById);
router.post('/', MaterialController.createMaterial);
router.put('/:id', MaterialController.updateMaterial);
router.delete('/:id', MaterialController.deleteMaterial);

module.exports = router;
