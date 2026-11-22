const ActivityReport = require('../models/activityReportModel');
const { HTTP_STATUS } = require('../config/constants');
const { AppError } = require('../middleware/errorHandler');

const ActivityReportController = {

    getAllActivityReports: async (request, response, next) => {
        try {
            const activityReports = await ActivityReport.find();
            response.status(HTTP_STATUS.OK).json(activityReports);
        } catch (error) {
            next(error);
        }
    },

    getActivityReportById: async (request, response, next) => {
        try {
            const activityReport = await ActivityReport.findById(request.params.id);
            if (!activityReport) throw new AppError('Activity report not found', HTTP_STATUS.NOT_FOUND);
            response.status(HTTP_STATUS.OK).json(activityReport);
        } catch (error) {
            next(error);
        }
    },

    createActivityReport: async (request, response, next) => {
        try {
            const activityReport = await ActivityReport.create({ ...request.body, created_by: request.user.id });
            response.status(HTTP_STATUS.CREATED).json(activityReport);
        } catch (error) {
            next(error);
        }
    },

    updateActivityReport: async (request, response, next) => {
        try {
            const { created_by: _ignored, ...changes } = request.body || {};
            const activityReport = await ActivityReport.findByIdAndUpdate(request.params.id, { ...changes, updated_by: request.user.id });
            if (!activityReport) throw new AppError('Activity report not found', HTTP_STATUS.NOT_FOUND);
            response.status(HTTP_STATUS.OK).json(activityReport);
        } catch (error) {
            next(error);
        }
    },

    deleteActivityReport: async (request, response, next) => {
        try {
            const activityReport = await ActivityReport.findByIdAndDelete(request.params.id);
            if (!activityReport) throw new AppError('Activity report not found', HTTP_STATUS.NOT_FOUND);
            response.status(HTTP_STATUS.OK).json(activityReport);
        } catch (error) {
            next(error);
        }
    },
}

module.exports = ActivityReportController;
