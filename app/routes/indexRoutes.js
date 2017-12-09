
var User = require('../models/userModel');
var acc = require('./accessMiddle');
var express = require('express');
var router = express.Router();
module.exports = function(passport) {

	// normal routes ===============================================================

    // show the home page (will also have our login links)
    router.get('/', function(req, res) {
        res.render('index.ejs');
    });

    // PROFILE SECTION =========================
	console.log("\n ===============Profile routed from login: ========================== \n");
    router.get('/profile', acc.isLoggedIn, function(req, res) {
		console.log("profile: ", req.user);
		console.log("\n ==================================================================== \n");
	
        res.render('profile.ejs', {
            user : req.user
        });
    });
	
	// PROFILE SECTION =========================
    router.get('/profile/:username', acc.isLoggedIn, function(req, res) {
		
        res.render('profile.ejs', {
			userName :req.params.username,
            user : req.user
        });
    });

    // LOGOUT ==============================
    router.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });

// =============================================================================
// AUTHENTICATE (FIRST LOGIN) ==================================================
// =============================================================================

    // locally --------------------------------
        // LOGIN ===============================
        // show the login form
        router.get('/login', acc.isNotLoggedIn, function(req, res) {
			console.log("/login logged in ",req.isAuthenticated())
            res.render('login.ejs', { message: req.flash('loginMessage') });
        });

        // process the login form
        router.post('/login', passport.authenticate('local-login', {
            successRedirect : '/profile', // redirect to the secure profile section
            failureRedirect : '/login', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));

        // SIGNUP =================================
        // show the signup form
        router.get('/signup', acc.isNotLoggedIn, function(req, res) {
			console.log("/sign up logged in ",req.isAuthenticated())
            res.render('signup.ejs', { message: req.flash('signupMessage') });
        });

        // process the signup form
        router.post('/signup', passport.authenticate('local-signup', {
            successRedirect : '/profile', // redirect to the secure profile section
            failureRedirect : '/signup', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));
		
// =====================================================================
// =============== 	FORGOT ==============================================
// 					Based on info from here
//  http://sahatyalkabov.com/how-to-implement-password-reset-in-nodejs/
// ======================================================================

		router.get('/forgot', function(req, res) {			
			res.render('forgot', {
				message: req.flash('forgotMessage','Request Password reset'),
			});
		});
		
		 // process the signup form
        router.post('/forgot', passport.authenticate('local-forgot', {
            successRedirect : '/request', // redirect to the reset notice
            failureRedirect : '/', // redirect back if there is an error
            failureFlash : true // allow flash messages
		}));
		
// =====================================================================
// =============== 	RESET ==============================================
// 		Based on info from here and configured for midware
//  http://sahatyalkabov.com/how-to-implement-password-reset-in-nodejs/
// =====================================================================
	router.get('/reset',function(req,res){
		res.render('reset', {
				message: req.flash('resetMessage','Request Password reset'),
			});
	});
	
	router.get('/reset/:token', function(req, res) {
		console.log("====================  Password reset =========================");

		User.findOne({ resetToken: req.params.token, resetTokenExpires: { $gt: Date.now() } }, function(err, user) {
			if (!user) {
				console.log("====================  Token Failed ========================="); 
			  req.flash('error', 'Password reset token is invalid or has expired.');
			  return res.redirect('/forgot');
			}else{
				console.log("====================  Token Passed  Render Reset ========================"); 
				req.user = user;
				req.token = req.params.token;
				
				res.render('reset', {
				  user: req.user
				});					
			}			
		});
	});
	
	router.post('/reset', function(req, res) {
				
        console.log('----post-----',req.body);
		var errors = validateForm(req);
		
		if (!req.body.email || !req.body.password) {
			return res.redirect('back');
		}else{
			User.findOne({ 
				email: req.body.email, 
				resetTokenExpires: { $gt: Date.now() }
				}, 
			function(err, user) {
				if (!user) {
					return res.redirect('back');
				}else{
                     //var newUser = new User();   
					user.password = user.generateHash(req.body.password);
					user.resetToken = "";
					// should change this resetTokenExprire
					user.resetTokenExpires = new Date();
					
					user.save(function(err) {
						res.render('profile', {
							user: user
						});
					});  
					return;
				}
				
			});	
		}
			
    });
	
	/*
	// process the reset form
        router.post('/reset', passport.authenticate('local-reset', {
            successRedirect : '/profile', // redirect to the secure profile section
            failureRedirect : '/forgot', // redirect back if there is an error
            failureFlash : true // allow flash messages
        }));
		
	/*
	router.get('/reset/:token', passport.authenticate('local-reset', {
            successRedirect : '/reset', // redirect to reset
            failureRedirect : '/forgot', // redirect back if there is an error
            failureFlash : true // allow flash messages
    }));
	*/
	router.get('/request',function(req,res){
		res.render('request', {
				message: req.flash('resetMessage','Request Password reset'),
			});
		
	});
	
	
	router.get('/notallowed',function(req,res){
	res.render('notallowed', {
			message: req.flash('resetMessage','Request Password reset'),
		});
	
	});
	
// =============================================================================
// AUTHORIZE (ALREADY LOGGED IN /) =============================================
// =============================================================================

    // locally --------------------------------
        router.get('/connect/local', function(req, res) {
            res.render('connect-local.ejs', { message: req.flash('loginMessage') });
        });
        router.post('/connect/local', passport.authenticate('local-signup', {
            successRedirect : '/profile', // redirect to the secure profile section
            failureRedirect : '/connect/local', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));

// =============================================================================
// UNLINK ACCOUNT =============================================================
// =============================================================================
// for local account, remove email and password
// user account will stay active in case they want to reconnect in the future

    // local -----------------------------------
    router.get('/unlink/local', acc.isLoggedIn, function(req, res) {
        var user      = req.user;
        user.email    = undefined;
        user.password = undefined;
        user.save(function(err) {
            res.redirect('/profile');
        });
    });
return router;
};


function validateForm(req){
	
	req.checkBody('email','Email is required').notEmpty();
	req.checkBody('email','Email is not valid').isEmail();
	req.checkBody('password','password is required').notEmpty();
	//req.checkBody('password2','Email in required').equals(res.body.password);
	var errors = req.validationErrors();
	return(errors);
}


