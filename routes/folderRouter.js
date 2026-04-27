const { Router } = require('express');
const folderController = require('../controllers/folderController');
const shareController = require('../controllers/shareController');
const { ensureLoggedIn } = require('../middleware/auth');

const router = Router();

router.use(ensureLoggedIn);

router.get('/new', folderController.getNewFolderForm);
router.post('/new', folderController.postNewFolder);
router.get('/:id', folderController.getFolder);
router.get('/:id/edit', folderController.getEditFolderForm);
router.post('/:id/edit', folderController.postEditFolder);
router.post('/:id/delete', folderController.postDeleteFolder);
router.get('/:id/share', shareController.getShareForm);
router.post('/:id/share', shareController.postCreateShareLink);

module.exports = router;