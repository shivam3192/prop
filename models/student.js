var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');

// User Schema
var StudentSchema = mongoose.Schema({
	name: {
		type: String,
		index:true
	},
	rollno: {
		type: String
	},
	credit: {
		type: String
	},
	sem: {
		type: String
	}
});

var Student = module.exports = mongoose.model('Student', StudentSchema);

module.exports.createUser = function(newStudent, callback){
	bcrypt.genSalt(10, function(err, salt) {
	    bcrypt.hash(newUser.password, salt, function(err, hash) {
	        newStudent.password = hash;
	        newStudent.save(callback);
	    });
	});
}

module.exports.getUserByUsername = function(name, callback){
	var query = {name: name};
	Student.findOne(query, callback);
}

module.exports.getUserById = function(id, callback){
	Student.findById(id, callback);
}

module.exports.comparePassword = function(candidatePassword, hash, callback){
	bcrypt.compare(candidatePassword, hash, function(err, isMatch) {
    	if(err) throw err;
    	callback(null, isMatch);
	});
}