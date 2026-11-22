const BudgetCategory = require('../models/budgetCategoryModel');
const { HTTP_STATUS } = require('../config/constants');
const { AppError } = require('../middleware/errorHandler');

const BudgetCategoryController = {

    getAllBudgetCategories: async (request, response, next) => {
        try {
            const budgetCategories = await BudgetCategory.find();
            response.status(HTTP_STATUS.OK).json(budgetCategories);
        } catch (error) {
            next(error);
        }
    },

    getBudgetCategoryById: async (request, response, next) => {
        try {
            const budgetCategory = await BudgetCategory.findById(request.params.id);
            if (!budgetCategory) throw new AppError('Budget category not found', HTTP_STATUS.NOT_FOUND);
            response.status(HTTP_STATUS.OK).json(budgetCategory);
        } catch (error) {
            next(error);
        }
    },

    createBudgetCategory: async (request, response, next) => {
        try {
            const budgetCategory = await BudgetCategory.create({ ...request.body, created_by: request.user.id });
            response.status(HTTP_STATUS.CREATED).json(budgetCategory);
        } catch (error) {
            next(error);
        }
    },

    updateBudgetCategory: async (request, response, next) => {
        try {
            const { created_by: _ignored, ...changes } = request.body || {};
            const budgetCategory = await BudgetCategory.findByIdAndUpdate(request.params.id, { ...changes, updated_by: request.user.id });
            if (!budgetCategory) throw new AppError('Budget category not found', HTTP_STATUS.NOT_FOUND);
            response.status(HTTP_STATUS.OK).json(budgetCategory);
        } catch (error) {
            next(error);
        }
    },

    deleteBudgetCategory: async (request, response, next) => {
        try {
            const budgetCategory = await BudgetCategory.findByIdAndDelete(request.params.id);
            if (!budgetCategory) throw new AppError('Budget category not found', HTTP_STATUS.NOT_FOUND);
            response.status(HTTP_STATUS.OK).json(budgetCategory);
        } catch (error) {
            next(error);
        }
    },
}

module.exports = BudgetCategoryController;
