const ActivityType = require('../models/activityTypeModel');
const { HTTP_STATUS } = require('../config/constants');
const { AppError } = require('../middleware/errorHandler');

const ActivityTypeController = {

    getAllActivityTypes: async (request, response, next) => {
        try {
            const activityTypes = await ActivityType.find();
            response.status(HTTP_STATUS.OK).json(activityTypes);
        } catch (error) {
            next(error);
        }
    },

    getActivityTypeById: async (request, response, next) => {
        try {
            const activityType = await ActivityType.findById(request.params.id);
            if (!activityType) throw new AppError('Activity type not found', HTTP_STATUS.NOT_FOUND);
            response.status(HTTP_STATUS.OK).json(activityType);
        } catch (error) {
            next(error);
        }
    },

    createActivityType: async (request, response, next) => {
        try {
            const activityType = await ActivityType.create({ ...request.body, created_by: request.user.id });
            response.status(HTTP_STATUS.CREATED).json(activityType);
        } catch (error) {
            next(error);
        }
    },

    updateActivityType: async (request, response, next) => {
        try {
            const { created_by: _ignored, ...changes } = request.body || {};
            const activityType = await ActivityType.findByIdAndUpdate(request.params.id, { ...changes, updated_by: request.user.id });
            if (!activityType) throw new AppError('Activity type not found', HTTP_STATUS.NOT_FOUND);
            response.status(HTTP_STATUS.OK).json(activityType);
        } catch (error) {
            next(error);
        }
    },

    deleteActivityType: async (request, response, next) => {
        try {
            const activityType = await ActivityType.findByIdAndDelete(request.params.id);
            if (!activityType) throw new AppError('Activity type not found', HTTP_STATUS.NOT_FOUND);
            response.status(HTTP_STATUS.OK).json(activityType);
        } catch (error) {
            next(error);
        }
    },
}

module.exports = ActivityTypeController;
