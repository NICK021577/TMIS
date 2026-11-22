const PlatformDefaultItem = require('../models/platformDefaultItemModel');
const { HTTP_STATUS } = require('../config/constants');
const { AppError } = require('../middleware/errorHandler');

const PlatformDefaultItemController = {

    getAllPlatformDefaultItems: async (request, response, next) => {
        try {
            const platformDefaultItems = await PlatformDefaultItem.find();
            response.status(HTTP_STATUS.OK).json(platformDefaultItems);
        } catch (error) {
            next(error);
        }
    },

    getPlatformDefaultItemById: async (request, response, next) => {
        try {
            const platformDefaultItem = await PlatformDefaultItem.findById(request.params.id);
            if (!platformDefaultItem) throw new AppError('Platform default item not found', HTTP_STATUS.NOT_FOUND);
            response.status(HTTP_STATUS.OK).json(platformDefaultItem);
        } catch (error) {
            next(error);
        }
    },

    createPlatformDefaultItem: async (request, response, next) => {
        try {
            const platformDefaultItem = await PlatformDefaultItem.create({ ...request.body, created_by: request.user.id });
            response.status(HTTP_STATUS.CREATED).json(platformDefaultItem);
        } catch (error) {
            next(error);
        }
    },

    updatePlatformDefaultItem: async (request, response, next) => {
        try {
            const { created_by: _ignored, ...changes } = request.body || {};
            const platformDefaultItem = await PlatformDefaultItem.findByIdAndUpdate(request.params.id, { ...changes, updated_by: request.user.id });
            if (!platformDefaultItem) throw new AppError('Platform default item not found', HTTP_STATUS.NOT_FOUND);
            response.status(HTTP_STATUS.OK).json(platformDefaultItem);
        } catch (error) {
            next(error);
        }
    },

    deletePlatformDefaultItem: async (request, response, next) => {
        try {
            const platformDefaultItem = await PlatformDefaultItem.findByIdAndDelete(request.params.id);
            if (!platformDefaultItem) throw new AppError('Platform default item not found', HTTP_STATUS.NOT_FOUND);
            response.status(HTTP_STATUS.OK).json(platformDefaultItem);
        } catch (error) {
            next(error);
        }
    },
}

module.exports = PlatformDefaultItemController;
