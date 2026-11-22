const ActivityReportSection = require('../models/activityReportSectionModel');
const { HTTP_STATUS } = require('../config/constants');
const { AppError } = require('../middleware/errorHandler');

const ActivityReportSectionController = {

    getAllActivityReportSections: async (request, response, next) => {
        try {
            const activityReportSections = await ActivityReportSection.find();
            response.status(HTTP_STATUS.OK).json(activityReportSections);
        } catch (error) {
            next(error);
        }
    },

    getActivityReportSectionById: async (request, response, next) => {
        try {
            const activityReportSection = await ActivityReportSection.findById(request.params.id);
            if (!activityReportSection) throw new AppError('Activity report section not found', HTTP_STATUS.NOT_FOUND);
            response.status(HTTP_STATUS.OK).json(activityReportSection);
        } catch (error) {
            next(error);
        }
    },

    createActivityReportSection: async (request, response, next) => {
        try {
            const activityReportSection = await ActivityReportSection.create({ ...request.body, created_by: request.user.id });
            response.status(HTTP_STATUS.CREATED).json(activityReportSection);
        } catch (error) {
            next(error);
        }
    },

    updateActivityReportSection: async (request, response, next) => {
        try {
            const { created_by: _ignored, ...changes } = request.body || {};
            const activityReportSection = await ActivityReportSection.findByIdAndUpdate(request.params.id, { ...changes, updated_by: request.user.id });
            if (!activityReportSection) throw new AppError('Activity report section not found', HTTP_STATUS.NOT_FOUND);
            response.status(HTTP_STATUS.OK).json(activityReportSection);
        } catch (error) {
            next(error);
        }
    },

    deleteActivityReportSection: async (request, response, next) => {
        try {
            const activityReportSection = await ActivityReportSection.findByIdAndDelete(request.params.id);
            if (!activityReportSection) throw new AppError('Activity report section not found', HTTP_STATUS.NOT_FOUND);
            response.status(HTTP_STATUS.OK).json(activityReportSection);
        } catch (error) {
            next(error);
        }
    },
}

module.exports = ActivityReportSectionController;
