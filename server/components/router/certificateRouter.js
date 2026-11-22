const router = require('express').Router();
const CertificateController = require('../controller/certificateController');
const authentication = require('../middleware/authentication');

// every route needs a logged-in user
router.use(authentication);

router.get('/', CertificateController.getAllCertificates);
router.get('/:id', CertificateController.getCertificateById);
router.post('/', CertificateController.createCertificate);
router.put('/:id', CertificateController.updateCertificate);
router.delete('/:id', CertificateController.deleteCertificate);

module.exports = router;
