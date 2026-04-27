const prisma = require('../prisma/client');

async function postUploadFile(req, res) {
  const folderId = req.params.folderId ? parseInt(req.params.folderId) : null;
  const redirectTo = folderId ? `/folders/${folderId}` : '/';

  if (!req.file) {
    return res.redirect(redirectTo);
  }

  try {
    await prisma.file.create({
      data: {
        name: req.file.originalname,
        size: req.file.size,
        url: req.file.path,
        userId: req.user.id,
        folderId,
      },
    });

    res.redirect(redirectTo);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error saving file.');
  }
}

async function getFileDetail(req, res) {
  try {
    const file = await prisma.file.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { folder: true },
    });

    if (!file || file.userId !== req.user.id) {
      return res.status(404).send('File not found.');
    }

    res.render('file-detail', { title: file.name, file });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error loading file details.');
  }
}

async function getDownloadFile(req, res) {
  try {
    const file = await prisma.file.findUnique({
      where: { id: parseInt(req.params.id) },
    });

    if (!file || file.userId !== req.user.id) {
      return res.status(404).send('File not found.');
    }

    const downloadUrl = file.url.replace('/upload/', '/upload/fl_attachment/');
    res.redirect(downloadUrl);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error downloading file.');
  }
}

async function postDeleteFile(req, res) {
  try {
    const file = await prisma.file.findUnique({
      where: { id: parseInt(req.params.id) },
    });

    if (!file || file.userId !== req.user.id) {
      return res.status(404).send('File not found.');
    }

    const folderId = file.folderId;
    await prisma.file.delete({ where: { id: file.id } });

    res.redirect(folderId ? `/folders/${folderId}` : '/');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error deleting file.');
  }
}

module.exports = { postUploadFile, getFileDetail, getDownloadFile, postDeleteFile };