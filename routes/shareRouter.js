const { Router } = require('express');
const { getSharedFolder } = require('../controllers/shareController');

const router = Router();

router.get('/:linkId', getSharedFolder);

module.exports = router;