const ActivityObjective = require('../models/activityObjectiveModel');
const { HTTP_STATUS } = require('../config/constants');
const { AppError } = require('../middleware/errorHandler');

const ActivityObjectiveController = {

    getAllActivityObjectives: async (request, response, next) => {
        try {
            const activityObjectives = await ActivityObjective.find();
            response.status(HTTP_STATUS.OK).json(activityObjectives);
        } catch (error) {
            next(error);
        }
    },

    getActivityObjectiveById: async (request, response, next) => {
        try {
            const activityObjective = await ActivityObjective.findById(request.params.id);
            if (!activityObjective) throw new AppError('Activity objective not found', HTTP_STATUS.NOT_FOUND);
            response.status(HTTP_STATUS.OK).json(activityObjective);
        } catch (error) {
            next(error);
        }
    },

    createActivityObjective: async (request, response, next) => {
        try {
            const activityObjective = await ActivityObjective.create({ ...request.body, created_by: request.user.id });
            response.status(HTTP_STATUS.CREATED).json(activityObjective);
        } catch (error) {
            next(error);
        }
    },

    updateActivityObjective: async (request, response, next) => {
        try {
            const { created_by: _ignored, ...changes } = request.body || {};
            const activityObjective = await ActivityObjective.findByIdAndUpdate(request.params.id, { ...changes, updated_by: request.user.id });
            if (!activityObjective) throw new AppError('Activity objective not found', HTTP_STATUS.NOT_FOUND);
            response.status(HTTP_STATUS.OK).json(activityObjective);
        } catch (error) {
            next(error);
        }
    },

    deleteActivityObjective: async (request, response, next) => {
        try {
            const activityObjective = await ActivityObjective.findByIdAndDelete(request.params.id);
            if (!activityObjective) throw new AppError('Activity objective not found', HTTP_STATUS.NOT_FOUND);
            response.status(HTTP_STATUS.OK).json(activityObjective);
        } catch (error) {
            next(error);
        }
    },
}

module.exports = ActivityObjectiveController;
