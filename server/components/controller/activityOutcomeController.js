const ActivityOutcome = require('../models/activityOutcomeModel');
const { HTTP_STATUS } = require('../config/constants');
const { AppError } = require('../middleware/errorHandler');

const ActivityOutcomeController = {

    getAllActivityOutcomes: async (request, response, next) => {
        try {
            const activityOutcomes = await ActivityOutcome.find();
            response.status(HTTP_STATUS.OK).json(activityOutcomes);
        } catch (error) {
            next(error);
        }
    },

    getActivityOutcomeById: async (request, response, next) => {
        try {
            const activityOutcome = await ActivityOutcome.findById(request.params.id);
            if (!activityOutcome) throw new AppError('Activity outcome not found', HTTP_STATUS.NOT_FOUND);
            response.status(HTTP_STATUS.OK).json(activityOutcome);
        } catch (error) {
            next(error);
        }
    },

    createActivityOutcome: async (request, response, next) => {
        try {
            const activityOutcome = await ActivityOutcome.create({ ...request.body, created_by: request.user.id });
            response.status(HTTP_STATUS.CREATED).json(activityOutcome);
        } catch (error) {
            next(error);
        }
    },

    updateActivityOutcome: async (request, response, next) => {
        try {
            const { created_by: _ignored, ...changes } = request.body || {};
            const activityOutcome = await ActivityOutcome.findByIdAndUpdate(request.params.id, { ...changes, updated_by: request.user.id });
            if (!activityOutcome) throw new AppError('Activity outcome not found', HTTP_STATUS.NOT_FOUND);
            response.status(HTTP_STATUS.OK).json(activityOutcome);
        } catch (error) {
            next(error);
        }
    },

    deleteActivityOutcome: async (request, response, next) => {
        try {
            const activityOutcome = await ActivityOutcome.findByIdAndDelete(request.params.id);
            if (!activityOutcome) throw new AppError('Activity outcome not found', HTTP_STATUS.NOT_FOUND);
            response.status(HTTP_STATUS.OK).json(activityOutcome);
        } catch (error) {
            next(error);
        }
    },
}

module.exports = ActivityOutcomeController;
