const OutputSubmission = require('../models/outputSubmissionModel');
const { HTTP_STATUS } = require('../config/constants');
const { AppError } = require('../middleware/errorHandler');

const OutputSubmissionController = {

    getAllOutputSubmissions: async (request, response, next) => {
        try {
            const outputSubmissions = await OutputSubmission.find();
            response.status(HTTP_STATUS.OK).json(outputSubmissions);
        } catch (error) {
            next(error);
        }
    },

    getOutputSubmissionById: async (request, response, next) => {
        try {
            const outputSubmission = await OutputSubmission.findById(request.params.id);
            if (!outputSubmission) throw new AppError('Output submission not found', HTTP_STATUS.NOT_FOUND);
            response.status(HTTP_STATUS.OK).json(outputSubmission);
        } catch (error) {
            next(error);
        }
    },

    createOutputSubmission: async (request, response, next) => {
        try {
            const outputSubmission = await OutputSubmission.create(request.body || {});
            response.status(HTTP_STATUS.CREATED).json(outputSubmission);
        } catch (error) {
            next(error);
        }
    },

    updateOutputSubmission: async (request, response, next) => {
        try {
            const outputSubmission = await OutputSubmission.findByIdAndUpdate(request.params.id, request.body || {});
            if (!outputSubmission) throw new AppError('Output submission not found', HTTP_STATUS.NOT_FOUND);
            response.status(HTTP_STATUS.OK).json(outputSubmission);
        } catch (error) {
            next(error);
        }
    },

    deleteOutputSubmission: async (request, response, next) => {
        try {
            const outputSubmission = await OutputSubmission.findByIdAndDelete(request.params.id);
            if (!outputSubmission) throw new AppError('Output submission not found', HTTP_STATUS.NOT_FOUND);
            response.status(HTTP_STATUS.OK).json(outputSubmission);
        } catch (error) {
            next(error);
        }
    },
}

module.exports = OutputSubmissionController;
