const ApplicationDocument = require('../models/applicationDocumentModel');
const { HTTP_STATUS } = require('../config/constants');
const { AppError } = require('../middleware/errorHandler');

const ApplicationDocumentController = {

    getAllApplicationDocuments: async (request, response, next) => {
        try {
            const applicationDocuments = await ApplicationDocument.find();
            response.status(HTTP_STATUS.OK).json(applicationDocuments);
        } catch (error) {
            next(error);
        }
    },

    getApplicationDocumentById: async (request, response, next) => {
        try {
            const applicationDocument = await ApplicationDocument.findById(request.params.id);
            if (!applicationDocument) throw new AppError('Application document not found', HTTP_STATUS.NOT_FOUND);
            response.status(HTTP_STATUS.OK).json(applicationDocument);
        } catch (error) {
            next(error);
        }
    },

    createApplicationDocument: async (request, response, next) => {
        try {
            const applicationDocument = await ApplicationDocument.create(request.body || {});
            response.status(HTTP_STATUS.CREATED).json(applicationDocument);
        } catch (error) {
            next(error);
        }
    },

    updateApplicationDocument: async (request, response, next) => {
        try {
            const applicationDocument = await ApplicationDocument.findByIdAndUpdate(request.params.id, request.body || {});
            if (!applicationDocument) throw new AppError('Application document not found', HTTP_STATUS.NOT_FOUND);
            response.status(HTTP_STATUS.OK).json(applicationDocument);
        } catch (error) {
            next(error);
        }
    },

    deleteApplicationDocument: async (request, response, next) => {
        try {
            const applicationDocument = await ApplicationDocument.findByIdAndDelete(request.params.id);
            if (!applicationDocument) throw new AppError('Application document not found', HTTP_STATUS.NOT_FOUND);
            response.status(HTTP_STATUS.OK).json(applicationDocument);
        } catch (error) {
            next(error);
        }
    },
}

module.exports = ApplicationDocumentController;
