const AgencyApplication = require('../models/agencyApplicationModel');
const { HTTP_STATUS } = require('../config/constants');
const { AppError } = require('../middleware/errorHandler');

const AgencyApplicationController = {

    getAllAgencyApplications: async (request, response, next) => {
        try {
            const agencyApplications = await AgencyApplication.find();
            response.status(HTTP_STATUS.OK).json(agencyApplications);
        } catch (error) {
            next(error);
        }
    },

    getAgencyApplicationById: async (request, response, next) => {
        try {
            const agencyApplication = await AgencyApplication.findById(request.params.id);
            if (!agencyApplication) throw new AppError('Agency application not found', HTTP_STATUS.NOT_FOUND);
            response.status(HTTP_STATUS.OK).json(agencyApplication);
        } catch (error) {
            next(error);
        }
    },

    createAgencyApplication: async (request, response, next) => {
        try {
            const agencyApplication = await AgencyApplication.create(request.body || {});
            response.status(HTTP_STATUS.CREATED).json(agencyApplication);
        } catch (error) {
            next(error);
        }
    },

    updateAgencyApplication: async (request, response, next) => {
        try {
            const agencyApplication = await AgencyApplication.findByIdAndUpdate(request.params.id, request.body || {});
            if (!agencyApplication) throw new AppError('Agency application not found', HTTP_STATUS.NOT_FOUND);
            response.status(HTTP_STATUS.OK).json(agencyApplication);
        } catch (error) {
            next(error);
        }
    },

    deleteAgencyApplication: async (request, response, next) => {
        try {
            const agencyApplication = await AgencyApplication.findByIdAndDelete(request.params.id);
            if (!agencyApplication) throw new AppError('Agency application not found', HTTP_STATUS.NOT_FOUND);
            response.status(HTTP_STATUS.OK).json(agencyApplication);
        } catch (error) {
            next(error);
        }
    },
}

module.exports = AgencyApplicationController;
