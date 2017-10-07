const dbConnection = require("../config/mongoConnection");
const data = require("../data/");
const userData = require('../data/').user;
const forumData = require('../data/').forums;

let dbConn = undefined;
let firstUser = undefined;
let comment1 = undefined;
dbConnection().then(db => {
	dbConn = db;
    return db.dropDatabase()
}).then(() => {
    return userData.createUser({
		username: "Phil",
		password: ["password1", 'password1'],
		email: 'phil@stevens.edu',
		gender: 'male',
	});
}).then(() => {
	return userData.createUser({
		username: "Justin",
		password: ["123", '123'],
		email: 'justin@gmail.com',
		gender: 'male',
	});
}).then(() => {
	return userData.createUser({
		username: "Stephanie",
		password: ["1", '1'],
		email: 'steph@gmail.com',
		gender: 'female',
	});
// Create forums
}).then((user) => {
    firstUser = user;
    return forumData.addForum('Forum #1: Steph\'s Sneakers', 'Should I get #Suede Sneakers[http://www.hm.com/us/product/72665] or #Flame Vans[https://www.vans.com/shop/mens-shoes-classics/flame-sk8-hi-reissue-black-black-true-white]? Found these thanks to @Dillon!', ['Shoes'], user._id)
}).then(forum => {
    // Populte forum with general like, dislike and comment
    forumData.likeForum(forum._id, '1');
    forumData.likeForum(forum._id, firstUser._id);
    forumData.likeForum(forum._id, '2');
    forumData.likeForum(forum._id, '3');
    forumData.dislikeForum(forum._id, '4');
	return forumData.addComment(forum._id, forum.user, undefined, "I love #Flame Vans[https://www.vans.com/shop/mens-shoes-classics/flame-sk8-hi-reissue-black-black-true-white]")
}).then(forum => {
    comment1 = forum.comments[0];
    forumData.likeComment(forum._id, '1', comment1._id);
    forumData.likeComment(forum._id, '2', comment1._id);
    forumData.likeComment(forum._id, '3', comment1._id);
    forumData.dislikeComment(forum._id, '4', comment1._id);
    forumData.dislikeComment(forum._id, '5', comment1._id);
	return forumData.addComment(forum._id, forum.user, undefined, "I love #Suede Sneakers[http://www.hm.com/us/product/72665]")
}).then(forum => {
	// Add subcomment
	return forumData.addComment(forum._id, forum.user, forum.comments[0]._id, "Why do you love them?")
}).then(() => {
    // Test multiple links and labels with spaces
    return forumData.addForum('Nike short sleeve top: Help decide color', 'Does this look better in #obsidian[https://store.nike.com/us/en_us/pd/pro-mens-short-sleeve-training-top/pid-10263851/pgid-10266828] or #red[https://store.nike.com/us/en_us/pd/pro-mens-short-sleeve-training-top/pid-11186529/pgid-10266828]?', ['Nike', 'red', 'obsidian', 'shirt', 'men'], firstUser._id)
}).then((forum) => {
    // Add like and dislike to second forum
    forumData.likeForum(forum._id, '1');
    forumData.likeForum(forum._id, firstUser._id);
    forumData.likeForum(forum._id, '2');
    forumData.dislikeForum(forum._id, '3');
    forumData.dislikeForum(forum._id, '4');
    // Then create another forum
    return forumData.addForum('Need a winter shirt quick!!!', 'Is this a good vest #JCrew wool vest[https://www.jcrew.com/p/mens_category/sweaters/merino/italian-merino-wool-sweater-vest/G8239]?', ['wool', 'vest', 'JCrew'], firstUser._id)
}).then(() => {
    console.log("Done seeding database");
    dbConn.close();
}).catch((error) => {
    console.error(error);
});
