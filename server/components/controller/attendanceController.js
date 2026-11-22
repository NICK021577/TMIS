const Attendance = require('../models/attendanceModel');
const { HTTP_STATUS } = require('../config/constants');
const { AppError } = require('../middleware/errorHandler');

const AttendanceController = {

    getAllAttendance: async (request, response, next) => {
        try {
            const attendanceList = await Attendance.find();
            response.status(HTTP_STATUS.OK).json(attendanceList);
        } catch (error) {
            next(error);
        }
    },

    getAttendanceById: async (request, response, next) => {
        try {
            const attendance = await Attendance.findById(request.params.id);
            if (!attendance) throw new AppError('Attendance not found', HTTP_STATUS.NOT_FOUND);
            response.status(HTTP_STATUS.OK).json(attendance);
        } catch (error) {
            next(error);
        }
    },

    createAttendance: async (request, response, next) => {
        try {
            const attendance = await Attendance.create(request.body || {});
            response.status(HTTP_STATUS.CREATED).json(attendance);
        } catch (error) {
            next(error);
        }
    },

    updateAttendance: async (request, response, next) => {
        try {
            const attendance = await Attendance.findByIdAndUpdate(request.params.id, request.body || {});
            if (!attendance) throw new AppError('Attendance not found', HTTP_STATUS.NOT_FOUND);
            response.status(HTTP_STATUS.OK).json(attendance);
        } catch (error) {
            next(error);
        }
    },

    deleteAttendance: async (request, response, next) => {
        try {
            const attendance = await Attendance.findByIdAndDelete(request.params.id);
            if (!attendance) throw new AppError('Attendance not found', HTTP_STATUS.NOT_FOUND);
            response.status(HTTP_STATUS.OK).json(attendance);
        } catch (error) {
            next(error);
        }
    },
}

module.exports = AttendanceController;
