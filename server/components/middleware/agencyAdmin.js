const { HTTP_STATUS } = require("../config/constants");
const { workspacesOf, ADMIN_ROLE } = require("../utils/workspace");

/**
 * Lets only Agency Administrators through, and records which agency they manage.
 * Use after `authentication`. Sets request.agency = { agencyId, membershipId, userId }.
 * The agency is the same one the console signed them in to (their oldest active membership).
 */
module.exports = async (request, response, next) => {
  try {
    const { workspaces } = await workspacesOf(request.user.id);
    const current = workspaces[0];

    if (!current || current.role.name !== ADMIN_ROLE) {
      return response.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        message: "Only Agency Administrators can manage agency settings.",
      });
    }

    request.agency = {
      agencyId: current.agency.id,
      membershipId: current.membership.id,
      userId: request.user.id,
    };
    next();
  } catch (error) {
    next(error);
  }
};
