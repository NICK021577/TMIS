const SessionFeedbackSummary = require('../models/sessionFeedbackSummaryModel');
const { HTTP_STATUS } = require('../config/constants');
const { AppError } = require('../middleware/errorHandler');

const SessionFeedbackSummaryController = {

    getAllSessionFeedbackSummaries: async (request, response, next) => {
        try {
            const sessionFeedbackSummaries = await SessionFeedbackSummary.find();
            response.status(HTTP_STATUS.OK).json(sessionFeedbackSummaries);
        } catch (error) {
            next(error);
        }
    },

    getSessionFeedbackSummaryById: async (request, response, next) => {
        try {
            const sessionFeedbackSummary = await SessionFeedbackSummary.findById(request.params.id);
            if (!sessionFeedbackSummary) throw new AppError('Session feedback summary not found', HTTP_STATUS.NOT_FOUND);
            response.status(HTTP_STATUS.OK).json(sessionFeedbackSummary);
        } catch (error) {
            next(error);
        }
    },

    createSessionFeedbackSummary: async (request, response, next) => {
        try {
            const sessionFeedbackSummary = await SessionFeedbackSummary.create(request.body || {});
            response.status(HTTP_STATUS.CREATED).json(sessionFeedbackSummary);
        } catch (error) {
            next(error);
        }
    },

    updateSessionFeedbackSummary: async (request, response, next) => {
        try {
            const sessionFeedbackSummary = await SessionFeedbackSummary.findByIdAndUpdate(request.params.id, request.body || {});
            if (!sessionFeedbackSummary) throw new AppError('Session feedback summary not found', HTTP_STATUS.NOT_FOUND);
            response.status(HTTP_STATUS.OK).json(sessionFeedbackSummary);
        } catch (error) {
            next(error);
        }
    },

    deleteSessionFeedbackSummary: async (request, response, next) => {
        try {
            const sessionFeedbackSummary = await SessionFeedbackSummary.findByIdAndDelete(request.params.id);
            if (!sessionFeedbackSummary) throw new AppError('Session feedback summary not found', HTTP_STATUS.NOT_FOUND);
            response.status(HTTP_STATUS.OK).json(sessionFeedbackSummary);
        } catch (error) {
            next(error);
        }
    },
}

module.exports = SessionFeedbackSummaryController;
