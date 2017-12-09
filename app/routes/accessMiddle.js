// route middleware to ensure user is logged in
var access = {
	
	isLoggedIn(req, res, next) {
	
		if (req.isAuthenticated()){
			
			logInfo('Is Logged In',req);
			
			
			return next();
		}
		res.redirect('/notallowed');
	},

	isNotLoggedIn(req, res, next) {
		if (!req.isAuthenticated()){		
			return next();
		}		
		req.logout();
		res.redirect('/notallowed');
	},

	userMatchAccess(req, res, next) {

		if (req.isAuthenticated()){
			logInfo('User Matched Login',req);
			var perm = req.user.permissions;
			perm = perm.toLowerCase();
			if(perm == "admin" || perm == "full"){
				return next();
			}
			if(req.user.username == req.params.leadId){
				return next();
			}
		}
		res.redirect('/notallowed');
	},

	adminRights(req, res, next){

		if (req.isAuthenticated()){
			logInfo('Admin Rights',req);
			var perm = req.user.permissions;
			perm = perm.toLowerCase();
			if(perm == "admin" || perm == "full"){
				return next();
			}
		}
		res.redirect('/notallowed');
	},

	fullRights(req, res, next) {
	
		if (req.isAuthenticated()){
			logInfo('Full Rights',req);
			var perm = req.user.permissions;
			perm = perm.toLowerCase();
			if(perm == "full"){
				return next();
			}
		}
		res.redirect('/notallowed');
	}
}	
module.exports = access;

function logInfo (caller, req){
	
	console.log("\n ==== === MIDDLEWARE LOGGING === === User has " + caller + " === === \n");
	console.log(" User       : ", req.user);
	console.log(" Authen.    : ",req.isAuthenticated());
	console.log(" permissions: ", req.user.permissions);	
	console.log(" REQ.params : ", req.params);
	
	console.log("\n =================================================================== \n");
}