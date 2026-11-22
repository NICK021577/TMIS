const Staffing = require('../models/staffingModel');
const { HTTP_STATUS } = require('../config/constants');
const { AppError } = require('../middleware/errorHandler');

const StaffingController = {

    getAllStaffing: async (request, response, next) => {
        try {
            const staffingList = await Staffing.find();
            response.status(HTTP_STATUS.OK).json(staffingList);
        } catch (error) {
            next(error);
        }
    },

    getStaffingById: async (request, response, next) => {
        try {
            const staffing = await Staffing.findById(request.params.id);
            if (!staffing) throw new AppError('Staffing not found', HTTP_STATUS.NOT_FOUND);
            response.status(HTTP_STATUS.OK).json(staffing);
        } catch (error) {
            next(error);
        }
    },

    createStaffing: async (request, response, next) => {
        try {
            const staffing = await Staffing.create({ ...request.body, created_by: request.user.id });
            response.status(HTTP_STATUS.CREATED).json(staffing);
        } catch (error) {
            next(error);
        }
    },

    updateStaffing: async (request, response, next) => {
        try {
            const { created_by: _ignored, ...changes } = request.body || {};
            const staffing = await Staffing.findByIdAndUpdate(request.params.id, { ...changes, updated_by: request.user.id });
            if (!staffing) throw new AppError('Staffing not found', HTTP_STATUS.NOT_FOUND);
            response.status(HTTP_STATUS.OK).json(staffing);
        } catch (error) {
            next(error);
        }
    },

    deleteStaffing: async (request, response, next) => {
        try {
            const staffing = await Staffing.findByIdAndDelete(request.params.id);
            if (!staffing) throw new AppError('Staffing not found', HTTP_STATUS.NOT_FOUND);
            response.status(HTTP_STATUS.OK).json(staffing);
        } catch (error) {
            next(error);
        }
    },
}

module.exports = StaffingController;
