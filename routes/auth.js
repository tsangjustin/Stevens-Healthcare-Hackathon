// Node Modules
const router = require('express').Router();
const bcrypt = require('bcrypt');
const uuidV4 = require('uuid/v4');
// Custom Node Modules
const passport = require('../auth/');
const userData = require('../data/').user;

function isValidString(str) {
	if ((!str) || (typeof(str) !== 'string')  || (str.length <= 0)) {
		return false;
	}
	return true;
}

function isMatchingPassword(passwordList) {
	if (passwordList && Array.isArray(passwordList) && (passwordList.length === 2)) {
		for (let p = 0; p < 2; p++) {
			if (!isValidString(passwordList[p])) {
				return false;
			}
		}
		if (passwordList[0] === passwordList[1]) {
			return true;
		}
	}
	return false;
}

router.get('/sign_up/', (req, res) => {
	if (req.user) {
		return res.redirect('/');
	}
	return res.render('auth/sign_up', {error: req.flash('error')});
});

router.post('/sign_up/', (req, res, next) => {
	userData.createUser(req.body).then((user) => {
		req.login(user, (loginErr) => {
			if (loginErr) {
				return req.flash('error', loginErr);
				return res.redirect('/sign_up');
			}
			return res.redirect('/');
		});
	}).catch((err) => {
		req.flash('error', err);
		return res.redirect('/sign_up');
	});
});

router.get('/log_in/', (req, res) => {
	if (req.user) {
		return res.redirect('/');
	}
	return res.render('auth/log_in', {error: req.flash('error') });
});

router.post('/log_in/', passport.authenticate('local', { failureRedirect: '/log_in/', failureFlash: true }), (req, res, next) => {
	res.redirect('/');
});

router.get('/log_out/', (req, res) => {
	req.logout();
	return res.redirect('/');
});

module.exports = exports = router
