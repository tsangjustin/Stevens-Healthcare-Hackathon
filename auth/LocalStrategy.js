const bcrypt = require('bcrypt');
const LocalStrategy = require('passport-local').Strategy;
// Custom Helper with MongoDB
const userData = require('../data/').user;

module.exports = exports = (passport) => {
	passport.use(new LocalStrategy(
		(username, password, done) => {
			userData.getUser(username).then((user) => {
				if (!user) {
					return done('Incorrect username');
				}
				bcrypt.compare(password, user.password, (err, isEqual) => {
					if (err || !isEqual) {
						// TODO: Increment attempt and create a lockout feature
						return done(null, null, { message: 'Invalid username and/or password'});
					}
					return done(null, user);
				})
			}).catch((err) => {
				return done(null, null, { message: `${err}` });
			})
		})
	);
};
