const AgencyMembership = require('../models/agencyMembershipModel');
const { HTTP_STATUS } = require('../config/constants');
const { AppError } = require('../middleware/errorHandler');

const AgencyMembershipController = {

    getAllAgencyMemberships: async (request, response, next) => {
        try {
            const agencyMemberships = await AgencyMembership.find();
            response.status(HTTP_STATUS.OK).json(agencyMemberships);
        } catch (error) {
            next(error);
        }
    },

    getAgencyMembershipById: async (request, response, next) => {
        try {
            const agencyMembership = await AgencyMembership.findById(request.params.id);
            if (!agencyMembership) throw new AppError('Agency membership not found', HTTP_STATUS.NOT_FOUND);
            response.status(HTTP_STATUS.OK).json(agencyMembership);
        } catch (error) {
            next(error);
        }
    },

    createAgencyMembership: async (request, response, next) => {
        try {
            const agencyMembership = await AgencyMembership.create({ ...request.body, created_by: request.user.id });
            response.status(HTTP_STATUS.CREATED).json(agencyMembership);
        } catch (error) {
            next(error);
        }
    },

    updateAgencyMembership: async (request, response, next) => {
        try {
            const { created_by: _ignored, ...changes } = request.body || {};
            const agencyMembership = await AgencyMembership.findByIdAndUpdate(request.params.id, { ...changes, updated_by: request.user.id });
            if (!agencyMembership) throw new AppError('Agency membership not found', HTTP_STATUS.NOT_FOUND);
            response.status(HTTP_STATUS.OK).json(agencyMembership);
        } catch (error) {
            next(error);
        }
    },

    deleteAgencyMembership: async (request, response, next) => {
        try {
            const agencyMembership = await AgencyMembership.findByIdAndDelete(request.params.id);
            if (!agencyMembership) throw new AppError('Agency membership not found', HTTP_STATUS.NOT_FOUND);
            response.status(HTTP_STATUS.OK).json(agencyMembership);
        } catch (error) {
            next(error);
        }
    },
}

module.exports = AgencyMembershipController;
