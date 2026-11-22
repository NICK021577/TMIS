const ActivityFeedbackSummary = require('../models/activityFeedbackSummaryModel');
const { HTTP_STATUS } = require('../config/constants');
const { AppError } = require('../middleware/errorHandler');

const ActivityFeedbackSummaryController = {

    getAllActivityFeedbackSummaries: async (request, response, next) => {
        try {
            const activityFeedbackSummaries = await ActivityFeedbackSummary.find();
            response.status(HTTP_STATUS.OK).json(activityFeedbackSummaries);
        } catch (error) {
            next(error);
        }
    },

    getActivityFeedbackSummaryById: async (request, response, next) => {
        try {
            const activityFeedbackSummary = await ActivityFeedbackSummary.findById(request.params.id);
            if (!activityFeedbackSummary) throw new AppError('Activity feedback summary not found', HTTP_STATUS.NOT_FOUND);
            response.status(HTTP_STATUS.OK).json(activityFeedbackSummary);
        } catch (error) {
            next(error);
        }
    },

    createActivityFeedbackSummary: async (request, response, next) => {
        try {
            const activityFeedbackSummary = await ActivityFeedbackSummary.create(request.body || {});
            response.status(HTTP_STATUS.CREATED).json(activityFeedbackSummary);
        } catch (error) {
            next(error);
        }
    },

    updateActivityFeedbackSummary: async (request, response, next) => {
        try {
            const activityFeedbackSummary = await ActivityFeedbackSummary.findByIdAndUpdate(request.params.id, request.body || {});
            if (!activityFeedbackSummary) throw new AppError('Activity feedback summary not found', HTTP_STATUS.NOT_FOUND);
            response.status(HTTP_STATUS.OK).json(activityFeedbackSummary);
        } catch (error) {
            next(error);
        }
    },

    deleteActivityFeedbackSummary: async (request, response, next) => {
        try {
            const activityFeedbackSummary = await ActivityFeedbackSummary.findByIdAndDelete(request.params.id);
            if (!activityFeedbackSummary) throw new AppError('Activity feedback summary not found', HTTP_STATUS.NOT_FOUND);
            response.status(HTTP_STATUS.OK).json(activityFeedbackSummary);
        } catch (error) {
            next(error);
        }
    },
}

module.exports = ActivityFeedbackSummaryController;
