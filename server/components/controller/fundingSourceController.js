const FundingSource = require('../models/fundingSourceModel');
const { HTTP_STATUS } = require('../config/constants');
const { AppError } = require('../middleware/errorHandler');

const FundingSourceController = {

    getAllFundingSources: async (request, response, next) => {
        try {
            const fundingSources = await FundingSource.find();
            response.status(HTTP_STATUS.OK).json(fundingSources);
        } catch (error) {
            next(error);
        }
    },

    getFundingSourceById: async (request, response, next) => {
        try {
            const fundingSource = await FundingSource.findById(request.params.id);
            if (!fundingSource) throw new AppError('Funding source not found', HTTP_STATUS.NOT_FOUND);
            response.status(HTTP_STATUS.OK).json(fundingSource);
        } catch (error) {
            next(error);
        }
    },

    createFundingSource: async (request, response, next) => {
        try {
            const fundingSource = await FundingSource.create({ ...request.body, created_by: request.user.id });
            response.status(HTTP_STATUS.CREATED).json(fundingSource);
        } catch (error) {
            next(error);
        }
    },

    updateFundingSource: async (request, response, next) => {
        try {
            const { created_by: _ignored, ...changes } = request.body || {};
            const fundingSource = await FundingSource.findByIdAndUpdate(request.params.id, { ...changes, updated_by: request.user.id });
            if (!fundingSource) throw new AppError('Funding source not found', HTTP_STATUS.NOT_FOUND);
            response.status(HTTP_STATUS.OK).json(fundingSource);
        } catch (error) {
            next(error);
        }
    },

    deleteFundingSource: async (request, response, next) => {
        try {
            const fundingSource = await FundingSource.findByIdAndDelete(request.params.id);
            if (!fundingSource) throw new AppError('Funding source not found', HTTP_STATUS.NOT_FOUND);
            response.status(HTTP_STATUS.OK).json(fundingSource);
        } catch (error) {
            next(error);
        }
    },
}

module.exports = FundingSourceController;
