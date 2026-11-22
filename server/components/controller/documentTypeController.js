const DocumentType = require('../models/documentTypeModel');
const { HTTP_STATUS } = require('../config/constants');
const { AppError } = require('../middleware/errorHandler');

const DocumentTypeController = {

    getAllDocumentTypes: async (request, response, next) => {
        try {
            const documentTypes = await DocumentType.find();
            response.status(HTTP_STATUS.OK).json(documentTypes);
        } catch (error) {
            next(error);
        }
    },

    getDocumentTypeById: async (request, response, next) => {
        try {
            const documentType = await DocumentType.findById(request.params.id);
            if (!documentType) throw new AppError('Document type not found', HTTP_STATUS.NOT_FOUND);
            response.status(HTTP_STATUS.OK).json(documentType);
        } catch (error) {
            next(error);
        }
    },

    createDocumentType: async (request, response, next) => {
        try {
            const documentType = await DocumentType.create({ ...request.body, created_by: request.user.id });
            response.status(HTTP_STATUS.CREATED).json(documentType);
        } catch (error) {
            next(error);
        }
    },

    updateDocumentType: async (request, response, next) => {
        try {
            const { created_by: _ignored, ...changes } = request.body || {};
            const documentType = await DocumentType.findByIdAndUpdate(request.params.id, { ...changes, updated_by: request.user.id });
            if (!documentType) throw new AppError('Document type not found', HTTP_STATUS.NOT_FOUND);
            response.status(HTTP_STATUS.OK).json(documentType);
        } catch (error) {
            next(error);
        }
    },

    deleteDocumentType: async (request, response, next) => {
        try {
            const documentType = await DocumentType.findByIdAndDelete(request.params.id);
            if (!documentType) throw new AppError('Document type not found', HTTP_STATUS.NOT_FOUND);
            response.status(HTTP_STATUS.OK).json(documentType);
        } catch (error) {
            next(error);
        }
    },
}

module.exports = DocumentTypeController;
