const express = require('express');
const authHandler = require('./authHandler');
const authMiddleware = require('../../lib/authMiddleware')
const checkLoggedIn = require('../../lib/checkLoggedIn');

const auth = express.Router();

auth.post('/register', authHandler.register);
auth.post('/login', authHandler.login);
auth.get('/check', authMiddleware.authMiddleware, authHandler.check);
auth.post('/logout', authHandler.logout);
auth.put('/recordData', authHandler.recordData);

auth.get('/getTrainers',authHandler.getTrainers); 
auth.get('/getTrainerRequests',authMiddleware.authMiddleware, checkLoggedIn, authHandler.getTrainers); 

auth.post('/requestCoaching', authMiddleware.authMiddleware, checkLoggedIn, authHandler.requestCoaching); 

auth.get('/getTrainerIdByUserId/:user_id', authHandler.getTrainerIdByUserId); 

auth.patch('/acceptRequest', authHandler.acceptRequest); 
auth.post('/registerDiet', authHandler.registerDiet); 
auth.get('/payload',authMiddleware.authMiddleware,authHandler.payload);

auth.get('/api/exercise/video/:exerciseId', authHandler.getVideoByExerciseId);
auth.put('/setNotification', authHandler.setNotification);
auth.get('/users/:userId/exercises', authHandler.getExercisesByUserId);

module.exports = auth;
    