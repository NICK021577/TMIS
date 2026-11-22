const Document = require('../models/documentModel');
const { HTTP_STATUS } = require('../config/constants');
const { AppError } = require('../middleware/errorHandler');

const DocumentController = {

    getAllDocuments: async (request, response, next) => {
        try {
            const documents = await Document.find();
            response.status(HTTP_STATUS.OK).json(documents);
        } catch (error) {
            next(error);
        }
    },

    getDocumentById: async (request, response, next) => {
        try {
            const document = await Document.findById(request.params.id);
            if (!document) throw new AppError('Document not found', HTTP_STATUS.NOT_FOUND);
            response.status(HTTP_STATUS.OK).json(document);
        } catch (error) {
            next(error);
        }
    },

    createDocument: async (request, response, next) => {
        try {
            const document = await Document.create(request.body || {});
            response.status(HTTP_STATUS.CREATED).json(document);
        } catch (error) {
            next(error);
        }
    },

    updateDocument: async (request, response, next) => {
        try {
            const document = await Document.findByIdAndUpdate(request.params.id, request.body || {});
            if (!document) throw new AppError('Document not found', HTTP_STATUS.NOT_FOUND);
            response.status(HTTP_STATUS.OK).json(document);
        } catch (error) {
            next(error);
        }
    },

    deleteDocument: async (request, response, next) => {
        try {
            const document = await Document.findByIdAndDelete(request.params.id);
            if (!document) throw new AppError('Document not found', HTTP_STATUS.NOT_FOUND);
            response.status(HTTP_STATUS.OK).json(document);
        } catch (error) {
            next(error);
        }
    },
}

module.exports = DocumentController;
