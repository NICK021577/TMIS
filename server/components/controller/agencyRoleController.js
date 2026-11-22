const AgencyRole = require('../models/agencyRoleModel');
const { HTTP_STATUS } = require('../config/constants');
const { AppError } = require('../middleware/errorHandler');

const AgencyRoleController = {

    getAllAgencyRoles: async (request, response, next) => {
        try {
            const agencyRoles = await AgencyRole.find();
            response.status(HTTP_STATUS.OK).json(agencyRoles);
        } catch (error) {
            next(error);
        }
    },

    getAgencyRoleById: async (request, response, next) => {
        try {
            const agencyRole = await AgencyRole.findById(request.params.id);
            if (!agencyRole) throw new AppError('Agency role not found', HTTP_STATUS.NOT_FOUND);
            response.status(HTTP_STATUS.OK).json(agencyRole);
        } catch (error) {
            next(error);
        }
    },

    createAgencyRole: async (request, response, next) => {
        try {
            const agencyRole = await AgencyRole.create({ ...request.body, created_by: request.user.id });
            response.status(HTTP_STATUS.CREATED).json(agencyRole);
        } catch (error) {
            next(error);
        }
    },

    updateAgencyRole: async (request, response, next) => {
        try {
            const { created_by: _ignored, ...changes } = request.body || {};
            const agencyRole = await AgencyRole.findByIdAndUpdate(request.params.id, { ...changes, updated_by: request.user.id });
            if (!agencyRole) throw new AppError('Agency role not found', HTTP_STATUS.NOT_FOUND);
            response.status(HTTP_STATUS.OK).json(agencyRole);
        } catch (error) {
            next(error);
        }
    },

    deleteAgencyRole: async (request, response, next) => {
        try {
            const agencyRole = await AgencyRole.findByIdAndDelete(request.params.id);
            if (!agencyRole) throw new AppError('Agency role not found', HTTP_STATUS.NOT_FOUND);
            response.status(HTTP_STATUS.OK).json(agencyRole);
        } catch (error) {
            next(error);
        }
    },
}

module.exports = AgencyRoleController;
