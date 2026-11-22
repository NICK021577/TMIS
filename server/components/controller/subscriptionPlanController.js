const SubscriptionPlan = require('../models/subscriptionPlanModel');
const { HTTP_STATUS } = require('../config/constants');
const { AppError } = require('../middleware/errorHandler');

const SubscriptionPlanController = {

    getAllSubscriptionPlans: async (request, response, next) => {
        try {
            const subscriptionPlans = await SubscriptionPlan.find();
            response.status(HTTP_STATUS.OK).json(subscriptionPlans);
        } catch (error) {
            next(error);
        }
    },

    getSubscriptionPlanById: async (request, response, next) => {
        try {
            const subscriptionPlan = await SubscriptionPlan.findById(request.params.id);
            if (!subscriptionPlan) throw new AppError('Subscription plan not found', HTTP_STATUS.NOT_FOUND);
            response.status(HTTP_STATUS.OK).json(subscriptionPlan);
        } catch (error) {
            next(error);
        }
    },

    createSubscriptionPlan: async (request, response, next) => {
        try {
            const subscriptionPlan = await SubscriptionPlan.create({ ...request.body, created_by: request.user.id });
            response.status(HTTP_STATUS.CREATED).json(subscriptionPlan);
        } catch (error) {
            next(error);
        }
    },

    updateSubscriptionPlan: async (request, response, next) => {
        try {
            const { created_by: _ignored, ...changes } = request.body || {};
            const subscriptionPlan = await SubscriptionPlan.findByIdAndUpdate(request.params.id, { ...changes, updated_by: request.user.id });
            if (!subscriptionPlan) throw new AppError('Subscription plan not found', HTTP_STATUS.NOT_FOUND);
            response.status(HTTP_STATUS.OK).json(subscriptionPlan);
        } catch (error) {
            next(error);
        }
    },

    deleteSubscriptionPlan: async (request, response, next) => {
        try {
            const subscriptionPlan = await SubscriptionPlan.findByIdAndDelete(request.params.id);
            if (!subscriptionPlan) throw new AppError('Subscription plan not found', HTTP_STATUS.NOT_FOUND);
            response.status(HTTP_STATUS.OK).json(subscriptionPlan);
        } catch (error) {
            next(error);
        }
    },
}

module.exports = SubscriptionPlanController;
