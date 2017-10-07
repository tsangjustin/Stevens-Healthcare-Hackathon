const exphbs  = require('express-handlebars');

module.exports = exports = (app, staticDirectory) => {
	// Set path to public static files
	app.use("/public", staticDirectory);
	// Set View engine
	app.engine('handlebars', exphbs({defaultLayout: 'main'}));
	app.set('view engine', 'handlebars');
}
