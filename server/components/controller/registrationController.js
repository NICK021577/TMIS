const Registration = require('../models/registrationModel');
const { HTTP_STATUS } = require('../config/constants');
const { AppError } = require('../middleware/errorHandler');

const RegistrationController = {

    getAllRegistrations: async (request, response, next) => {
        try {
            const registrations = await Registration.find();
            response.status(HTTP_STATUS.OK).json(registrations);
        } catch (error) {
            next(error);
        }
    },

    getRegistrationById: async (request, response, next) => {
        try {
            const registration = await Registration.findById(request.params.id);
            if (!registration) throw new AppError('Registration not found', HTTP_STATUS.NOT_FOUND);
            response.status(HTTP_STATUS.OK).json(registration);
        } catch (error) {
            next(error);
        }
    },

    createRegistration: async (request, response, next) => {
        try {
            const registration = await Registration.create(request.body || {});
            response.status(HTTP_STATUS.CREATED).json(registration);
        } catch (error) {
            next(error);
        }
    },

    updateRegistration: async (request, response, next) => {
        try {
            const registration = await Registration.findByIdAndUpdate(request.params.id, request.body || {});
            if (!registration) throw new AppError('Registration not found', HTTP_STATUS.NOT_FOUND);
            response.status(HTTP_STATUS.OK).json(registration);
        } catch (error) {
            next(error);
        }
    },

    deleteRegistration: async (request, response, next) => {
        try {
            const registration = await Registration.findByIdAndDelete(request.params.id);
            if (!registration) throw new AppError('Registration not found', HTTP_STATUS.NOT_FOUND);
            response.status(HTTP_STATUS.OK).json(registration);
        } catch (error) {
            next(error);
        }
    },
}

module.exports = RegistrationController;
