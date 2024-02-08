const express = require('express');
const router = express.Router();
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');

// Welcome Page
router.get('/', forwardAuthenticated, (req, res) => res.render('homepage'));

// Dashboard
router.get('/home', ensureAuthenticated, (req, res) =>
  res.render('homepage', {
    user: req.user
  })
);

module.exports = router;
