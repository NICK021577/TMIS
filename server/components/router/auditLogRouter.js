const router = require('express').Router();
const AuditLogController = require('../controller/auditLogController');
const authentication = require('../middleware/authentication');
const authorization = require('../middleware/authorization');

// Super Admin only
router.use(authentication);
router.use(authorization('Super Admin'));

router.get('/', AuditLogController.getAllAuditLogs);
router.get('/:id', AuditLogController.getAuditLogById);
router.post('/', AuditLogController.createAuditLog);
router.put('/:id', AuditLogController.updateAuditLog);
router.delete('/:id', AuditLogController.deleteAuditLog);

module.exports = router;
