const Activity = require('../models/activityModel');
const { HTTP_STATUS } = require('../config/constants');
const { AppError } = require('../middleware/errorHandler');

const ActivityController = {

    getAllActivities: async (request, response, next) => {
        try {
            const activities = await Activity.find();
            response.status(HTTP_STATUS.OK).json(activities);
        } catch (error) {
            next(error);
        }
    },

    getActivityById: async (request, response, next) => {
        try {
            const activity = await Activity.findById(request.params.id);
            if (!activity) throw new AppError('Activity not found', HTTP_STATUS.NOT_FOUND);
            response.status(HTTP_STATUS.OK).json(activity);
        } catch (error) {
            next(error);
        }
    },

    createActivity: async (request, response, next) => {
        try {
            const activity = await Activity.create({ ...request.body, created_by: request.user.id });
            response.status(HTTP_STATUS.CREATED).json(activity);
        } catch (error) {
            next(error);
        }
    },

    updateActivity: async (request, response, next) => {
        try {
            const { created_by: _ignored, ...changes } = request.body || {};
            const activity = await Activity.findByIdAndUpdate(request.params.id, { ...changes, updated_by: request.user.id });
            if (!activity) throw new AppError('Activity not found', HTTP_STATUS.NOT_FOUND);
            response.status(HTTP_STATUS.OK).json(activity);
        } catch (error) {
            next(error);
        }
    },

    deleteActivity: async (request, response, next) => {
        try {
            const activity = await Activity.findByIdAndDelete(request.params.id);
            if (!activity) throw new AppError('Activity not found', HTTP_STATUS.NOT_FOUND);
            response.status(HTTP_STATUS.OK).json(activity);
        } catch (error) {
            next(error);
        }
    },
}

module.exports = ActivityController;
