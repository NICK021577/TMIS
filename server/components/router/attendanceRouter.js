const router = require('express').Router();
const AttendanceController = require('../controller/attendanceController');
const authentication = require('../middleware/authentication');

// every route needs a logged-in user
router.use(authentication);

router.get('/', AttendanceController.getAllAttendance);
router.get('/:id', AttendanceController.getAttendanceById);
router.post('/', AttendanceController.createAttendance);
router.put('/:id', AttendanceController.updateAttendance);
router.delete('/:id', AttendanceController.deleteAttendance);

module.exports = router;
