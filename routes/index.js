/* eslint-disable */
const express = require('express');
const AppController = require('../controllers/AppController');

const router = express.Router();

// Route: GET /status
router.get('/status', AppController.getStatus);

// Route: GET /stats
router.get('/stats', AppController.getStats);

module.exports = router;
