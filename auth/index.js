// Node Modules
const passport = require('passport');
// Custom Node Modules
const LocalStrategy = require('./LocalStrategy');
const userData = require('../data/').user;

function findUserById(id) {
	return new Promise((fulfill, reject) => {
		if ((id) && (typeof(id) === 'string') && (id.length > 0)) {
			userData.getUserById(id).then(user => {
				return fulfill(user);
			}).catch(err => {
				return reject(err);
			});
		} else {
			return reject('Invalid user id');
		}
	});
}

passport.serializeUser((user, done) => {
	done(null, user._id);
});

passport.deserializeUser((id, done) => {
	findUserById(id).then((user) => {
		return done(null, user);
	}).catch((err) => {
		return done(err);
	})
});

LocalStrategy(passport);

module.exports = exports = passport;
