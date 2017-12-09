// server.js
//
// https://github.com/scotch-io/easy-node-authentication
//
// see forgotten password
// http://sahatyalkabov.com/how-to-implement-password-reset-in-nodejs/

// get all the tools we need
var           reload = require('reload');
var           morgan = require('morgan');
var          express = require('express');
var       bodyParser = require('body-parser');
var           flash  = require('connect-flash');
var     cookieParser = require('cookie-parser');
var          session = require('express-session');
var expressValidator = require('express-validator');

var              app = express();
app.set('port', process.env.PORT || 8080 );

// configuration ==== MongoDB =================================================
	var     mongoose = require('mongoose');
	var     configDB = require('./config/database.js');
	mongoose.Promise = global.Promise;
	mongoose.connect(configDB.url); // connect to our database


// set up our express application =============================================
	app.use(expressValidator());
	app.use(morgan('dev')); // log every request to the console
	app.use(cookieParser()); // read cookies (needed for auth)
	app.use(bodyParser.json()); // get information from html forms
	app.use(bodyParser.urlencoded({ extended: true }));

	app.set('view engine', 'ejs'); // set up ejs for templating
	app.set('views', 'app/views');

// required for passport ======================================================
	var passport = require('passport');
	require('./config/passport')(passport); // pass passport for configuration
	app.use(session({
			// secret to any thing you like 
		secret: '8ea393a5e7de7150a9a47e7667a1645be6ee0bf0', // session secret
		resave: true,
		saveUninitialized: true
	}));
	app.use(passport.initialize());
	app.use(passport.session()); // persistent login sessions

// Messages
app.use(flash()); // use connect-flash for flash messages stored in session

// routes =====================================================================
// load our routes and pass in fully configured passport

var indexRoutes = require('./routes/indexRoutes.js')(passport); 
var testRoutes  = require('./routes/testRoutes.js')(passport);

app.use('/test', testRoutes);
app.use('/',     indexRoutes);
 
// launch =====================================================================
// start server! ==============================================================
var server = app.listen(app.get('port'), function() {
  console.log('Listening on port ' + app.get('port'));
});

reload(server, app);
