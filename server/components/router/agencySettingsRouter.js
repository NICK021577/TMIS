const router = require('express').Router();
const AgencySettingsController = require('../controller/agencySettingsController');
const authentication = require('../middleware/authentication');
const agencyAdmin = require('../middleware/agencyAdmin');

// Agency settings of the signed-in administrator's own agency (Settings -> Agency users, Roles & permissions)
router.use(authentication, agencyAdmin);

// roles
router.get('/roles', AgencySettingsController.getRoles);
router.post('/roles', AgencySettingsController.createRole);
router.patch('/roles/:id', AgencySettingsController.updateRoleAccess);
router.put('/roles/:id/menus', AgencySettingsController.setRoleMenus);

// users
router.get('/users', AgencySettingsController.getUsers);
router.post('/users', AgencySettingsController.addUser);
router.patch('/users/:id', AgencySettingsController.updateUser);
router.put('/users/:id/menus', AgencySettingsController.setUserMenus);

module.exports = router;
