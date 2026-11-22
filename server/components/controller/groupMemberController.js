const GroupMember = require('../models/groupMemberModel');
const { HTTP_STATUS } = require('../config/constants');
const { AppError } = require('../middleware/errorHandler');

const GroupMemberController = {

    getAllGroupMembers: async (request, response, next) => {
        try {
            const groupMembers = await GroupMember.find();
            response.status(HTTP_STATUS.OK).json(groupMembers);
        } catch (error) {
            next(error);
        }
    },

    getGroupMemberById: async (request, response, next) => {
        try {
            const groupMember = await GroupMember.findById(request.params.id);
            if (!groupMember) throw new AppError('Group member not found', HTTP_STATUS.NOT_FOUND);
            response.status(HTTP_STATUS.OK).json(groupMember);
        } catch (error) {
            next(error);
        }
    },

    createGroupMember: async (request, response, next) => {
        try {
            const groupMember = await GroupMember.create(request.body || {});
            response.status(HTTP_STATUS.CREATED).json(groupMember);
        } catch (error) {
            next(error);
        }
    },

    updateGroupMember: async (request, response, next) => {
        try {
            const groupMember = await GroupMember.findByIdAndUpdate(request.params.id, request.body || {});
            if (!groupMember) throw new AppError('Group member not found', HTTP_STATUS.NOT_FOUND);
            response.status(HTTP_STATUS.OK).json(groupMember);
        } catch (error) {
            next(error);
        }
    },

    deleteGroupMember: async (request, response, next) => {
        try {
            const groupMember = await GroupMember.findByIdAndDelete(request.params.id);
            if (!groupMember) throw new AppError('Group member not found', HTTP_STATUS.NOT_FOUND);
            response.status(HTTP_STATUS.OK).json(groupMember);
        } catch (error) {
            next(error);
        }
    },
}

module.exports = GroupMemberController;
