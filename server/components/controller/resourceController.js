const Resource = require('../models/resourceModel');
const { HTTP_STATUS } = require('../config/constants');
const { AppError } = require('../middleware/errorHandler');

const ResourceController = {

    getAllResources: async (request, response, next) => {
        try {
            const resources = await Resource.find();
            response.status(HTTP_STATUS.OK).json(resources);
        } catch (error) {
            next(error);
        }
    },

    getResourceById: async (request, response, next) => {
        try {
            const resource = await Resource.findById(request.params.id);
            if (!resource) throw new AppError('Resource not found', HTTP_STATUS.NOT_FOUND);
            response.status(HTTP_STATUS.OK).json(resource);
        } catch (error) {
            next(error);
        }
    },

    createResource: async (request, response, next) => {
        try {
            const resource = await Resource.create({ ...request.body, created_by: request.user.id });
            response.status(HTTP_STATUS.CREATED).json(resource);
        } catch (error) {
            next(error);
        }
    },

    updateResource: async (request, response, next) => {
        try {
            const { created_by: _ignored, ...changes } = request.body || {};
            const resource = await Resource.findByIdAndUpdate(request.params.id, { ...changes, updated_by: request.user.id });
            if (!resource) throw new AppError('Resource not found', HTTP_STATUS.NOT_FOUND);
            response.status(HTTP_STATUS.OK).json(resource);
        } catch (error) {
            next(error);
        }
    },

    deleteResource: async (request, response, next) => {
        try {
            const resource = await Resource.findByIdAndDelete(request.params.id);
            if (!resource) throw new AppError('Resource not found', HTTP_STATUS.NOT_FOUND);
            response.status(HTTP_STATUS.OK).json(resource);
        } catch (error) {
            next(error);
        }
    },
}

module.exports = ResourceController;
