const Agency = require('../models/agencyModel');
const { HTTP_STATUS } = require('../config/constants');
const { AppError } = require('../middleware/errorHandler');

const AgencyController = {

    getAllAgencies: async (request, response, next) => {
        try {
            const agencies = await Agency.find();
            response.status(HTTP_STATUS.OK).json(agencies);
        } catch (error) {
            next(error);
        }
    },

    getAgencyById: async (request, response, next) => {
        try {
            const agency = await Agency.findById(request.params.id);
            if (!agency) throw new AppError('Agency not found', HTTP_STATUS.NOT_FOUND);
            response.status(HTTP_STATUS.OK).json(agency);
        } catch (error) {
            next(error);
        }
    },

    createAgency: async (request, response, next) => {
        try {
            const agency = await Agency.create({ ...request.body, created_by: request.user.id });
            response.status(HTTP_STATUS.CREATED).json(agency);
        } catch (error) {
            next(error);
        }
    },

    updateAgency: async (request, response, next) => {
        try {
            const { created_by: _ignored, ...changes } = request.body || {};
            const agency = await Agency.findByIdAndUpdate(request.params.id, { ...changes, updated_by: request.user.id });
            if (!agency) throw new AppError('Agency not found', HTTP_STATUS.NOT_FOUND);
            response.status(HTTP_STATUS.OK).json(agency);
        } catch (error) {
            next(error);
        }
    },

    deleteAgency: async (request, response, next) => {
        try {
            const agency = await Agency.findByIdAndDelete(request.params.id);
            if (!agency) throw new AppError('Agency not found', HTTP_STATUS.NOT_FOUND);
            response.status(HTTP_STATUS.OK).json(agency);
        } catch (error) {
            next(error);
        }
    },
}

module.exports = AgencyController;
