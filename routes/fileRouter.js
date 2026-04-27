const { Router } = require('express');
const controller = require('../controllers/fileController');
const { ensureLoggedIn } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = Router();

router.use(ensureLoggedIn);

router.post('/upload', upload.single('file'), controller.postUploadFile);
router.post('/upload/:folderId', upload.single('file'), controller.postUploadFile);
router.get('/:id', controller.getFileDetail);
router.get('/:id/download', controller.getDownloadFile);
router.post('/:id/delete', controller.postDeleteFile);

module.exports = router;