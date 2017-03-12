var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var exphbs = require('express-handlebars');
var hbs = require('handlebars');
var expressValidator = require('express-validator');
var flash = require('connect-flash');
var session = require('express-session');

var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;


const port = 8083;

// MongoDB Stuff
var mongo = require('mongodb');
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/workshub2');
var db = mongoose.connection;
mongoose.Promise = global.Promise;

var routes = require('./routes/index');
var users = require('./routes/users');

// Init App
var app = express();

// View Engine
app.set('views', path.join(__dirname, 'views'));
app.engine('handlebars', exphbs({defaultLayout:'layout'}));
app.set('view engine', 'handlebars');
hbs.registerHelper("ifl", function(value, options) {
    if(value > '2') {
      return 0;
    }
      return 1;
});

// BodyParser Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// Set Static Folder
app.use(express.static(path.join(__dirname, 'public')));

// Express Session
app.use(session({
    secret: 'shhhhh',
    saveUninitialized: true,
    resave: true
}));

// Passport init
app.use(passport.initialize());
app.use(passport.session());

// Express Validator
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.'), root = namespace.shift(), formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }

    return {param:formParam, msg:msg, value:value};
  }
}));

// Connect Flash
app.use(flash());

// Global Variables
app.use(function (req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.session = req.session;
  res.locals.user = req.user || null;
  //res.locals.userName = req.user.displayName || null;
  next();
});


app.use('/', routes);
app.use('/users', users);


// Set Port
app.listen(port, function(){
	console.log('starting on port '+ port);
});