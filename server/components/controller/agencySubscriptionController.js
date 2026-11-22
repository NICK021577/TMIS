const AgencySubscription = require('../models/agencySubscriptionModel');
const { HTTP_STATUS } = require('../config/constants');
const { AppError } = require('../middleware/errorHandler');

const AgencySubscriptionController = {

    getAllAgencySubscriptions: async (request, response, next) => {
        try {
            const agencySubscriptions = await AgencySubscription.find();
            response.status(HTTP_STATUS.OK).json(agencySubscriptions);
        } catch (error) {
            next(error);
        }
    },

    getAgencySubscriptionById: async (request, response, next) => {
        try {
            const agencySubscription = await AgencySubscription.findById(request.params.id);
            if (!agencySubscription) throw new AppError('Agency subscription not found', HTTP_STATUS.NOT_FOUND);
            response.status(HTTP_STATUS.OK).json(agencySubscription);
        } catch (error) {
            next(error);
        }
    },

    createAgencySubscription: async (request, response, next) => {
        try {
            const agencySubscription = await AgencySubscription.create({ ...request.body, created_by: request.user.id });
            response.status(HTTP_STATUS.CREATED).json(agencySubscription);
        } catch (error) {
            next(error);
        }
    },

    updateAgencySubscription: async (request, response, next) => {
        try {
            const { created_by: _ignored, ...changes } = request.body || {};
            const agencySubscription = await AgencySubscription.findByIdAndUpdate(request.params.id, { ...changes, updated_by: request.user.id });
            if (!agencySubscription) throw new AppError('Agency subscription not found', HTTP_STATUS.NOT_FOUND);
            response.status(HTTP_STATUS.OK).json(agencySubscription);
        } catch (error) {
            next(error);
        }
    },

    deleteAgencySubscription: async (request, response, next) => {
        try {
            const agencySubscription = await AgencySubscription.findByIdAndDelete(request.params.id);
            if (!agencySubscription) throw new AppError('Agency subscription not found', HTTP_STATUS.NOT_FOUND);
            response.status(HTTP_STATUS.OK).json(agencySubscription);
        } catch (error) {
            next(error);
        }
    },
}

module.exports = AgencySubscriptionController;
