const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const prisma = require('../prisma/client');

const validateSignUp = [
  body('email')
    .isEmail().withMessage('Please enter a valid email.')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters.'),
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match.');
      }
      return true;
    }),
];

function getSignUp(req, res) {
  res.render('sign-up', { title: 'Sign Up', errors: [], formData: {} });
}

async function postSignUp(req, res) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).render('sign-up', {
      title: 'Sign Up',
      errors: errors.array(),
      formData: req.body,
    });
  }

  const { email, password } = req.body;

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).render('sign-up', {
        title: 'Sign Up',
        errors: [{ msg: 'An account with that email already exists.' }],
        formData: req.body,
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.user.create({ data: { email, password: hashedPassword } });
    res.redirect('/login');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error creating account.');
  }
}

function getLogin(req, res) {
  res.render('login', {
    title: 'Log In',
    errors: req.flash('error'),
  });
}

function postLogout(req, res, next) {
  req.logout((err) => {
    if (err) return next(err);
    res.redirect('/login');
  });
}

module.exports = { validateSignUp, getSignUp, postSignUp, getLogin, postLogout };