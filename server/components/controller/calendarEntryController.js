const CalendarEntry = require('../models/calendarEntryModel');
const { HTTP_STATUS } = require('../config/constants');
const { AppError } = require('../middleware/errorHandler');

const CalendarEntryController = {

    getAllCalendarEntries: async (request, response, next) => {
        try {
            const calendarEntries = await CalendarEntry.find();
            response.status(HTTP_STATUS.OK).json(calendarEntries);
        } catch (error) {
            next(error);
        }
    },

    getCalendarEntryById: async (request, response, next) => {
        try {
            const calendarEntry = await CalendarEntry.findById(request.params.id);
            if (!calendarEntry) throw new AppError('Calendar entry not found', HTTP_STATUS.NOT_FOUND);
            response.status(HTTP_STATUS.OK).json(calendarEntry);
        } catch (error) {
            next(error);
        }
    },

    createCalendarEntry: async (request, response, next) => {
        try {
            const calendarEntry = await CalendarEntry.create({ ...request.body, created_by: request.user.id });
            response.status(HTTP_STATUS.CREATED).json(calendarEntry);
        } catch (error) {
            next(error);
        }
    },

    updateCalendarEntry: async (request, response, next) => {
        try {
            const { created_by: _ignored, ...changes } = request.body || {};
            const calendarEntry = await CalendarEntry.findByIdAndUpdate(request.params.id, { ...changes, updated_by: request.user.id });
            if (!calendarEntry) throw new AppError('Calendar entry not found', HTTP_STATUS.NOT_FOUND);
            response.status(HTTP_STATUS.OK).json(calendarEntry);
        } catch (error) {
            next(error);
        }
    },

    deleteCalendarEntry: async (request, response, next) => {
        try {
            const calendarEntry = await CalendarEntry.findByIdAndDelete(request.params.id);
            if (!calendarEntry) throw new AppError('Calendar entry not found', HTTP_STATUS.NOT_FOUND);
            response.status(HTTP_STATUS.OK).json(calendarEntry);
        } catch (error) {
            next(error);
        }
    },
}

module.exports = CalendarEntryController;
