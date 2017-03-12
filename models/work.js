var mongoose = require('mongoose');

var WorkSchema = mongoose.Schema({
	username: {
		type: String,
	},
	name: {
		type: String
	},
	bio: {
		type: String
	},
	title: {
		type: String
	},
	description: {
		type: String
	},
	link: {
		type: String
	}, 
	img: {
		type: String
	},   
	file: {
		type: String
	},
    num:{
		type: Number
	}}
);


var Work = module.exports = mongoose.model('Work', WorkSchema);


module.exports.createWork = function(username,newWork, callback){
	var x;
	Work.count({username: username}, function(err, x) {
    	if(x > '1') {
			console.log(x);
			newWork.num = '0';
		}
		else {
		newWork.num='1';
		}
    });
	newWork.save(callback);
}



module.exports.getUserByUsername = function(username, callback){
	var query = {username: username};
	Work.findOne(query, callback);
}


module.exports.getUserById = function(id, callback){
	Work.findById(id, callback);
}


