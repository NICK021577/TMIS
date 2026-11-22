const ParticipantProfile = require('../models/participantProfileModel');
const { HTTP_STATUS } = require('../config/constants');
const { AppError } = require('../middleware/errorHandler');

const ParticipantProfileController = {

    getAllParticipantProfiles: async (request, response, next) => {
        try {
            const participantProfiles = await ParticipantProfile.find();
            response.status(HTTP_STATUS.OK).json(participantProfiles);
        } catch (error) {
            next(error);
        }
    },

    getParticipantProfileById: async (request, response, next) => {
        try {
            const participantProfile = await ParticipantProfile.findById(request.params.id);
            if (!participantProfile) throw new AppError('Participant profile not found', HTTP_STATUS.NOT_FOUND);
            response.status(HTTP_STATUS.OK).json(participantProfile);
        } catch (error) {
            next(error);
        }
    },

    createParticipantProfile: async (request, response, next) => {
        try {
            const participantProfile = await ParticipantProfile.create(request.body || {});
            response.status(HTTP_STATUS.CREATED).json(participantProfile);
        } catch (error) {
            next(error);
        }
    },

    updateParticipantProfile: async (request, response, next) => {
        try {
            const participantProfile = await ParticipantProfile.findByIdAndUpdate(request.params.id, request.body || {});
            if (!participantProfile) throw new AppError('Participant profile not found', HTTP_STATUS.NOT_FOUND);
            response.status(HTTP_STATUS.OK).json(participantProfile);
        } catch (error) {
            next(error);
        }
    },

    deleteParticipantProfile: async (request, response, next) => {
        try {
            const participantProfile = await ParticipantProfile.findByIdAndDelete(request.params.id);
            if (!participantProfile) throw new AppError('Participant profile not found', HTTP_STATUS.NOT_FOUND);
            response.status(HTTP_STATUS.OK).json(participantProfile);
        } catch (error) {
            next(error);
        }
    },
}

module.exports = ParticipantProfileController;
