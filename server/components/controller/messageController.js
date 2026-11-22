const Message = require('../models/messageModel');
const { HTTP_STATUS } = require('../config/constants');
const { AppError } = require('../middleware/errorHandler');

const MessageController = {

    getAllMessages: async (request, response, next) => {
        try {
            const messages = await Message.find();
            response.status(HTTP_STATUS.OK).json(messages);
        } catch (error) {
            next(error);
        }
    },

    getMessageById: async (request, response, next) => {
        try {
            const message = await Message.findById(request.params.id);
            if (!message) throw new AppError('Message not found', HTTP_STATUS.NOT_FOUND);
            response.status(HTTP_STATUS.OK).json(message);
        } catch (error) {
            next(error);
        }
    },

    createMessage: async (request, response, next) => {
        try {
            const message = await Message.create(request.body || {});
            response.status(HTTP_STATUS.CREATED).json(message);
        } catch (error) {
            next(error);
        }
    },

    updateMessage: async (request, response, next) => {
        try {
            const message = await Message.findByIdAndUpdate(request.params.id, request.body || {});
            if (!message) throw new AppError('Message not found', HTTP_STATUS.NOT_FOUND);
            response.status(HTTP_STATUS.OK).json(message);
        } catch (error) {
            next(error);
        }
    },

    deleteMessage: async (request, response, next) => {
        try {
            const message = await Message.findByIdAndDelete(request.params.id);
            if (!message) throw new AppError('Message not found', HTTP_STATUS.NOT_FOUND);
            response.status(HTTP_STATUS.OK).json(message);
        } catch (error) {
            next(error);
        }
    },
}

module.exports = MessageController;
