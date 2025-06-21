/* eslint-disable */
const express = require('express');
const AppController = require('../controllers/AppController');
const UsersController = require('../controllers/UsersController');
const AuthController = require('../controllers/Authcontroller')

const router = express.Router();

router.get('/status', AppController.getStatus);
router.get('/stats', AppController.getStats);

// User creation route
router.post('/users', UsersController.createUser);

// Authentication routes
router.get('/connect', AuthController.getConnect);
router.get('/disconnect', AuthController.getDisconnect);

// User routes
router.get('/users/me', UsersController.getMe);

module.exports = router;
