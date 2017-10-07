// Node modules
const bodyParser   = require('body-parser');
const cookieParser = require('cookie-parser');
const express	   = require('express');
const session	   = require('express-session');
const flash        = require("connect-flash");
// Custom Middleware
const passport	   = require('./auth/');
const configRoutes = require('./routes');
const exhbs		   = require('./views');

let app = express();
// Log incoming requests
app.use((req, res, next) => {
	console.log(`${req.method} ${req.path}`);
	next();
});
// Parse cookies and POST body
app.use(cookieParser());
app.use(bodyParser.json({limit: '5mb'}));
app.use(bodyParser.urlencoded({ limit: '5mb', extended: true }));
// Enable Cookie session
app.use(session({
	secret: 'some complex secret',
	resave: false,
	saveUninitialized: false,
	cookie: { maxAge : 3600000 },
}));
// Enable Passport middleware
app.use(passport.initialize());
app.use(passport.session());
// Add flash support
app.use(flash());
// Serve static files
exhbs(app, express.static(__dirname + '/public'));
// API routing
app.use((req, res, next) => {
    req.locals = {};
    if (req.user) {
        req.locals.avatar = req.user.avatar;
    }
    next();
})
configRoutes(app);

// Enable API Server
const server = app.listen(3000, (err) => {
	if (err) {
		throw err;
	}
	const server_ip = server.address().address;
	const server_port = server.address().port;
	console.log(`Server running on ${server_ip}:${server_port}`);
});
