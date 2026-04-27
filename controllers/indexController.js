const prisma = require('../prisma/client');

async function getIndex(req, res) {
  if (!req.isAuthenticated()) {
    return res.render('index', {
      title: 'File Uploader',
      folders: [],
      looseFiles: [],
    });
  }

  try {
    const folders = await prisma.folder.findMany({
      where: { userId: req.user.id },
      include: { _count: { select: { files: true } } },
      orderBy: { createdAt: 'desc' },
    });

    const looseFiles = await prisma.file.findMany({
      where: { userId: req.user.id, folderId: null },
      orderBy: { createdAt: 'desc' },
    });

    res.render('index', { title: 'My Files', folders, looseFiles });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error loading dashboard.');
  }
}

module.exports = { getIndex };