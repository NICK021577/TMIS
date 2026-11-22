const router = require('express').Router();
const CertificateRuleController = require('../controller/certificateRuleController');
const authentication = require('../middleware/authentication');

// every route needs a logged-in user
router.use(authentication);

router.get('/', CertificateRuleController.getAllCertificateRules);
router.get('/:id', CertificateRuleController.getCertificateRuleById);
router.post('/', CertificateRuleController.createCertificateRule);
router.put('/:id', CertificateRuleController.updateCertificateRule);
router.delete('/:id', CertificateRuleController.deleteCertificateRule);

module.exports = router;
