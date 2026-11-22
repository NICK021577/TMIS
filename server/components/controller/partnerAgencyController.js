const PartnerAgency = require('../models/partnerAgencyModel');
const { HTTP_STATUS } = require('../config/constants');
const { AppError } = require('../middleware/errorHandler');

const PartnerAgencyController = {

    getAllPartnerAgencies: async (request, response, next) => {
        try {
            const partnerAgencies = await PartnerAgency.find();
            response.status(HTTP_STATUS.OK).json(partnerAgencies);
        } catch (error) {
            next(error);
        }
    },

    getPartnerAgencyById: async (request, response, next) => {
        try {
            const partnerAgency = await PartnerAgency.findById(request.params.id);
            if (!partnerAgency) throw new AppError('Partner agency not found', HTTP_STATUS.NOT_FOUND);
            response.status(HTTP_STATUS.OK).json(partnerAgency);
        } catch (error) {
            next(error);
        }
    },

    createPartnerAgency: async (request, response, next) => {
        try {
            const partnerAgency = await PartnerAgency.create({ ...request.body, created_by: request.user.id });
            response.status(HTTP_STATUS.CREATED).json(partnerAgency);
        } catch (error) {
            next(error);
        }
    },

    updatePartnerAgency: async (request, response, next) => {
        try {
            const { created_by: _ignored, ...changes } = request.body || {};
            const partnerAgency = await PartnerAgency.findByIdAndUpdate(request.params.id, { ...changes, updated_by: request.user.id });
            if (!partnerAgency) throw new AppError('Partner agency not found', HTTP_STATUS.NOT_FOUND);
            response.status(HTTP_STATUS.OK).json(partnerAgency);
        } catch (error) {
            next(error);
        }
    },

    deletePartnerAgency: async (request, response, next) => {
        try {
            const partnerAgency = await PartnerAgency.findByIdAndDelete(request.params.id);
            if (!partnerAgency) throw new AppError('Partner agency not found', HTTP_STATUS.NOT_FOUND);
            response.status(HTTP_STATUS.OK).json(partnerAgency);
        } catch (error) {
            next(error);
        }
    },
}

module.exports = PartnerAgencyController;
