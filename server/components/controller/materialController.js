const Material = require('../models/materialModel');
const { HTTP_STATUS } = require('../config/constants');
const { AppError } = require('../middleware/errorHandler');

const MaterialController = {

    getAllMaterials: async (request, response, next) => {
        try {
            const materials = await Material.find();
            response.status(HTTP_STATUS.OK).json(materials);
        } catch (error) {
            next(error);
        }
    },

    getMaterialById: async (request, response, next) => {
        try {
            const material = await Material.findById(request.params.id);
            if (!material) throw new AppError('Material not found', HTTP_STATUS.NOT_FOUND);
            response.status(HTTP_STATUS.OK).json(material);
        } catch (error) {
            next(error);
        }
    },

    createMaterial: async (request, response, next) => {
        try {
            const material = await Material.create(request.body || {});
            response.status(HTTP_STATUS.CREATED).json(material);
        } catch (error) {
            next(error);
        }
    },

    updateMaterial: async (request, response, next) => {
        try {
            const material = await Material.findByIdAndUpdate(request.params.id, request.body || {});
            if (!material) throw new AppError('Material not found', HTTP_STATUS.NOT_FOUND);
            response.status(HTTP_STATUS.OK).json(material);
        } catch (error) {
            next(error);
        }
    },

    deleteMaterial: async (request, response, next) => {
        try {
            const material = await Material.findByIdAndDelete(request.params.id);
            if (!material) throw new AppError('Material not found', HTTP_STATUS.NOT_FOUND);
            response.status(HTTP_STATUS.OK).json(material);
        } catch (error) {
            next(error);
        }
    },
}

module.exports = MaterialController;
