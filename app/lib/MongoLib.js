/*
	mongodb requests Lib
	
*/
var 	    tools = require("./tools");
var 	     rest = require("./httpRequest").rest;
var 	       fs = require('fs');
//var 	 parseXML = require('xml2js').parseString;
var 	jsonQuery = require('json-query');

var  ServiceOrder = require('../models/models').ServiceOrder;
var 	 Employee = require('../models/models').Employee;

//===================== Mongodb configuration =================
var mongoose = require('mongoose');
var configDB = require('../config/database.js');
mongoose.Promise = global.Promise;
mongoose.connect(configDB.url); // connect to our database

var mongoObj = {
	
	// Mongodb Data Lookups
	getEmployeeMongo(oldObj, callback){
		 // series loop
		var resJson = ({}); 
		resJson['serviceOrder'] = [];
			
		function series(obj){
			if(obj){			
				if(obj.technician){
					Employee.findOne({id: obj.technician}).exec(function(err,doc){	  
						//console.log("L808 ---- msrest: ", typeof doc);
						//console.log("L809 ---- msrest   doc: ", doc);
						//console.log( doc === "null")
						if(err){
							throw err;
						}
						if(doc){
							
							obj.technician = doc.name;		
							
						} else {
							obj.technician = "unasigned";
						}								
										
						resJson.serviceOrder.push(obj);
						series(oldObj.shift());					
					});						
				}else{
					resJson.serviceOrder.push(obj);
						series(oldObj.shift());					
				}	
			}else{			
				callback('done',resJson);
			}
		};
		series(oldObj.shift());
	}, 

	async getOneEmployeeMongo(id){
		
		 // find employee by id
		var name =	"unasigned";	
		try{ 
			const doc =  await Employee.findOne({id: id}).exec();
			console.log("---- Doc",doc);
			if(doc){
				name = doc.name;		
			}		 
			return name;
			
		} catch(error){
			name =	"unasigned"
			return name;
		}
	},
	async simple(id){
		
		query = Employee.findOne({id: id});
		doc = await query.exec();
		if (doc){
			name = doc.name;
		}
		
		return name;
		
	},  	
	
	promised(id){
		var name = "unasigned";
		Employee.findOne({id: id}).then(doc => {
			if(!doc){
			   console.log("---- Doc",doc);	
				return name;
			}
			name = doc.name;
		}).catch(error => {	
			next(error);
		  });
	},
	onefind(id,callback){
		Employee.findOne({id: id}).exec(function(err,doc){	  
			console.log("L103 ---- MongoLib: ", typeof doc);
			console.log("               doc: ", doc);
			
			if(err){
				throw err;
			}
			if(doc){
				
				callback =  doc.name;		
				//console.log("---- Doc",doc);	
				
			} else {
				
				callback = "unasigned";
			}								
			
		});
		return;
	}
	
}

module.exports =  {mongoObj};
	
	var id = "0289df50-5af5-4c1a-aaa5-fdffc7281de2";
	//var name  = function(){ await mongoObj.onefind(id)}
	//console.log (mongoObj.onefind(id)); 
	
	var name  = mongoObj.promised(id);
	console.log("simple", name);

	
	
/*
	app.get(function (req, res, next) {
        Users.findOne({ id: id }).then(user => {
			if (!user) {
			  res.json({success: false, message: "id not found."});
			  return;
			}

			return Notifications.find({user: user._id}).then(notifications => {
					res.json({success: true, notifications});
					});
			).catch(error => {
				//console.error(error);
				//res.json({success: false, error: error.message});
				next(error);
			});
		});
	});	
*/	