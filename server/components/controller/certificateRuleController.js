const CertificateRule = require('../models/certificateRuleModel');
const { HTTP_STATUS } = require('../config/constants');
const { AppError } = require('../middleware/errorHandler');

const CertificateRuleController = {

    getAllCertificateRules: async (request, response, next) => {
        try {
            const certificateRules = await CertificateRule.find();
            response.status(HTTP_STATUS.OK).json(certificateRules);
        } catch (error) {
            next(error);
        }
    },

    getCertificateRuleById: async (request, response, next) => {
        try {
            const certificateRule = await CertificateRule.findById(request.params.id);
            if (!certificateRule) throw new AppError('Certificate rule not found', HTTP_STATUS.NOT_FOUND);
            response.status(HTTP_STATUS.OK).json(certificateRule);
        } catch (error) {
            next(error);
        }
    },

    createCertificateRule: async (request, response, next) => {
        try {
            const certificateRule = await CertificateRule.create({ ...request.body, created_by: request.user.id });
            response.status(HTTP_STATUS.CREATED).json(certificateRule);
        } catch (error) {
            next(error);
        }
    },

    updateCertificateRule: async (request, response, next) => {
        try {
            const { created_by: _ignored, ...changes } = request.body || {};
            const certificateRule = await CertificateRule.findByIdAndUpdate(request.params.id, { ...changes, updated_by: request.user.id });
            if (!certificateRule) throw new AppError('Certificate rule not found', HTTP_STATUS.NOT_FOUND);
            response.status(HTTP_STATUS.OK).json(certificateRule);
        } catch (error) {
            next(error);
        }
    },

    deleteCertificateRule: async (request, response, next) => {
        try {
            const certificateRule = await CertificateRule.findByIdAndDelete(request.params.id);
            if (!certificateRule) throw new AppError('Certificate rule not found', HTTP_STATUS.NOT_FOUND);
            response.status(HTTP_STATUS.OK).json(certificateRule);
        } catch (error) {
            next(error);
        }
    },
}

module.exports = CertificateRuleController;
