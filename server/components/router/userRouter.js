const router = require('express').Router();
const UserController = require('../controller/userController');
const authentication = require('../middleware/authentication');
const authorization = require('../middleware/authorization');

// public
router.post('/register', UserController.registerUser);
router.post('/login', UserController.loginUser);
router.post('/logout', UserController.logoutUser);

// logged-in users (keep these above '/:id')
router.get('/me', authentication, UserController.getSession);
router.post('/change-password', authentication, UserController.changePassword);
router.get('/:id', authentication, UserController.getUserById);

// Super Admin only
router.get('/', authentication, authorization('Super Admin'), UserController.getAllUsers);
router.delete('/:id', authentication, authorization('Super Admin'), UserController.deleteUser);

module.exports = router;
