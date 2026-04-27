require('dotenv').config();
const express = require('express');
const path = require('path');
const session = require('express-session');
const { PrismaSessionStore } = require('@quixo3/prisma-session-store');
const { PrismaClient } = require('@prisma/client');
const passport = require('./config/passport');
const flash = require('connect-flash');

const authRouter = require('./routes/authRouter');
const folderRouter = require('./routes/folderRouter');
const fileRouter = require('./routes/fileRouter');
const shareRouter = require('./routes/shareRouter');
const indexController = require('./controllers/indexController');

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: new PrismaSessionStore(new PrismaClient(), {
      checkPeriod: 2 * 60 * 1000,
      dbRecordIdIsSessionId: true,
      dbRecordIdFunction: undefined,
    }),
    cookie: { maxAge: 7 * 24 * 60 * 60 * 1000 },
  })
);

app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
  res.locals.user = req.user || null;
  next();
});

app.get('/', indexController.getIndex);
app.use('/', authRouter);
app.use('/folders', folderRouter);
app.use('/files', fileRouter);
app.use('/share', shareRouter);

app.use((err, req, res, next) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).send('File is too large. Maximum size is 10MB.');
  }
  if (err.message && err.message.includes('File type not allowed')) {
    return res.status(400).send(err.message);
  }
  next(err);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});