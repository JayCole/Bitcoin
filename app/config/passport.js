// more info here 
// https://stackoverflow.com/questions/15711127/express-passport-node-js-error-handling

var LocalStrategy    = require('passport-local').Strategy;

// load up the user model
var User = require('../models/userModel');
//use to resetpassword

var async = require('async');
var crypto = require('crypto');
var nodemailer = require('nodemailer');

module.exports = function(passport) {

    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });

    // =========================================================================
    // LOCAL LOGIN =============================================================
    // =========================================================================
    passport.use('local-login', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
    },
    function(req, email, password, done) {
        if (email)
            email = email.toLowerCase(); // Use lower-case e-mails to avoid case-sensitive e-mail matching

        // asynchronous
        process.nextTick(function() {
			//User.findByEmail(email,
            User.findOne({ 'email' :  email },
			function(err, user) {
                // if there are any errors, return the error
                if (err)
                    return done(err);

                // if no user is found, return the message
                if (!user)
                    return done(null, false, req.flash('loginMessage', 'No user found.'));

                if (!user.validPassword(password))
                    return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.'));

                // all is well, return user
                else
					
                    return done(null, user);
            });
        });

    }));

    // =========================================================================
    // LOCAL SIGNUP ============================================================
    // =========================================================================
    passport.use('local-signup', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
    },
    function(req, email, password, done) {
        if (email)
            email = email.toLowerCase(); // Use lower-case e-mails to avoid case-sensitive e-mail matching
		console.log("====================  Password reset in signup =========================");
        // asynchronous
        process.nextTick(function() {
            // if the user is not already logged in:
            if (!req.user) {
                User.findOne({ 'email' :  email }, function(err, user) {
                    // if there are any errors, return the error
                    if (err)
                        return done(err);

                    // check to see if theres already a user with that email
                    if (user) {						
                        return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
						
                    } else {
						console.log("userName: ", req.body.username);
                        // create the user
                        var newUser = new User();
						newUser.username = req.body.username;
                        newUser.email = email;
                        newUser.password = newUser.generateHash(password);
						newUser.type = req.body.usertype;
						newUser.permissions = req.body.permissions;
						newUser.resetToken = undefined;
						newUser.resetTokenExpires = undefined;
                        newUser.save(function(err) {
                            if (err)
                                return done(err);

                            return done(null, newUser);
                        });
                    }

                });
            // if the user is logged in but has no local account...
            } else if ( !req.user.email ) {
                // ...presumably they're trying to connect a local account
                // BUT let's check if the email used to connect a local account is being used by another user
                User.findOne({ 'email' :  email }, function(err, user) {
                    if (err)
                        return done(err);
                    
                    if (user) {
                        return done(null, false, req.flash('loginMessage', 'That email is already taken.'));
                        // Using 'loginMessage instead of signupMessage because it's used by /connect/local'
                    } else {
                        var user = req.user;
                        user.email = email;
                        user.password = user.generateHash(password);
                        user.save(function (err) {
                            if (err)
                                return done(err);
                            
                            return done(null,user);
                        });
                    }
                });
            } else {
                // user is logged in and already has a local account. Ignore signup. (You should log out before trying to create a new account, user!)
                return done(null, req.user);
            }

        });

    }));
	// =========================================================================
    // LOCAL RESET  ============================================================
    // =========================================================================
    passport.use('local-reset', new LocalStrategy(
		{
			// by default, local strategy uses username and password, we will override with email
			usernameField : 'email',
			passwordField : 'password',
			passReqToCallback : true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
		},
	function(req, email, password, done) {
		//console.log(req);
		console.log("====================  Password reset =========================");
		console.log("====================  Token =========================",req.isAuthenticated()); 
		User.findOne({ 
		  resetToken: req.token, 
		  resetTokenExpires: { $gt: Date.now() } },
		  function(err, user) {
			console.log("====================  Token =========================",req.token);  
			if (!user) {
				console.log("====================  Token Failed ========================="); 
				return done(null, false, req.flash('resetMessage', 'Password reset token is invalid or has expired.'));
			}else{
				console.log("====================  Token Passed ========================="); 
				// add code for reset here
					
      console.log("====================  Password reset in set up =========================");
				user.password = newUser.generateHash(password);
				user.resetToken = undefined;
				user.resetTokenExpires = undefined;
				user.save(function(err) {
					if (err){
						return done(err);
					}
					return done(null, user);
				});
			
			}				
		  }
		);
	}));
	
    // =========================================================================
    // LOCAL FORGOT ============================================================
    // =========================================================================
	
	passport.use('local-forgot', new LocalStrategy(
		{
			// by default, local strategy uses username and password, we will override with email
			usernameField : 'email',
			passwordField : 'password',
			passReqToCallback : true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
		},
	  function(req, email, password, done) {
		// asynchronous
		//console.log('================  FORGOT: ',email);
		
        process.nextTick(function() {
			var token = "";
			if (email){
				email = email.toLowerCase(); // Use lower-case e-mails to avoid case-sensitive e-mail matching
				//console.log('================  email 2:',email);
				crypto.randomBytes(20, function(err, buf) {
					token = buf.toString('hex');
					//console.log('================  token :',token);
						
					User.findOne({ email: email }, function(err, user) {
						//console.log('================ User :',user);  
						if (!user) {
							return done(null, false, req.flash('resetMessage', 'No account with that email address exists.'));
						}else{
							
							user.resetToken = token;
							user.resetTokenExpires = Date.now() + (3600000 * 2); // 2 hour
							
							user.save(function(err) {
							  if (err){
								  return done(err);
							  }else{
								  console.log("-----------User token Saved-------------")
							  }
							});
							console.log("----------------- email token ----------------")
							var smtpTransport = nodemailer.createTransport({
								service: 'Gmail',																	
								auth: {
								  user: 'someEmail@gmail.com',
								  pass: 'password1234'
								}
							});
							var mailOptions = {
								to: user.email,
								from: 'someEmail@gmail.com',
								subject: 'Node.js Password Reset',
								text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
								  'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
								  'http://' + req.headers.host + '/reset/' + token + '\n\n' +
								  'If you did not request this, please ignore this email and your password will remain unchanged.\n'
							};

							smtpTransport.sendMail(mailOptions, function(err) {
								req.flash('info', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
								
								console.log('----- An e-mail has been sent to ' + user.email );
								return done(null, user);
							});
						}						
					});							
				});						   
			}
		});
		
	}));
}
