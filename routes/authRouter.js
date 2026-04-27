const { Router } = require('express');
const passport = require('passport');
const controller = require('../controllers/authController');

const router = Router();

router.get('/sign-up', controller.getSignUp);
router.post('/sign-up', controller.validateSignUp, controller.postSignUp);

router.get('/login', controller.getLogin);
router.post(
  '/login',
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true,
  })
);

router.post('/logout', controller.postLogout);

module.exports = router;