const router = require('express').Router();
const RoleMenuController = require('../controller/roleMenuController');
const authentication = require('../middleware/authentication');

// every route needs a logged-in user
router.use(authentication);

router.get('/', RoleMenuController.getAllRoleMenus);
router.get('/:id', RoleMenuController.getRoleMenuById);
router.post('/', RoleMenuController.createRoleMenu);
router.put('/:id', RoleMenuController.updateRoleMenu);
router.delete('/:id', RoleMenuController.deleteRoleMenu);

module.exports = router;
