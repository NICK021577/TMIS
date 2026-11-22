const RoleMenu = require('../models/roleMenuModel');
const { HTTP_STATUS } = require('../config/constants');
const { AppError } = require('../middleware/errorHandler');

const RoleMenuController = {

    getAllRoleMenus: async (request, response, next) => {
        try {
            const roleMenus = await RoleMenu.find();
            response.status(HTTP_STATUS.OK).json(roleMenus);
        } catch (error) {
            next(error);
        }
    },

    getRoleMenuById: async (request, response, next) => {
        try {
            const roleMenu = await RoleMenu.findById(request.params.id);
            if (!roleMenu) throw new AppError('Role menu not found', HTTP_STATUS.NOT_FOUND);
            response.status(HTTP_STATUS.OK).json(roleMenu);
        } catch (error) {
            next(error);
        }
    },

    createRoleMenu: async (request, response, next) => {
        try {
            const roleMenu = await RoleMenu.create({ ...request.body, created_by: request.user.id });
            response.status(HTTP_STATUS.CREATED).json(roleMenu);
        } catch (error) {
            next(error);
        }
    },

    updateRoleMenu: async (request, response, next) => {
        try {
            const { created_by: _ignored, ...changes } = request.body || {};
            const roleMenu = await RoleMenu.findByIdAndUpdate(request.params.id, { ...changes, updated_by: request.user.id });
            if (!roleMenu) throw new AppError('Role menu not found', HTTP_STATUS.NOT_FOUND);
            response.status(HTTP_STATUS.OK).json(roleMenu);
        } catch (error) {
            next(error);
        }
    },

    deleteRoleMenu: async (request, response, next) => {
        try {
            const roleMenu = await RoleMenu.findByIdAndDelete(request.params.id);
            if (!roleMenu) throw new AppError('Role menu not found', HTTP_STATUS.NOT_FOUND);
            response.status(HTTP_STATUS.OK).json(roleMenu);
        } catch (error) {
            next(error);
        }
    },
}

module.exports = RoleMenuController;
