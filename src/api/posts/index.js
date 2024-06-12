const express = require('express');
const postHandler = require('./postHandler');
const checkLoggedIn = require('../../lib/checkLoggedIn');
const upload = require('../../lib/multer');  
const authMiddleware = require('../../lib/authMiddleware')


// 'posts' 관련 라우트 생성
const posts = express.Router(); 

/*
// 기본 'posts' 라우트에 대한 요청 처리
posts.get('/', postHandler.list);
posts.post('/', checkLoggedIn, postHandler.write);
*/  

// 게시물 생성
posts.post('/createPost', authMiddleware.authMiddleware, checkLoggedIn, upload.single('photo'), postHandler.createPost);
posts.patch('/updatePost', authMiddleware.authMiddleware, checkLoggedIn, postHandler.updatePost);
posts.delete('/deletePost', authMiddleware.authMiddleware, checkLoggedIn, postHandler.deletePost);
posts.patch('/likePost', authMiddleware.authMiddleware,checkLoggedIn,postHandler.likePost);
posts.get('/searchPosts', postHandler.searchPosts);
posts.post('/comment', authMiddleware.authMiddleware, checkLoggedIn, postHandler.comment);
posts.get('/getPhoto', postHandler.getPhoto);
posts.get('/listPosts', postHandler.listPosts);




posts.patch('/instagramtag',authMiddleware.authMiddleware, checkLoggedIn, postHandler.instagramtag);
posts.post('/record',authMiddleware.authMiddleware, checkLoggedIn, postHandler.record);
posts.get('/getrecord',authMiddleware.authMiddleware, checkLoggedIn, postHandler.getrecord);
posts.get('/getcomment',authMiddleware.authMiddleware, checkLoggedIn, postHandler.getcomment);


posts.get('/listPosts', postHandler.listPosts);
posts.post('/comment',authMiddleware.authMiddleware, checkLoggedIn, postHandler.comment);



module.exports = posts; 

