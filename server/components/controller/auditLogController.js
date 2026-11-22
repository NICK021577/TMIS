const AuditLog = require('../models/auditLogModel');
const { HTTP_STATUS } = require('../config/constants');
const { AppError } = require('../middleware/errorHandler');

const AuditLogController = {

    getAllAuditLogs: async (request, response, next) => {
        try {
            const auditLogs = await AuditLog.find();
            response.status(HTTP_STATUS.OK).json(auditLogs);
        } catch (error) {
            next(error);
        }
    },

    getAuditLogById: async (request, response, next) => {
        try {
            const auditLog = await AuditLog.findById(request.params.id);
            if (!auditLog) throw new AppError('Audit log not found', HTTP_STATUS.NOT_FOUND);
            response.status(HTTP_STATUS.OK).json(auditLog);
        } catch (error) {
            next(error);
        }
    },

    createAuditLog: async (request, response, next) => {
        try {
            const auditLog = await AuditLog.create({ ...request.body, created_by: request.user.id });
            response.status(HTTP_STATUS.CREATED).json(auditLog);
        } catch (error) {
            next(error);
        }
    },

    updateAuditLog: async (request, response, next) => {
        try {
            const { created_by: _ignored, ...changes } = request.body || {};
            const auditLog = await AuditLog.findByIdAndUpdate(request.params.id, { ...changes, updated_by: request.user.id });
            if (!auditLog) throw new AppError('Audit log not found', HTTP_STATUS.NOT_FOUND);
            response.status(HTTP_STATUS.OK).json(auditLog);
        } catch (error) {
            next(error);
        }
    },

    deleteAuditLog: async (request, response, next) => {
        try {
            const auditLog = await AuditLog.findByIdAndDelete(request.params.id);
            if (!auditLog) throw new AppError('Audit log not found', HTTP_STATUS.NOT_FOUND);
            response.status(HTTP_STATUS.OK).json(auditLog);
        } catch (error) {
            next(error);
        }
    },
}

module.exports = AuditLogController;
