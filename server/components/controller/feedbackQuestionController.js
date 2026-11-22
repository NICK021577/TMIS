const FeedbackQuestion = require('../models/feedbackQuestionModel');
const { HTTP_STATUS } = require('../config/constants');
const { AppError } = require('../middleware/errorHandler');

const FeedbackQuestionController = {

    getAllFeedbackQuestions: async (request, response, next) => {
        try {
            const feedbackQuestions = await FeedbackQuestion.find();
            response.status(HTTP_STATUS.OK).json(feedbackQuestions);
        } catch (error) {
            next(error);
        }
    },

    getFeedbackQuestionById: async (request, response, next) => {
        try {
            const feedbackQuestion = await FeedbackQuestion.findById(request.params.id);
            if (!feedbackQuestion) throw new AppError('Feedback question not found', HTTP_STATUS.NOT_FOUND);
            response.status(HTTP_STATUS.OK).json(feedbackQuestion);
        } catch (error) {
            next(error);
        }
    },

    createFeedbackQuestion: async (request, response, next) => {
        try {
            const feedbackQuestion = await FeedbackQuestion.create({ ...request.body, created_by: request.user.id });
            response.status(HTTP_STATUS.CREATED).json(feedbackQuestion);
        } catch (error) {
            next(error);
        }
    },

    updateFeedbackQuestion: async (request, response, next) => {
        try {
            const { created_by: _ignored, ...changes } = request.body || {};
            const feedbackQuestion = await FeedbackQuestion.findByIdAndUpdate(request.params.id, { ...changes, updated_by: request.user.id });
            if (!feedbackQuestion) throw new AppError('Feedback question not found', HTTP_STATUS.NOT_FOUND);
            response.status(HTTP_STATUS.OK).json(feedbackQuestion);
        } catch (error) {
            next(error);
        }
    },

    deleteFeedbackQuestion: async (request, response, next) => {
        try {
            const feedbackQuestion = await FeedbackQuestion.findByIdAndDelete(request.params.id);
            if (!feedbackQuestion) throw new AppError('Feedback question not found', HTTP_STATUS.NOT_FOUND);
            response.status(HTTP_STATUS.OK).json(feedbackQuestion);
        } catch (error) {
            next(error);
        }
    },
}

module.exports = FeedbackQuestionController;
