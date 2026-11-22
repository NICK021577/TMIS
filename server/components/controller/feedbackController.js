const Feedback = require('../models/feedbackModel');
const { HTTP_STATUS } = require('../config/constants');
const { AppError } = require('../middleware/errorHandler');

const FeedbackController = {

    getAllFeedback: async (request, response, next) => {
        try {
            const feedbackList = await Feedback.find();
            response.status(HTTP_STATUS.OK).json(feedbackList);
        } catch (error) {
            next(error);
        }
    },

    getFeedbackById: async (request, response, next) => {
        try {
            const feedback = await Feedback.findById(request.params.id);
            if (!feedback) throw new AppError('Feedback not found', HTTP_STATUS.NOT_FOUND);
            response.status(HTTP_STATUS.OK).json(feedback);
        } catch (error) {
            next(error);
        }
    },

    createFeedback: async (request, response, next) => {
        try {
            const feedback = await Feedback.create(request.body || {});
            response.status(HTTP_STATUS.CREATED).json(feedback);
        } catch (error) {
            next(error);
        }
    },

    updateFeedback: async (request, response, next) => {
        try {
            const feedback = await Feedback.findByIdAndUpdate(request.params.id, request.body || {});
            if (!feedback) throw new AppError('Feedback not found', HTTP_STATUS.NOT_FOUND);
            response.status(HTTP_STATUS.OK).json(feedback);
        } catch (error) {
            next(error);
        }
    },

    deleteFeedback: async (request, response, next) => {
        try {
            const feedback = await Feedback.findByIdAndDelete(request.params.id);
            if (!feedback) throw new AppError('Feedback not found', HTTP_STATUS.NOT_FOUND);
            response.status(HTTP_STATUS.OK).json(feedback);
        } catch (error) {
            next(error);
        }
    },
}

module.exports = FeedbackController;
