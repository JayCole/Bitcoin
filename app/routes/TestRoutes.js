

var User = require('../models/userModel');
var acc = require('./accessMiddle');
var express = require('express');
var router = express.Router();

module.exports = function(passport) {

 // Open Access SECTION =========================
    router.get('/openaccess', function(req, res) {
		var username="";
	    if(!req.user){
			username = "Not signed in"
		}else{
			username = req.user.username
		}
			
        res.render('testViews/openaccess.ejs',{
			message  : 'on login Required',
			username : username,
			pageTitle: 'Open-Access',
			pageID   : 'openaccess'
		}
		);
    });
	
	// Limited Access SECTION =========================
    router.get('/limitedaccess', acc.isLoggedIn, function(req, res) {
		if(req.user){
			res.render('testViews/limitedaccess.ejs', {
				username : req.user.username,
				user : req.user
			});			
		}else{
			
			res.render('limitedaccess.ejs', {
				username : "no one",
			});	
		}
        
    });
	
    // Limited Access with name SECTION =========================
    router.get('/limitedaccess/:username', acc.userMatchAccess, function(req, res) {
		
		res.render('testViews/profileaccess.ejs', {
			username : req.params.username,
			user : req.user
		});			
	});
	
    // Admin Access ==============================
    router.get('/adminaccess', acc.adminRights, function(req, res) {
        
		res.render('testViews/adminaccess.ejs', {
			username : req.user.username,
			user : req.user
        });
		
    });
	
     // Full Access ==============================
    router.get('/fullaccess', acc.fullRights, function(req, res) {
        
		res.render('testViews/fullaccess.ejs', {
			username : req.user.username,
			user : req.user
        });
    });
	
	return router;
};