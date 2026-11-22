const Notification = require('../models/notificationModel');
const { HTTP_STATUS } = require('../config/constants');
const { AppError } = require('../middleware/errorHandler');

const NotificationController = {

    getAllNotifications: async (request, response, next) => {
        try {
            const notifications = await Notification.find();
            response.status(HTTP_STATUS.OK).json(notifications);
        } catch (error) {
            next(error);
        }
    },

    getNotificationById: async (request, response, next) => {
        try {
            const notification = await Notification.findById(request.params.id);
            if (!notification) throw new AppError('Notification not found', HTTP_STATUS.NOT_FOUND);
            response.status(HTTP_STATUS.OK).json(notification);
        } catch (error) {
            next(error);
        }
    },

    createNotification: async (request, response, next) => {
        try {
            const notification = await Notification.create(request.body || {});
            response.status(HTTP_STATUS.CREATED).json(notification);
        } catch (error) {
            next(error);
        }
    },

    updateNotification: async (request, response, next) => {
        try {
            const notification = await Notification.findByIdAndUpdate(request.params.id, request.body || {});
            if (!notification) throw new AppError('Notification not found', HTTP_STATUS.NOT_FOUND);
            response.status(HTTP_STATUS.OK).json(notification);
        } catch (error) {
            next(error);
        }
    },

    deleteNotification: async (request, response, next) => {
        try {
            const notification = await Notification.findByIdAndDelete(request.params.id);
            if (!notification) throw new AppError('Notification not found', HTTP_STATUS.NOT_FOUND);
            response.status(HTTP_STATUS.OK).json(notification);
        } catch (error) {
            next(error);
        }
    },
}

module.exports = NotificationController;
