// Node modules
const bodyParser   = require('body-parser');
const botly        = require('botly');
const express	   = require('express');
const session	   = require('express-session');
// Custom Middleware
const passport	   = require('./auth/');
const configRoutes = require('./routes/');

const fb_bot = new Botly({

});

let app = express();
// Log incoming requests
app.use((req, res, next) => {
	console.log(`${req.method} ${req.path}`);
	next();
});
// Parse cookies and POST body
app.use(bodyParser.json({limit: '5mb'}));
app.use(bodyParser.urlencoded({ limit: '5mb', extended: true }));
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
