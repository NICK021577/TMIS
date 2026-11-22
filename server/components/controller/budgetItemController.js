const BudgetItem = require('../models/budgetItemModel');
const { HTTP_STATUS } = require('../config/constants');
const { AppError } = require('../middleware/errorHandler');

const BudgetItemController = {

    getAllBudgetItems: async (request, response, next) => {
        try {
            const budgetItems = await BudgetItem.find();
            response.status(HTTP_STATUS.OK).json(budgetItems);
        } catch (error) {
            next(error);
        }
    },

    getBudgetItemById: async (request, response, next) => {
        try {
            const budgetItem = await BudgetItem.findById(request.params.id);
            if (!budgetItem) throw new AppError('Budget item not found', HTTP_STATUS.NOT_FOUND);
            response.status(HTTP_STATUS.OK).json(budgetItem);
        } catch (error) {
            next(error);
        }
    },

    createBudgetItem: async (request, response, next) => {
        try {
            const budgetItem = await BudgetItem.create({ ...request.body, created_by: request.user.id });
            response.status(HTTP_STATUS.CREATED).json(budgetItem);
        } catch (error) {
            next(error);
        }
    },

    updateBudgetItem: async (request, response, next) => {
        try {
            const { created_by: _ignored, ...changes } = request.body || {};
            const budgetItem = await BudgetItem.findByIdAndUpdate(request.params.id, { ...changes, updated_by: request.user.id });
            if (!budgetItem) throw new AppError('Budget item not found', HTTP_STATUS.NOT_FOUND);
            response.status(HTTP_STATUS.OK).json(budgetItem);
        } catch (error) {
            next(error);
        }
    },

    deleteBudgetItem: async (request, response, next) => {
        try {
            const budgetItem = await BudgetItem.findByIdAndDelete(request.params.id);
            if (!budgetItem) throw new AppError('Budget item not found', HTTP_STATUS.NOT_FOUND);
            response.status(HTTP_STATUS.OK).json(budgetItem);
        } catch (error) {
            next(error);
        }
    },
}

module.exports = BudgetItemController;
