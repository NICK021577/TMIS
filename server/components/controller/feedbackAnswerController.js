const FeedbackAnswer = require('../models/feedbackAnswerModel');
const { HTTP_STATUS } = require('../config/constants');
const { AppError } = require('../middleware/errorHandler');

const FeedbackAnswerController = {

    getAllFeedbackAnswers: async (request, response, next) => {
        try {
            const feedbackAnswers = await FeedbackAnswer.find();
            response.status(HTTP_STATUS.OK).json(feedbackAnswers);
        } catch (error) {
            next(error);
        }
    },

    getFeedbackAnswerById: async (request, response, next) => {
        try {
            const feedbackAnswer = await FeedbackAnswer.findById(request.params.id);
            if (!feedbackAnswer) throw new AppError('Feedback answer not found', HTTP_STATUS.NOT_FOUND);
            response.status(HTTP_STATUS.OK).json(feedbackAnswer);
        } catch (error) {
            next(error);
        }
    },

    createFeedbackAnswer: async (request, response, next) => {
        try {
            const feedbackAnswer = await FeedbackAnswer.create(request.body || {});
            response.status(HTTP_STATUS.CREATED).json(feedbackAnswer);
        } catch (error) {
            next(error);
        }
    },

    updateFeedbackAnswer: async (request, response, next) => {
        try {
            const feedbackAnswer = await FeedbackAnswer.findByIdAndUpdate(request.params.id, request.body || {});
            if (!feedbackAnswer) throw new AppError('Feedback answer not found', HTTP_STATUS.NOT_FOUND);
            response.status(HTTP_STATUS.OK).json(feedbackAnswer);
        } catch (error) {
            next(error);
        }
    },

    deleteFeedbackAnswer: async (request, response, next) => {
        try {
            const feedbackAnswer = await FeedbackAnswer.findByIdAndDelete(request.params.id);
            if (!feedbackAnswer) throw new AppError('Feedback answer not found', HTTP_STATUS.NOT_FOUND);
            response.status(HTTP_STATUS.OK).json(feedbackAnswer);
        } catch (error) {
            next(error);
        }
    },
}

module.exports = FeedbackAnswerController;
