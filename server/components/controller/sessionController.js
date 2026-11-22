const Session = require('../models/sessionModel');
const { HTTP_STATUS } = require('../config/constants');
const { AppError } = require('../middleware/errorHandler');

const SessionController = {

    getAllSessions: async (request, response, next) => {
        try {
            const sessions = await Session.find();
            response.status(HTTP_STATUS.OK).json(sessions);
        } catch (error) {
            next(error);
        }
    },

    getSessionById: async (request, response, next) => {
        try {
            const session = await Session.findById(request.params.id);
            if (!session) throw new AppError('Session not found', HTTP_STATUS.NOT_FOUND);
            response.status(HTTP_STATUS.OK).json(session);
        } catch (error) {
            next(error);
        }
    },

    createSession: async (request, response, next) => {
        try {
            const session = await Session.create({ ...request.body, created_by: request.user.id });
            response.status(HTTP_STATUS.CREATED).json(session);
        } catch (error) {
            next(error);
        }
    },

    updateSession: async (request, response, next) => {
        try {
            const { created_by: _ignored, ...changes } = request.body || {};
            const session = await Session.findByIdAndUpdate(request.params.id, { ...changes, updated_by: request.user.id });
            if (!session) throw new AppError('Session not found', HTTP_STATUS.NOT_FOUND);
            response.status(HTTP_STATUS.OK).json(session);
        } catch (error) {
            next(error);
        }
    },

    deleteSession: async (request, response, next) => {
        try {
            const session = await Session.findByIdAndDelete(request.params.id);
            if (!session) throw new AppError('Session not found', HTTP_STATUS.NOT_FOUND);
            response.status(HTTP_STATUS.OK).json(session);
        } catch (error) {
            next(error);
        }
    },
}

module.exports = SessionController;
