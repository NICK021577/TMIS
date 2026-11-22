const MembershipMenu = require('../models/membershipMenuModel');
const { HTTP_STATUS } = require('../config/constants');
const { AppError } = require('../middleware/errorHandler');

const MembershipMenuController = {

    getAllMembershipMenus: async (request, response, next) => {
        try {
            const membershipMenus = await MembershipMenu.find();
            response.status(HTTP_STATUS.OK).json(membershipMenus);
        } catch (error) {
            next(error);
        }
    },

    getMembershipMenuById: async (request, response, next) => {
        try {
            const membershipMenu = await MembershipMenu.findById(request.params.id);
            if (!membershipMenu) throw new AppError('Membership menu not found', HTTP_STATUS.NOT_FOUND);
            response.status(HTTP_STATUS.OK).json(membershipMenu);
        } catch (error) {
            next(error);
        }
    },

    createMembershipMenu: async (request, response, next) => {
        try {
            const membershipMenu = await MembershipMenu.create({ ...request.body, created_by: request.user.id });
            response.status(HTTP_STATUS.CREATED).json(membershipMenu);
        } catch (error) {
            next(error);
        }
    },

    updateMembershipMenu: async (request, response, next) => {
        try {
            const { created_by: _ignored, ...changes } = request.body || {};
            const membershipMenu = await MembershipMenu.findByIdAndUpdate(request.params.id, { ...changes, updated_by: request.user.id });
            if (!membershipMenu) throw new AppError('Membership menu not found', HTTP_STATUS.NOT_FOUND);
            response.status(HTTP_STATUS.OK).json(membershipMenu);
        } catch (error) {
            next(error);
        }
    },

    deleteMembershipMenu: async (request, response, next) => {
        try {
            const membershipMenu = await MembershipMenu.findByIdAndDelete(request.params.id);
            if (!membershipMenu) throw new AppError('Membership menu not found', HTTP_STATUS.NOT_FOUND);
            response.status(HTTP_STATUS.OK).json(membershipMenu);
        } catch (error) {
            next(error);
        }
    },
}

module.exports = MembershipMenuController;
