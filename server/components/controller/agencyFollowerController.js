const AgencyFollower = require('../models/agencyFollowerModel');
const { HTTP_STATUS } = require('../config/constants');
const { AppError } = require('../middleware/errorHandler');

const AgencyFollowerController = {

    getAllAgencyFollowers: async (request, response, next) => {
        try {
            const agencyFollowers = await AgencyFollower.find();
            response.status(HTTP_STATUS.OK).json(agencyFollowers);
        } catch (error) {
            next(error);
        }
    },

    getAgencyFollowerById: async (request, response, next) => {
        try {
            const agencyFollower = await AgencyFollower.findById(request.params.id);
            if (!agencyFollower) throw new AppError('Agency follower not found', HTTP_STATUS.NOT_FOUND);
            response.status(HTTP_STATUS.OK).json(agencyFollower);
        } catch (error) {
            next(error);
        }
    },

    createAgencyFollower: async (request, response, next) => {
        try {
            const agencyFollower = await AgencyFollower.create(request.body || {});
            response.status(HTTP_STATUS.CREATED).json(agencyFollower);
        } catch (error) {
            next(error);
        }
    },

    updateAgencyFollower: async (request, response, next) => {
        try {
            const agencyFollower = await AgencyFollower.findByIdAndUpdate(request.params.id, request.body || {});
            if (!agencyFollower) throw new AppError('Agency follower not found', HTTP_STATUS.NOT_FOUND);
            response.status(HTTP_STATUS.OK).json(agencyFollower);
        } catch (error) {
            next(error);
        }
    },

    deleteAgencyFollower: async (request, response, next) => {
        try {
            const agencyFollower = await AgencyFollower.findByIdAndDelete(request.params.id);
            if (!agencyFollower) throw new AppError('Agency follower not found', HTTP_STATUS.NOT_FOUND);
            response.status(HTTP_STATUS.OK).json(agencyFollower);
        } catch (error) {
            next(error);
        }
    },
}

module.exports = AgencyFollowerController;
