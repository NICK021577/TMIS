const ActualCost = require('../models/actualCostModel');
const { HTTP_STATUS } = require('../config/constants');
const { AppError } = require('../middleware/errorHandler');

const ActualCostController = {

    getAllActualCosts: async (request, response, next) => {
        try {
            const actualCosts = await ActualCost.find();
            response.status(HTTP_STATUS.OK).json(actualCosts);
        } catch (error) {
            next(error);
        }
    },

    getActualCostById: async (request, response, next) => {
        try {
            const actualCost = await ActualCost.findById(request.params.id);
            if (!actualCost) throw new AppError('Actual cost not found', HTTP_STATUS.NOT_FOUND);
            response.status(HTTP_STATUS.OK).json(actualCost);
        } catch (error) {
            next(error);
        }
    },

    createActualCost: async (request, response, next) => {
        try {
            const actualCost = await ActualCost.create(request.body || {});
            response.status(HTTP_STATUS.CREATED).json(actualCost);
        } catch (error) {
            next(error);
        }
    },

    updateActualCost: async (request, response, next) => {
        try {
            const actualCost = await ActualCost.findByIdAndUpdate(request.params.id, request.body || {});
            if (!actualCost) throw new AppError('Actual cost not found', HTTP_STATUS.NOT_FOUND);
            response.status(HTTP_STATUS.OK).json(actualCost);
        } catch (error) {
            next(error);
        }
    },

    deleteActualCost: async (request, response, next) => {
        try {
            const actualCost = await ActualCost.findByIdAndDelete(request.params.id);
            if (!actualCost) throw new AppError('Actual cost not found', HTTP_STATUS.NOT_FOUND);
            response.status(HTTP_STATUS.OK).json(actualCost);
        } catch (error) {
            next(error);
        }
    },
}

module.exports = ActualCostController;
