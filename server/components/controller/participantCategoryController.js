const ParticipantCategory = require('../models/participantCategoryModel');
const { HTTP_STATUS } = require('../config/constants');
const { AppError } = require('../middleware/errorHandler');

const ParticipantCategoryController = {

    getAllParticipantCategories: async (request, response, next) => {
        try {
            const participantCategories = await ParticipantCategory.find();
            response.status(HTTP_STATUS.OK).json(participantCategories);
        } catch (error) {
            next(error);
        }
    },

    getParticipantCategoryById: async (request, response, next) => {
        try {
            const participantCategory = await ParticipantCategory.findById(request.params.id);
            if (!participantCategory) throw new AppError('Participant category not found', HTTP_STATUS.NOT_FOUND);
            response.status(HTTP_STATUS.OK).json(participantCategory);
        } catch (error) {
            next(error);
        }
    },

    createParticipantCategory: async (request, response, next) => {
        try {
            const participantCategory = await ParticipantCategory.create({ ...request.body, created_by: request.user.id });
            response.status(HTTP_STATUS.CREATED).json(participantCategory);
        } catch (error) {
            next(error);
        }
    },

    updateParticipantCategory: async (request, response, next) => {
        try {
            const { created_by: _ignored, ...changes } = request.body || {};
            const participantCategory = await ParticipantCategory.findByIdAndUpdate(request.params.id, { ...changes, updated_by: request.user.id });
            if (!participantCategory) throw new AppError('Participant category not found', HTTP_STATUS.NOT_FOUND);
            response.status(HTTP_STATUS.OK).json(participantCategory);
        } catch (error) {
            next(error);
        }
    },

    deleteParticipantCategory: async (request, response, next) => {
        try {
            const participantCategory = await ParticipantCategory.findByIdAndDelete(request.params.id);
            if (!participantCategory) throw new AppError('Participant category not found', HTTP_STATUS.NOT_FOUND);
            response.status(HTTP_STATUS.OK).json(participantCategory);
        } catch (error) {
            next(error);
        }
    },
}

module.exports = ParticipantCategoryController;
