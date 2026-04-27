const prisma = require('../prisma/client');

async function getShareForm(req, res) {
  try {
    const folder = await prisma.folder.findUnique({
      where: { id: parseInt(req.params.id) },
    });

    if (!folder || folder.userId !== req.user.id) {
      return res.status(404).send('Folder not found.');
    }

    res.render('share-form', { title: 'Share Folder', folder, error: null });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error loading share form.');
  }
}

async function postCreateShareLink(req, res) {
  const folderId = parseInt(req.params.id);
  const days = parseInt(req.body.days);

  if (!days || days < 1 || days > 365) {
    const folder = await prisma.folder.findUnique({ where: { id: folderId } });
    return res.status(400).render('share-form', {
      title: 'Share Folder',
      folder,
      error: 'Enter a number of days between 1 and 365.',
    });
  }

  try {
    const folder = await prisma.folder.findUnique({ where: { id: folderId } });
    if (!folder || folder.userId !== req.user.id) {
      return res.status(404).send('Folder not found.');
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + days);

    const shareLink = await prisma.shareLink.create({
      data: { folderId, expiresAt },
    });

    res.redirect(`/share/${shareLink.id}`);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error creating share link.');
  }
}

async function getSharedFolder(req, res) {
  try {
    const shareLink = await prisma.shareLink.findUnique({
      where: { id: req.params.linkId },
      include: {
        folder: {
          include: { files: { orderBy: { createdAt: 'desc' } } },
        },
      },
    });

    if (!shareLink) {
      return res.status(404).send('Share link not found.');
    }

    if (new Date() > shareLink.expiresAt) {
      return res.status(410).send('This share link has expired.');
    }

    res.render('shared-folder', {
      title: shareLink.folder.name,
      folder: shareLink.folder,
      expiresAt: shareLink.expiresAt,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error loading shared folder.');
  }
}

module.exports = { getShareForm, postCreateShareLink, getSharedFolder };