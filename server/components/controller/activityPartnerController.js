const ActivityPartner = require('../models/activityPartnerModel');
const { HTTP_STATUS } = require('../config/constants');
const { AppError } = require('../middleware/errorHandler');

const ActivityPartnerController = {

    getAllActivityPartners: async (request, response, next) => {
        try {
            const activityPartners = await ActivityPartner.find();
            response.status(HTTP_STATUS.OK).json(activityPartners);
        } catch (error) {
            next(error);
        }
    },

    getActivityPartnerById: async (request, response, next) => {
        try {
            const activityPartner = await ActivityPartner.findById(request.params.id);
            if (!activityPartner) throw new AppError('Activity partner not found', HTTP_STATUS.NOT_FOUND);
            response.status(HTTP_STATUS.OK).json(activityPartner);
        } catch (error) {
            next(error);
        }
    },

    createActivityPartner: async (request, response, next) => {
        try {
            const activityPartner = await ActivityPartner.create({ ...request.body, created_by: request.user.id });
            response.status(HTTP_STATUS.CREATED).json(activityPartner);
        } catch (error) {
            next(error);
        }
    },

    updateActivityPartner: async (request, response, next) => {
        try {
            const { created_by: _ignored, ...changes } = request.body || {};
            const activityPartner = await ActivityPartner.findByIdAndUpdate(request.params.id, { ...changes, updated_by: request.user.id });
            if (!activityPartner) throw new AppError('Activity partner not found', HTTP_STATUS.NOT_FOUND);
            response.status(HTTP_STATUS.OK).json(activityPartner);
        } catch (error) {
            next(error);
        }
    },

    deleteActivityPartner: async (request, response, next) => {
        try {
            const activityPartner = await ActivityPartner.findByIdAndDelete(request.params.id);
            if (!activityPartner) throw new AppError('Activity partner not found', HTTP_STATUS.NOT_FOUND);
            response.status(HTTP_STATUS.OK).json(activityPartner);
        } catch (error) {
            next(error);
        }
    },
}

module.exports = ActivityPartnerController;
