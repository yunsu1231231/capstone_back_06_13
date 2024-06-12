const express = require('express');
const posts = require('./posts');
const auth = require('./auth');

const api = express.Router();

api.use('/posts', posts);
api.use('/auth', auth);

module.exports = api;
