var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var User = require('../models/user');

// Register
router.get('/register', function(req, res){
	res.render('register');
});

// Login
router.get('/login', function(req, res){
	res.render('login');
});

router.get('/student', function(req, res){
	res.render('student');
});

router.get('/issuing', function(req, res){
	res.render('issuing');
});


router.get('/success', function(req, res){
	res.render('success');
});

router.get('/success_issuing', function(req, res){
	res.render('success_issuing');
});
router.get('/success_detailing', function(req, res){
  res.render('success_detailing');
});

router.get('/image', function(req, res){
  res.render('image');
});


// Register User
router.post('/register', function(req, res){
	var name = req.body.name;
	var email = req.body.email;
	var username = req.body.username;
	var password = req.body.password;
	var password2 = req.body.password2;

	// Validation
	req.checkBody('name', 'Name is required').notEmpty();
	req.checkBody('email', 'Email is required').notEmpty();
	req.checkBody('email', 'Email is not valid').isEmail();
	req.checkBody('username', 'Username is required').notEmpty();
	req.checkBody('password', 'Password is required').notEmpty();
	req.checkBody('password2', 'Passwords do not match').equals(req.body.password);

	var errors = req.validationErrors();

	if(errors){
		res.render('register',{
			errors:errors
		});
	} else {
		var newUser = new User({
			name: name,
			email: email,
			username: username,
			password: password
		});

		User.createUser(newUser, function(err, user){
			if(err) throw err;
			console.log(user);
		});

		req.flash('success_msg', 'You are registered and can now login');

		res.redirect('/users/login');
	}
});


passport.use(new LocalStrategy(
  function(username, password, done) {
   User.getUserByUsername(username, function(err, user){
   	if(err) throw err;
   	if(!user){
   		return done(null, false, {message: 'Unknown User'});
   	}

   	User.comparePassword(password, user.password, function(err, isMatch){
   		if(err) throw err;
   		if(isMatch){
   			return done(null, user);
   		} else {
   			return done(null, false, {message: 'Invalid password'});
   		}
   	});
   });
  }));

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.getUserById(id, function(err, user) {
    done(err, user);
  });
});

router.post('/login',
  passport.authenticate('local', {/*successRedirect:'/',*/ failureRedirect:'/users/login',failureFlash: true}),
  function(req, res) {
 	if(req.body.username == "registrar1")
   		 res.redirect('/');
	else
		res.redirect('/users/issuing');
  });



router.post('/student',
  /*passport.authenticate('local', {successRedirect:'users/success', failureRedirect:'/users/student',failureFlash: true}),*/
  function(req, res) {
    res.redirect('/student');
  });

router.post('/success',
  /*passport.authenticate('local', {successRedirect:'users/student', failureRedirect:'/users/student',failureFlash: true}),*/
  function(req, res) {
    res.redirect('/users/student');
  });


router.post('/issuing',
  /*passport.authenticate('local', {successRedirect:'users/success_issuing', failureRedirect:'/users/student',failureFlash: true}),*/
  function(req, res) {
    res.redirect('/issuing');
  });

router.post('/success_issuing',
  /*passport.authenticate('local', {successRedirect:'users/issuing', failureRedirect:'/users/student',failureFlash: true}),*/
  function(req, res) {
    res.redirect('/users/issuing');
  });
router.post('/success_detailing',
  /*passport.authenticate('local', {successRedirect:'users/issuing', failureRedirect:'/users/student',failureFlash: true}),*/
  function(req, res) {
    res.redirect('/');
  });


//----------------------------------------------------------------------
 router.post('/testjson',
//   passport.authenticate('local', {successRedirect:'users/success', failureRedirect:'/users/student',failureFlash: true}),
   function(req, res) {
     res.render('testjson');
   });

router.post('/finaljson',
//   passport.authenticate('local', {successRedirect:'users/success', failureRedirect:'/users/student',failureFlash: true}),
   function(req, res) {
     res.render('/finaljson');
   });

router.post('/endjson',
//   passport.authenticate('local', {successRedirect:'users/success', failureRedirect:'/users/student',failureFlash: true}),
   function(req, res) {
     res.render('/users/success_issuing');
   });

router.post('/image',
//   passport.authenticate('local', {successRedirect:'users/success', failureRedirect:'/users/student',failureFlash: true}),
   function(req, res) {
     res.render('/users/image');
   });




router.get('/logout', function(req, res){
	req.logout();

	req.flash('success_msg', 'You are logged out');

	res.redirect('/users/login');
});

module.exports = router;
