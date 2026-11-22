const MessageGroup = require('../models/messageGroupModel');
const { HTTP_STATUS } = require('../config/constants');
const { AppError } = require('../middleware/errorHandler');

const MessageGroupController = {

    getAllMessageGroups: async (request, response, next) => {
        try {
            const messageGroups = await MessageGroup.find();
            response.status(HTTP_STATUS.OK).json(messageGroups);
        } catch (error) {
            next(error);
        }
    },

    getMessageGroupById: async (request, response, next) => {
        try {
            const messageGroup = await MessageGroup.findById(request.params.id);
            if (!messageGroup) throw new AppError('Message group not found', HTTP_STATUS.NOT_FOUND);
            response.status(HTTP_STATUS.OK).json(messageGroup);
        } catch (error) {
            next(error);
        }
    },

    createMessageGroup: async (request, response, next) => {
        try {
            const messageGroup = await MessageGroup.create({ ...request.body, created_by: request.user.id });
            response.status(HTTP_STATUS.CREATED).json(messageGroup);
        } catch (error) {
            next(error);
        }
    },

    updateMessageGroup: async (request, response, next) => {
        try {
            const { created_by: _ignored, ...changes } = request.body || {};
            const messageGroup = await MessageGroup.findByIdAndUpdate(request.params.id, { ...changes, updated_by: request.user.id });
            if (!messageGroup) throw new AppError('Message group not found', HTTP_STATUS.NOT_FOUND);
            response.status(HTTP_STATUS.OK).json(messageGroup);
        } catch (error) {
            next(error);
        }
    },

    deleteMessageGroup: async (request, response, next) => {
        try {
            const messageGroup = await MessageGroup.findByIdAndDelete(request.params.id);
            if (!messageGroup) throw new AppError('Message group not found', HTTP_STATUS.NOT_FOUND);
            response.status(HTTP_STATUS.OK).json(messageGroup);
        } catch (error) {
            next(error);
        }
    },
}

module.exports = MessageGroupController;
