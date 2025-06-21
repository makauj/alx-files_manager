/* eslint-disable */
const express = require('express');
const AppController = require('../controllers/AppController');
const UsersController = require('../controllers/UsersController');
const AuthController = require('../controllers/Authcontroller')
const router = express.Router();

// Route: GET /status
router.get('/status', AppController.getStatus);

// Route: GET /stats
router.get('/stats', AppController.getStats);
router.post('/users', UsersController.createUser);
router.get('/connect', AuthController.getConnect);
router.get('/disconnect', AuthController.getDisconnect);
router.get('/users/me', UsersController.getMe);

module.exports = router;
