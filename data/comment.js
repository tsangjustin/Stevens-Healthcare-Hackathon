// Custom Node Modules
const mongoCollections = require("../config/mongoCollections");
const forums = mongoCollections.forums;

function isValidString(str) {
	if ((str === undefined) || (typeof(str) !== "string") || (str.length <= 0)) {
		return false;
	}
	return true;
}

let comment = {
    getCommentById(forumId, commentId) {
        return new Promise((fulfill, reject) => {
            if (!isValidString(forumId)) {
                return reject("Invalid forum id");
            }
            if (!isValidString(commentId)) {
                return reject("Invalid comment id");
            }
            forums().then((forumColl) => {
                forumColl.findOne(
                    {
                        _id: forumId,
                        "comments._id": commentId,
                    },
                    (err, result) => {
                        if (err) {
                            return reject(err);
                        }
                        if (!result) {
                            return reject("Fail to find comment with matching comment id");
                        }
                        for (let c=0, lenComments=result.comments.length; c < lenComments; ++c) {
                            const currComment = result.comments[c];
                            if (currComment._id === commentId) {
                                return fulfill(currComment);
                            }
                        }
                        return reject("Fail to find comment with matching comment id");
                    }
                );
            }).catch((err) => {
                return reject(err);
            });
        });
    },
};

module.exports = exports = comment;
