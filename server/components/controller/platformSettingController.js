const PlatformSetting = require('../models/platformSettingModel');
const { HTTP_STATUS } = require('../config/constants');
const { AppError } = require('../middleware/errorHandler');

const PlatformSettingController = {

    getAllPlatformSettings: async (request, response, next) => {
        try {
            const platformSettings = await PlatformSetting.find();
            response.status(HTTP_STATUS.OK).json(platformSettings);
        } catch (error) {
            next(error);
        }
    },

    getPlatformSettingById: async (request, response, next) => {
        try {
            const platformSetting = await PlatformSetting.findById(request.params.id);
            if (!platformSetting) throw new AppError('Platform setting not found', HTTP_STATUS.NOT_FOUND);
            response.status(HTTP_STATUS.OK).json(platformSetting);
        } catch (error) {
            next(error);
        }
    },

    createPlatformSetting: async (request, response, next) => {
        try {
            const platformSetting = await PlatformSetting.create({ ...request.body, created_by: request.user.id });
            response.status(HTTP_STATUS.CREATED).json(platformSetting);
        } catch (error) {
            next(error);
        }
    },

    updatePlatformSetting: async (request, response, next) => {
        try {
            const { created_by: _ignored, ...changes } = request.body || {};
            const platformSetting = await PlatformSetting.findByIdAndUpdate(request.params.id, { ...changes, updated_by: request.user.id });
            if (!platformSetting) throw new AppError('Platform setting not found', HTTP_STATUS.NOT_FOUND);
            response.status(HTTP_STATUS.OK).json(platformSetting);
        } catch (error) {
            next(error);
        }
    },

    deletePlatformSetting: async (request, response, next) => {
        try {
            const platformSetting = await PlatformSetting.findByIdAndDelete(request.params.id);
            if (!platformSetting) throw new AppError('Platform setting not found', HTTP_STATUS.NOT_FOUND);
            response.status(HTTP_STATUS.OK).json(platformSetting);
        } catch (error) {
            next(error);
        }
    },
}

module.exports = PlatformSettingController;
