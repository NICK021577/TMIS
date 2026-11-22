const router = require('express').Router();
const CalendarEntryController = require('../controller/calendarEntryController');
const authentication = require('../middleware/authentication');

// every route needs a logged-in user
router.use(authentication);

router.get('/', CalendarEntryController.getAllCalendarEntries);
router.get('/:id', CalendarEntryController.getCalendarEntryById);
router.post('/', CalendarEntryController.createCalendarEntry);
router.put('/:id', CalendarEntryController.updateCalendarEntry);
router.delete('/:id', CalendarEntryController.deleteCalendarEntry);

module.exports = router;
