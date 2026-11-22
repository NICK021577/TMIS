const AnnualBudget = require('../models/annualBudgetModel');
const { HTTP_STATUS } = require('../config/constants');
const { AppError } = require('../middleware/errorHandler');

const AnnualBudgetController = {

    getAllAnnualBudgets: async (request, response, next) => {
        try {
            const annualBudgets = await AnnualBudget.find();
            response.status(HTTP_STATUS.OK).json(annualBudgets);
        } catch (error) {
            next(error);
        }
    },

    getAnnualBudgetById: async (request, response, next) => {
        try {
            const annualBudget = await AnnualBudget.findById(request.params.id);
            if (!annualBudget) throw new AppError('Annual budget not found', HTTP_STATUS.NOT_FOUND);
            response.status(HTTP_STATUS.OK).json(annualBudget);
        } catch (error) {
            next(error);
        }
    },

    createAnnualBudget: async (request, response, next) => {
        try {
            const annualBudget = await AnnualBudget.create({ ...request.body, created_by: request.user.id });
            response.status(HTTP_STATUS.CREATED).json(annualBudget);
        } catch (error) {
            next(error);
        }
    },

    updateAnnualBudget: async (request, response, next) => {
        try {
            const { created_by: _ignored, ...changes } = request.body || {};
            const annualBudget = await AnnualBudget.findByIdAndUpdate(request.params.id, { ...changes, updated_by: request.user.id });
            if (!annualBudget) throw new AppError('Annual budget not found', HTTP_STATUS.NOT_FOUND);
            response.status(HTTP_STATUS.OK).json(annualBudget);
        } catch (error) {
            next(error);
        }
    },

    deleteAnnualBudget: async (request, response, next) => {
        try {
            const annualBudget = await AnnualBudget.findByIdAndDelete(request.params.id);
            if (!annualBudget) throw new AppError('Annual budget not found', HTTP_STATUS.NOT_FOUND);
            response.status(HTTP_STATUS.OK).json(annualBudget);
        } catch (error) {
            next(error);
        }
    },
}

module.exports = AnnualBudgetController;
