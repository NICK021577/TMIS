const Certificate = require('../models/certificateModel');
const { HTTP_STATUS } = require('../config/constants');
const { AppError } = require('../middleware/errorHandler');

const CertificateController = {

    getAllCertificates: async (request, response, next) => {
        try {
            const certificates = await Certificate.find();
            response.status(HTTP_STATUS.OK).json(certificates);
        } catch (error) {
            next(error);
        }
    },

    getCertificateById: async (request, response, next) => {
        try {
            const certificate = await Certificate.findById(request.params.id);
            if (!certificate) throw new AppError('Certificate not found', HTTP_STATUS.NOT_FOUND);
            response.status(HTTP_STATUS.OK).json(certificate);
        } catch (error) {
            next(error);
        }
    },

    createCertificate: async (request, response, next) => {
        try {
            const certificate = await Certificate.create(request.body || {});
            response.status(HTTP_STATUS.CREATED).json(certificate);
        } catch (error) {
            next(error);
        }
    },

    updateCertificate: async (request, response, next) => {
        try {
            const certificate = await Certificate.findByIdAndUpdate(request.params.id, request.body || {});
            if (!certificate) throw new AppError('Certificate not found', HTTP_STATUS.NOT_FOUND);
            response.status(HTTP_STATUS.OK).json(certificate);
        } catch (error) {
            next(error);
        }
    },

    deleteCertificate: async (request, response, next) => {
        try {
            const certificate = await Certificate.findByIdAndDelete(request.params.id);
            if (!certificate) throw new AppError('Certificate not found', HTTP_STATUS.NOT_FOUND);
            response.status(HTTP_STATUS.OK).json(certificate);
        } catch (error) {
            next(error);
        }
    },
}

module.exports = CertificateController;
