const clothingData = require("./clothing");
const forumsData   = require("./forums");
const userData     = require("./users");
const commentData     = require("./comment");

module.exports = exports = {
	user: userData,
	forums: forumsData,
	clothing: clothingData,
	comment: commentData,
};
