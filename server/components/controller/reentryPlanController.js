const ReentryPlan = require('../models/reentryPlanModel');
const { HTTP_STATUS } = require('../config/constants');
const { AppError } = require('../middleware/errorHandler');

const ReentryPlanController = {

    getAllReentryPlans: async (request, response, next) => {
        try {
            const reentryPlans = await ReentryPlan.find();
            response.status(HTTP_STATUS.OK).json(reentryPlans);
        } catch (error) {
            next(error);
        }
    },

    getReentryPlanById: async (request, response, next) => {
        try {
            const reentryPlan = await ReentryPlan.findById(request.params.id);
            if (!reentryPlan) throw new AppError('Reentry plan not found', HTTP_STATUS.NOT_FOUND);
            response.status(HTTP_STATUS.OK).json(reentryPlan);
        } catch (error) {
            next(error);
        }
    },

    createReentryPlan: async (request, response, next) => {
        try {
            const reentryPlan = await ReentryPlan.create(request.body || {});
            response.status(HTTP_STATUS.CREATED).json(reentryPlan);
        } catch (error) {
            next(error);
        }
    },

    updateReentryPlan: async (request, response, next) => {
        try {
            const reentryPlan = await ReentryPlan.findByIdAndUpdate(request.params.id, request.body || {});
            if (!reentryPlan) throw new AppError('Reentry plan not found', HTTP_STATUS.NOT_FOUND);
            response.status(HTTP_STATUS.OK).json(reentryPlan);
        } catch (error) {
            next(error);
        }
    },

    deleteReentryPlan: async (request, response, next) => {
        try {
            const reentryPlan = await ReentryPlan.findByIdAndDelete(request.params.id);
            if (!reentryPlan) throw new AppError('Reentry plan not found', HTTP_STATUS.NOT_FOUND);
            response.status(HTTP_STATUS.OK).json(reentryPlan);
        } catch (error) {
            next(error);
        }
    },
}

module.exports = ReentryPlanController;
