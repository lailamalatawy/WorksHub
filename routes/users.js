var express = require('express');
var router = express.Router();

// includig passport
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var User = require('../models/user');  // .. to go up one directory
var Work = require('../models/work');	// .. to go up one directory

var curr_session;

// Multer stuff
var multer = require('multer');
var storage = multer.diskStorage({
	destination:function(req,file,cb) {
    	cb(null, 'public/uploads/')
	},
	filename:function(req,file,cb) {
    cb(null, file.originalname)
	}
});
var upload = multer({storage:storage});




// RENDERING
router.get('/register', function(req, res){
	res.render('register');
});

router.get('/login', function(req, res){
	res.render('login');
});

router.get('/portfolio',function(req, res){
  res.render('portfolio');
});




// REGISTER 
router.post('/register', function(req, res){
	var username = req.body.username;
	var password = req.body.password;
	var password2 = req.body.password2;

	// validation
	req.checkBody('username', 'Username is required').notEmpty();
	req.checkBody('password', 'Password is required').notEmpty();
	req.checkBody('password2', 'Passwords do not match').equals(req.body.password);

	var errors = req.validationErrors();

	if(errors){
		res.render('register',{errors:errors});
	} else {
		var newUser = new User({	// creating a new object
			username: username,
			password: password
		});

		User.createUser(newUser, function(err, user){
			if(err) throw err;
			console.log(user);
		});

		curr_session = req.session;
		curr_session.username = req.body.username;

		req.flash('success_msg', 'Registration complete! Welcome to WorksHub. You can now login.');

		res.redirect('/users/login');
	}
});



// LOGIN 
passport.use(new LocalStrategy(
  function(username, password, done) {
   User.getUserByUsername(username, function(err, user){
   	if(err) throw err;
   	if(!user){
   		return done(null, false, {message: 'Username not registered'});
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
  passport.authenticate('local', {successRedirect:'/', failureRedirect:'/users/login', failureFlash: true}),
  function(req, res) {
  	curr_session = req.session;
	curr_session.username = req.body.username;
    res.redirect('/users/portfolio');
  });



// LOGOUT 
router.get('/logout', function(req, res){     // ask!
	req.logout();
	req.flash('success_msg', 'Successfully logged out');
	res.redirect('/users/login');
});



// Portfolio
var cpUpload = upload.fields([{name: 'img', maxCount: 1 }, { name: 'file', maxCount: 1}]);

router.post('/portfolio', cpUpload, function(req, res){
	curr_session = req.session;
	var username = curr_session.username;
	var name = req.body.name;
	var bio = req.body.bio;
	var title = req.body.title;
	var description = req.body.description;
	var link = req.body.link;

	req.checkBody('name', 'Name is required!').notEmpty();
  	var errors = req.validationErrors();
	if(errors){
		res.render('portfolio', {errors:errors});
	}
	else {
		var newWork;
			if (!req.files.img) {  
				if (!req.files.file) {    // no screenshot, nor file
					req.checkBody('invisible1', 'Cannot create work without any uploads').notEmpty();
					var errors = req.validationErrors();
					if(errors){
						res.render('portfolio', {errors:errors});
					} 
	   			}
	   			else {  				// no screnshot, but there is a file
					var file = req.files.file[0].originalname;   // upload this file
					newWork = new Work( 
					{
						username: username,
						name: name,
						bio: bio,
						title: title,
						description: description,
						link: link,
						file: file
	  				});
	  				Work.createWork(curr_session.username,newWork, function(err, user) {
	  					if(err) throw err;
	  					console.log(user);
					});
					req.flash('success_msg', 'Your portfolio has been successfully created!');
					res.redirect('/users/works');
	   			}
	  		}  
	  		else {
	  			if (!req.files.file) {	// there is a screenshot, but no file
					var img=req.files.img[0].originalname;  // upload this screenshot
	   				newWork = new Work(
	   				{
						username: username,
						name: name,
						bio: bio,
						title: title,
						description: description,
						link: link,
						img: img	
					});
					Work.createWork(curr_session.username,newWork, function(err, user) {
	  					if(err) throw err;
	  					console.log(user);
					});
					req.flash('success_msg', 'Your portfolio has been successfully created!');
					res.redirect('/users/works');
	 			}
	      		else {					// there is a screenshot, and a file
	        		var img=req.files.img[0].originalname;   // upload this screenshot
	        		var file=req.files.file[0].originalname; // upload this file
	     			newWork = new Work(
	     			{
						username: username,
						name: name,
						bio: bio,
						title: title,
						description: description,
						link: link,
						file: file,
						img: img
					});
					Work.createWork(curr_session.username,newWork, function(err, user) {
	  					if(err) throw err;
	  					console.log(user);
					});
					req.flash('success_msg', 'Your portfolio has been successfully created!');
					res.redirect('/users/works');
	 			}
	      	}
	} 
  
});


// Works
router.get('/works', function(req, res){
	console.log("hena1");
	Work.find().sort({name: 'asc'}).exec(function(err, works) {
		console.log("hena2");
		if(err){
        	console.log('error!!');
            throw err;
        }
        else {
        	console.log('It works!');
        	console.log(works);
            res.render( 'works', {works});
        }
    });
});


module.exports = router;