const router = require('express').Router();
// Custom Node Helper
const usersData = require('../data/').user;

router.get('/', (req, res) => {
	if (!req.user) {
		return res.redirect('/log_in');
	}
    console.log(req.query.layout)
	let userInfo = {
		avatar: req.user.avatar,
		username: req.user.username,
		email: req.user.email,
		gender: (req.user.isMale) ? "Male" : "Female",
	};
    if (req.query.layout && (req.query.layout === 'false')) {
        userInfo.layout = false;
    }
    console.log(userInfo);
	return res.render('profile/profile.handlebars', userInfo);
});

router.get('/edit/', (req, res) => {
    if (!req.user) {
		return res.redirect('/log_in');
	}
    const userInfo = {
		avatar: req.user.avatar,
		username: req.user.username,
		email: req.user.email,
		gender: (req.user.isMale),
        layout: false,
	};
    return res.render('profile/editProfile.handlebars', userInfo);
});

router.post('/edit/', (req, res) => {
    if (!req.user) {
		return res.redirect('/log_in');
	}
    usersData.updateUser(req.user._id, req.body).then((newProfile) => {
        newProfile.gender = (newProfile.isMale) ? "Male" : "Female",
        newProfile.layout = false;
        return res.render('profile/profile.handlebars', newProfile);
    }).catch((err) => {
        console.log(err);
        return res.status(500).json({error: err});
    });
});

module.exports = exports = router;
