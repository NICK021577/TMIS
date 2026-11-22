const Invitation = require('../models/invitationModel');
const { HTTP_STATUS } = require('../config/constants');
const { AppError } = require('../middleware/errorHandler');

const InvitationController = {

    getAllInvitations: async (request, response, next) => {
        try {
            const invitations = await Invitation.find();
            response.status(HTTP_STATUS.OK).json(invitations);
        } catch (error) {
            next(error);
        }
    },

    getInvitationById: async (request, response, next) => {
        try {
            const invitation = await Invitation.findById(request.params.id);
            if (!invitation) throw new AppError('Invitation not found', HTTP_STATUS.NOT_FOUND);
            response.status(HTTP_STATUS.OK).json(invitation);
        } catch (error) {
            next(error);
        }
    },

    createInvitation: async (request, response, next) => {
        try {
            const invitation = await Invitation.create({ ...request.body, created_by: request.user.id });
            response.status(HTTP_STATUS.CREATED).json(invitation);
        } catch (error) {
            next(error);
        }
    },

    updateInvitation: async (request, response, next) => {
        try {
            const { created_by: _ignored, ...changes } = request.body || {};
            const invitation = await Invitation.findByIdAndUpdate(request.params.id, { ...changes, updated_by: request.user.id });
            if (!invitation) throw new AppError('Invitation not found', HTTP_STATUS.NOT_FOUND);
            response.status(HTTP_STATUS.OK).json(invitation);
        } catch (error) {
            next(error);
        }
    },

    deleteInvitation: async (request, response, next) => {
        try {
            const invitation = await Invitation.findByIdAndDelete(request.params.id);
            if (!invitation) throw new AppError('Invitation not found', HTTP_STATUS.NOT_FOUND);
            response.status(HTTP_STATUS.OK).json(invitation);
        } catch (error) {
            next(error);
        }
    },
}

module.exports = InvitationController;
