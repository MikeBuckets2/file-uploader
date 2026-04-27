const prisma = require('../prisma/client');

async function getFolder(req, res) {
  try {
    const folder = await prisma.folder.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { files: { orderBy: { createdAt: 'desc' } } },
    });

    if (!folder || folder.userId !== req.user.id) {
      return res.status(404).send('Folder not found.');
    }

    res.render('folder', { title: folder.name, folder });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error loading folder.');
  }
}

function getNewFolderForm(req, res) {
  res.render('folder-form', {
    title: 'New Folder',
    folder: null,
    error: null,
  });
}

async function postNewFolder(req, res) {
  const name = req.body.name ? req.body.name.trim() : '';

  if (!name) {
    return res.status(400).render('folder-form', {
      title: 'New Folder',
      folder: null,
      error: 'Folder name is required.',
    });
  }

  try {
    await prisma.folder.create({ data: { name, userId: req.user.id } });
    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error creating folder.');
  }
}

async function getEditFolderForm(req, res) {
  try {
    const folder = await prisma.folder.findUnique({
      where: { id: parseInt(req.params.id) },
    });

    if (!folder || folder.userId !== req.user.id) {
      return res.status(404).send('Folder not found.');
    }

    res.render('folder-form', { title: 'Rename Folder', folder, error: null });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error loading folder.');
  }
}

async function postEditFolder(req, res) {
  const id = parseInt(req.params.id);
  const name = req.body.name ? req.body.name.trim() : '';

  if (!name) {
    const folder = await prisma.folder.findUnique({ where: { id } });
    return res.status(400).render('folder-form', {
      title: 'Rename Folder',
      folder,
      error: 'Folder name is required.',
    });
  }

  try {
    const folder = await prisma.folder.findUnique({ where: { id } });
    if (!folder || folder.userId !== req.user.id) {
      return res.status(404).send('Folder not found.');
    }

    await prisma.folder.update({ where: { id }, data: { name } });
    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error updating folder.');
  }
}

async function postDeleteFolder(req, res) {
  const id = parseInt(req.params.id);

  try {
    const folder = await prisma.folder.findUnique({ where: { id } });
    if (!folder || folder.userId !== req.user.id) {
      return res.status(404).send('Folder not found.');
    }

    await prisma.folder.delete({ where: { id } });
    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error deleting folder.');
  }
}

module.exports = {
  getFolder,
  getNewFolderForm,
  postNewFolder,
  getEditFolderForm,
  postEditFolder,
  postDeleteFolder,
};