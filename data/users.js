// Node Modules
const bcrypt = require("bcrypt");
const uuidV4 = require("uuid/v4");
// Custom Node Modules
const UserCollection = require("../config/mongoCollections").users;

/**
 * Function checks that a string given is string with some number of
 * characters
 *
 * @params  {string} str string value to check for validity
 * @return  true if the string is valid; otherwise, return false
 */
function isValidString(str) {
	if ((str === undefined) || (typeof(str) !== "string") || (str.length <= 0)) {
		return false;
	}
	return true;
}

function isMatchingPassword(passwordList) {
	if (passwordList && Array.isArray(passwordList) && (passwordList.length == 2)) {
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

let user = exports = module.exports;

/**
 * Function takes a forumUser object and insert user into MongoDB
 *
 * @params {object} forumUser  object
 * @returns  Promise with success if inserted recipe into DB and return
 *			 recipe object; otherwise, return reject Promise with error
 */
user.createUser = (forumUser) => {
	return new Promise((success, reject) => {
		if ((forumUser === undefined) || (typeof(forumUser) !== 'object')) {
			return reject("Failed to create user. Please try again later...");
		}
		const username = forumUser.username;
		const avatar = forumUser.avatar || '/public/image/avatar.png';
		const email = forumUser.email;
		const gender = forumUser.gender;
		if (!isValidString(username)) {
			return reject("Please fill in a username");
		}
		if (!isValidString(forumUser.password[0]) || !isValidString(forumUser.password[1])) {
			return reject("Please fill in a password");
		}
		if (!isMatchingPassword(forumUser.password)) {
			return reject("Passwords don't match");
		}
		if (!isValidString(email)) {
			return reject("Please fill in a email");
		}
		if (!isValidString(gender)) {
			return reject("Please fill in a gender");
		}
		if (!['male', 'female'].includes(gender)) {
			return reject("Gender must be male or female");
		}
		const isMale = gender.toLowerCase() === 'male';
		const _user = {
			_id: uuidV4(),
			username,
			password: bcrypt.hashSync(forumUser.password[0], 10),
			avatar,
			email,
			isMale,
	  	};
		user.getUser(username).then((existingUser) => {
			console.log(`${username} already exists`);
			return reject('Username already exists');
		}).catch((err) => {
			UserCollection().then((userColl) => {
				userColl.insertOne(_user, (err, result) => {
					if (err) {
						return reject(err);
					}
					const insertResult = result.result;
					if ((!insertResult.ok) || (insertResult.n !== 1)) {
						return reject('Fail to insert user');
					}
					user.getUserById(_user._id).then((newUser) => {
						return success(newUser);
					}).catch((e) => {
						return reject(e);
					});
				});
			}).catch((err) => {
				return reject('Unable to create account. Please try again later...');
			});
		})
	});
}

/**
 * Function gets single query of matching _id
 *
 * @params {string} id of recipe _id
 * @returns  Promise with success if queried a matching recipe; otherwise,
 * 			 return reject with error
 */
user.getUser = (username) => {
	return new Promise((fulfill, reject) => {
		if (!isValidString(username)) {
			return reject("Invalid username");
		}
		UserCollection().then((userColl) => {
			userColl.findOne(
				{username: username},
				(err, userItem) => {
					if (err) {
						console.log(err);
						return reject('Unable to get account. Please try again later...');
					}
					if (!userItem) {
						return reject('Invalid username');
					}
					return fulfill(userItem);
				}
			);
		}).catch((err) => {
			console.log(err);
			return reject('Unable to get account. Please try again later...');
		});
	});
}

/**
 * Function gets single query of matching _id
 *
 * @params {string} id of recipe _id
 * @returns  Promise with success if queried a matching recipe; otherwise,
 * 			 return reject with error
 */
user.getUserById = (id) => {
	return new Promise((success, reject) => {
		if (!isValidString(id)) {
			return reject("Invalid id to get user");
		}
		UserCollection().then((userColl) => {
			userColl.findOne(
				{_id: id},
				(err, userItem) => {
					if (err) {
						return reject(err);
					}
					if (!userItem) {
						return reject('Did not find user with matching id');
					}
					return success(userItem);
				}
			);
		}).catch((err) => {
			return reject(err);
		});
	});
}

user.updateUser = (id, changeUser) => {
	return new Promise((fulfill, reject) => {
		if (!isValidString(id)) {
			return reject("Invalid user id to update");
		}
		if ((changeUser === undefined) || (typeof(changeUser) !== "object")) {
			return reject("Nothing to change for user");
		}
		let newUser = {};
		if (isValidString(changeUser.avatar)) {
			newUser.avatar = changeUser.avatar;
		}
        if (isValidString(changeUser.email)) {
			newUser.email = changeUser.email;
		}
        if ((isValidString(changeUser.gender)) && (['male', 'female'].includes(changeUser.gender))) {
			newUser.isMale = changeUser.gender.toLowerCase() === 'male';
		}
		if ((Object.keys(newUser).length <= 0) || (typeof(newUser) !== 'object')) {
			return reject("Found nothing to update for user");
		}
		UserCollection().then((userColl) => {
			// foodColl.findAndModify(
			// 	{_id: id},
			// 	[],
			// 	{$set: changeRecipe},
			// 	{"new": true, "upsert": true},
			// 	(err, result) => {
			// 		if (err) {
			// 			return reject(err);
			// 		}
			// 		return success(result.value);
			// 	}
			// );
			userColl.update(
                {_id: id},
                {$set: newUser},
                (err, updateInfo) => {
    				if (err) {
    					return reject(err);
    				}
    				const result = updateInfo.result;
    				if (result.n === 0) {
    					return reject("Did not find user with matching id");
    				}
    				if ((!result.ok) || (result.nModified < 1)) {
    					return reject('Failed to update user');
    				}
    				user.getUserById(id).then((userItem) => {
    					return fulfill(userItem);
    				}).catch((err) => {
    					return reject(err);
    				});
    			}
            );
		}).catch((err) => {
			return reject(err);
		})
	});
}

user.deleteUser = (id, password) => {
	return new Promise((fulfill, reject) => {
		if (!isValidString(id)) {
			return reject("Invalid id to get delete user");
		}
		UserCollection().then((userColl) => {
			userColl.removeOne({_id: id}, (err, deletedInfo) => {
				if (err) {
					return reject(err);
				}
				if (deletedInfo.deletedCount < 1) {
					return reject('Could not find user with matching id to delete');
				}
				return fulfill(id);
			});
		}).catch((err) => {
			return reject(err);
		});
	});
}

/**
 * Function returns the avatar for the given id
 * @params {string} id of the user from the DB
 * @returns string of the string for the avatar of the user; otherwise, return reject if invalid id or can't find user with given id
 */
user.getAvatar = (id) => {
    return new Promise((fulfill, reject) => {
        if (!isValidString(id)) {
            return reject('Invalid id to get avatar');
        }
        UserCollection().then((userColl) => {
			userColl.findOne(
                {_id: id},
                (err, userInfo) => {
                    if (err) {
                        return reject('Unable to get account. Please try again later...');
                    }
                    if (!userInfo || (!userInfo.hasOwnProperty('avatar'))) {
                        return reject('Invalid id');
                    }
                    return fulfill(userInfo.avatar);
                }
            );
		}).catch((err) => {
			return reject(err);
		});
    });
}
