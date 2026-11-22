const InvitationRedemption = require('../models/invitationRedemptionModel');
const { HTTP_STATUS } = require('../config/constants');
const { AppError } = require('../middleware/errorHandler');

const InvitationRedemptionController = {

    getAllInvitationRedemptions: async (request, response, next) => {
        try {
            const invitationRedemptions = await InvitationRedemption.find();
            response.status(HTTP_STATUS.OK).json(invitationRedemptions);
        } catch (error) {
            next(error);
        }
    },

    getInvitationRedemptionById: async (request, response, next) => {
        try {
            const invitationRedemption = await InvitationRedemption.findById(request.params.id);
            if (!invitationRedemption) throw new AppError('Invitation redemption not found', HTTP_STATUS.NOT_FOUND);
            response.status(HTTP_STATUS.OK).json(invitationRedemption);
        } catch (error) {
            next(error);
        }
    },

    createInvitationRedemption: async (request, response, next) => {
        try {
            const invitationRedemption = await InvitationRedemption.create(request.body || {});
            response.status(HTTP_STATUS.CREATED).json(invitationRedemption);
        } catch (error) {
            next(error);
        }
    },

    updateInvitationRedemption: async (request, response, next) => {
        try {
            const invitationRedemption = await InvitationRedemption.findByIdAndUpdate(request.params.id, request.body || {});
            if (!invitationRedemption) throw new AppError('Invitation redemption not found', HTTP_STATUS.NOT_FOUND);
            response.status(HTTP_STATUS.OK).json(invitationRedemption);
        } catch (error) {
            next(error);
        }
    },

    deleteInvitationRedemption: async (request, response, next) => {
        try {
            const invitationRedemption = await InvitationRedemption.findByIdAndDelete(request.params.id);
            if (!invitationRedemption) throw new AppError('Invitation redemption not found', HTTP_STATUS.NOT_FOUND);
            response.status(HTTP_STATUS.OK).json(invitationRedemption);
        } catch (error) {
            next(error);
        }
    },
}

module.exports = InvitationRedemptionController;
