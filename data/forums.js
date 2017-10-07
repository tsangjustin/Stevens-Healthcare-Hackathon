// Node Modules
const uuidV4 = require("uuid/v4");
// Custom Node Modules
const mongoCollections = require("../config/mongoCollections");
const forums = mongoCollections.forums;
const usersData = require("./users");
const clothingData = require("./clothing");
const commentsData = require("./comment");

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

function getClothingInfo(content) {
    const matches = (content.match(/#([^\[]+)\[([^\]]+)\]/g) || [])
        .map(match => /#([^\[]+)\[([^\]]+)\]/g.exec(match))
        .map(match => ({
            name: match[1],
            url: match[2]
        }));
    return Promise.all(
        matches.map(match => 
            clothingData.retrieveClothingInfo(match.url)
            .catch(e => {
                console.log(e);
                return undefined;
            })
        )
    ).then(clothing => {
        return clothing.filter(x => x).map((cloth, index) => Object.assign(cloth, matches[index]));
    });
}

let exportedMethods = {
    getAllForums() {
        return forums().then((forumCollection) => {
            return forumCollection.find({}).toArray();
        });
    },
    getForumById(id) {
        return forums().then((forumCollection) => {
            return forumCollection.findOne({_id: id}).then((forum) => {
                if (!forum) throw "Forum not found";
                // console.log(forum);
                return forum;
            });
        });
    },
    getForumByUser(userId) {
        return forums().then((forumsCollection) => {
            return forumsCollection.find({user: userId}).toArray();
        });
    },
    addForum(title, content, labels, userId) {
        // Validate contents
        if (!isValidString(title)) {
            return Promise.reject('Invalid title for forum creation')
        }
        if (!isValidString(content)) {
            return Promise.reject('Invalid content for forum creation')
        }
        if (!labels || (!Array.isArray(labels))) {
            return Promise.reject('Invalid label(s) for forum creation')
        }
        if (!isValidString(userId)) {
            return Promise.reject('Invalid id for forum creation')
        }

        // TODO: Maybe check that id is valid first?
        return getClothingInfo(content)
        .then(clothing => {
            return forums()
            .then((forumCollection) => {
                const newForum = {
                    _id: uuidV4(),
                    user: userId,
                    createdOn: new Date(),
                    title,
                    content,
                    labels,
                    clothing,
                    likes: [],
                    dislikes: [],
                    comments: [],
                };
                return forumCollection.insertOne(newForum)
                .then(() => exportedMethods.getForumById(newForum._id));
            });
        });
    },
    updateForum(forumId, userId, title, content, labels) {
        // Validate contents
        if (title && !isValidString(title)) {
            return Promise.reject('Invalid title for forum creation')
        }
        if (content && !isValidString(content)) {
            return Promise.reject('Invalid content for forum creation')
        }
        if (labels && (!Array.isArray(labels))) {
            return Promise.reject('Invalid label(s) for forum creation')
        }

        // Check that some change was made
        if (!title && !content && !labels) {
            return Promise.reject('No updates to be made.');
        }

        // Only update parameters that have been changed
        updateParam = {}
        if (title) {
            updateParam["title"] = title;
        }
        if (content) {
            updateParam["content"] = content;
        }
        if (labels) {
            updateParam["labels"] = labels;
        }
        return getClothingInfo(content || "")
        .then(clothing => {
            if (content) {
                updateParam["clothing"] = clothing;
            }
            return forums().then((forumCollection) => {
                return forumCollection
                    .update(
                        {_id: forumId,
                        user: userId},
                        { $set: updateParam}
                    ).then((forumInformation) => {
                        console.log("Updated forum");
                        return exportedMethods.getForumById(forumId);
                    }).catch((err) => {
                        return Promise.reject("Could not update forum");
                    });
            });
        });
    },
    deleteForum(forumId, userId) {
        return forums().then((forumCollection) => {
            forumCollection
                .deleteOne(
                    {_id: forumId,
                    user: userId}
                )
                .then(() => {
                    console.log("Deleted forum");
                    return;
                }).catch((err) => {
                    return Promise.reject("Could not delete forum");
                });
        });
    },
    addComment(forumId, userId, parentCommentId, content) {
        if (!isValidString(forumId)) {
            return Promise.reject('Invalid forumId for forum comment')
        }
        if (!isValidString(userId)) {
            return Promise.reject('Invalid userId for forum comment')
        }
        if (!isValidString(content)) {
            return Promise.reject('Invalid content for forum comment')
        }
        return forums().then((forumCollection) => {
            const newComment = {
                _id: uuidV4(),
                datePosted: new Date(),
                content,
                user: userId,
                parentComment: parentCommentId,
                likes: [],
                dislikes: [],
            };
            return forumCollection.update(
                { _id: forumId },
                { $push: { comments: newComment }}
            ).then((forumInformation) => {
                console.log("Added comment");
                return exportedMethods.getForumById(forumId);
            }).catch((err) => {
                // err is unhandled promise rejection???????
                return Promise.reject("Could not add comment");
            });
        });
    },
    likeComment(forumId, userId, commentId) {
        return new Promise((fulfill, reject) => {
            forums().then(forumColl => {
                // let newComment = {};
                // newComment[commentId] = {
                //     likes: commentId
                // };
                forumColl.update(
                    { _id: forumId, "comments._id": commentId },
                    {'$addToSet': { "comments.$.likes": userId } },
                    (err, updateInfo) => {
                        if (err) {
        					return reject(err);
        				}
        				const result = updateInfo.result;
        				if (result.n < 1) {
        					return reject('Unable find comment with matching comment id');
        				}
        				if (result.nModified < 1) {
        					return reject('Fail to update likes for comment');
        				}
                        // newComment = {};
                        // newComment[commentId] = {
                        //     dislikes: commentId
                        // };
                        forumColl.update(
                            {_id: forumId, "comments._id": commentId},
                            {'$pull': { "comments.$.dislikes": userId }},
                            (err, updateInfo) => {
                                if (err) {
                					return reject(err);
                				}
                				exportedMethods.getForumById(forumId).then((matchForum) => {
                                    for (let c=0, lenComments=matchForum.comments.length; c < lenComments; ++c) {
                                        const currComment = matchForum.comments[c];
                                        if (currComment._id === commentId) {
                                            return fulfill({
                                                likes: currComment.likes,
                                                dislikes: currComment.dislikes,
                                            });
                                        }
                                    }
                                    return reject('Fail to find matching comment id');
                				}).catch((err) => {
                					return reject(err);
                				});
                            }
                        );
                    }
                );
            }).catch((err) => {
                return reject(err);
            });
        });
    },
    dislikeComment(forumId, userId, commentId) {
        return new Promise((fulfill, reject) => {
            forums().then(forumColl => {
                forumColl.update(
                    { _id: forumId, "comments._id": commentId },
                    { '$addToSet': { "comments.$.dislikes": userId } },
                    (err, updateInfo) => {
                        if (err) {
        					return reject(err);
        				}
        				const result = updateInfo.result;
        				if (result.n < 1) {
        					return reject('Unable find comment with matching comment id');
        				}
        				if (result.nModified < 1) {
        					return reject('Fail to update dislikes for comment');
        				}
                        forumColl.update(
                            { _id: forumId, "comments._id": commentId },
                            { '$pull': { "comments.$.likes": userId } },
                            (err, updateInfo) => {
                                if (err) {
                					return reject(err);
                				}
                				exportedMethods.getForumById(forumId).then((matchForum) => {
                                    for (let c=0, lenComments=matchForum.comments.length; c < lenComments; ++c) {
                                        const currComment = matchForum.comments[c];
                                        if (currComment._id === commentId) {
                                            return fulfill({
                                                likes: currComment.likes,
                                                dislikes: currComment.dislikes,
                                            });
                                        }
                                    }
                                    return reject('Fail to find matching comment id');
                				}).catch((err) => {
                					return reject(err);
                				});
                            }
                        );
                    }
                );
            }).catch((err) => {
                return reject(err);
            });
        });
    },
    likeForum(forumId, userId) {
        return new Promise((fulfill, reject) => {
            forums().then(forumColl => {
                forumColl.update(
                    { _id: forumId },
                    {'$addToSet': { "likes": userId } },
                    (err, updateInfo) => {
                        if (err) {
        					return reject(err);
        				}
        				const result = updateInfo.result;
        				if (result.n < 1) {
        					return reject('Unable find forum to like');
        				}
        				if (result.nModified < 1) {
        					return reject('Fail to update likes for forum');
        				}
                        forumColl.update(
                            {_id: forumId},
                            {'$pull': { "dislikes": userId }},
                            (err, updateInfo) => {
                                if (err) {
                					return reject(err);
                				}
                				exportedMethods.getForumById(forumId).then((matchForum) => {
                                    return fulfill({
                                        likes: matchForum.likes,
                                        dislikes: matchForum.dislikes,
                                    });
                				}).catch((err) => {
                					return reject(err);
                				});
                            }
                        );
                    }
                );
            }).catch((err) => {
                return reject(err);
            });
        });
    },
    dislikeForum(forumId, userId) {
        return new Promise((fulfill, reject) => {
            forums().then(forumColl => {
                forumColl.update(
                    { _id: forumId },
                    {'$addToSet': { "dislikes": userId } },
                    (err, updateInfo) => {
                        if (err) {
        					return reject(err);
        				}
        				const result = updateInfo.result;
        				if (result.n < 1) {
        					return reject('Unable find forum to like');
        				}
        				if (result.nModified < 1) {
        					return reject('Fail to update likes for forum');
        				}
                        forumColl.update(
                            {_id: forumId},
                            {'$pull': { "likes": userId }},
                            (err, updateInfo) => {
                                if (err) {
                					return reject(err);
                				}
                				exportedMethods.getForumById(forumId).then((matchForum) => {
                                    return fulfill({
                                        likes: matchForum.likes,
                                        dislikes: matchForum.dislikes,
                                    });
                				}).catch((err) => {
                					return reject(err);
                				});
                            }
                        );
                    }
                );
            }).catch((err) => {
                return reject(err);
            });
        });
    },
    searchForums(text, prices, labels) {
        text = (text && (typeof(text) === 'string') && text.length > 0) ? text.trim().toLowerCase() : undefined;
        let labelList = [];
        let priceList = [];
        if (labels && (Array.isArray(labels)) && (labels.length > 0)) {
            for (let l=0, lenLabels = labels.length; l < lenLabels; ++l) {
                let currLabel = labels[l];
                if (currLabel && (typeof(currLabel) === 'string')) {
                    currLabel = currLabel.trim();
                    if (currLabel.length > 0) {
                        labelList.push(currLabel)
                    }
                }
            }
        }
        const priceRange = (prices && (Array.isArray(prices)) && (prices.length > 0)) ? prices.forEach((priceRange) => {
            switch (priceRange) {
                case ('0-49'):
                    priceList.push([0, 49.5]);
                    break;
                case ('50-99'):
                    priceList.push([49.5, 99.5]);
                    break;
                case ('100-199'):
                    priceList.push([99.5, 199.5]);
                    break;
                case ('200-499'):
                    priceList.push([199.5, 499.5]);
                    break;
                case ('500-999'):
                    priceList.push([499.5, 999.5]);
                    break;
                case ('1000+'):
                    priceList.push([999.5, undefined]);
                    break;
                default:
                    break;
            }
        }) : undefined;
        const searchQuery = {
            "$and": [],
        };
        if (text && typeof(text) === 'string' && text.length > 0) {
            const textFilter = {
                "$or": [
                    {
                        "title": new RegExp(text, "i"),
                        // title: {
                        //     "$regex": new RegExp("^" + text + "$", "i"),
                        //     // "$regex": "^" + text + "/",
                        //     // "$options": "i",
                        // },
                    },
                    {
                        "content": new RegExp(text, "i"),
                        // content: {
                        //     "$regex": new RegExp("^" + text + "$", "i"),
                        //     // "$regex": "^" + text + "$",
                        //     // "$options": "i",
                        // },
                    },
                    {
                        "clothing.$.name": new RegExp(text, "i"),
                        // "clothing.$.name": {
                        //     "$regex": new RegExp("^" + text + "$", "i"),
                        //     // "$regex": "^" + text + "/",
                        //     // "$options": "i",
                        // },
                    },
                ],
            }
            console.log(textFilter);
            searchQuery["$and"].push(textFilter);
        }
        if (labelList && (Array.isArray(labelList)) && (labelList.length > 0)) {
            searchQuery["$and"].push({
                "labels": { "$in": labelList },
            });
            // searchQuery["$or"].push({
            //     "labels": { "$in": labelList },
            // });
        }
        if (priceList && (Array.isArray(priceList)) && (priceList.length > 0)) {
            let priceFilter = {"$or": []};
            priceList.forEach((priceRange) => {
                if (priceRange.length == 2) {
                    priceFilter["$or"].push({
                        "clothing": {
                            "$elemMatch": {
                                "price": {
                                    "$gte": priceRange[0],
                                    "$lt": priceRange[1],
                                }
                            }
                        },
                    });
                } else {
                    priceFilter["$or"].push({
                        "clothing": {
                            "$elemMatch": {
                                "price": {
                                    "$gte": priceRange[0],
                                },
                            },
                        },
                    });
                }
            })
            searchQuery["$and"].push(priceFilter);
        }
        console.log(JSON.stringify(searchQuery));
        if (searchQuery["$and"].length <= 0) {
            return Promise.reject("Nothing to search");
        }
        return forums().then((forumCollection) => {
            // forumCollection.find(searchQuery, (err, result) => {
            //     if (err) {
            //         return Promise.reject(err);
            //     }
            //     let forums = [];
            //     result.each((err, forum) => {
            //         console.log(err);
            //         console.log(forum);
            //         forums.push(forum);
            //     });
            //     console.log(forums);
            //     return forums;
            // })
            return forumCollection.find(searchQuery).toArray();
        });
    },
    editComment(forumId, commentId, userId, newText) {
        return new Promise((fulfill, reject) => {
            if (!isValidString(forumId)) {
                return reject('Invalid forum id');
            }
            if (!isValidString(commentId)) {
                return reject('Invalid comment id');
            }
            if (!isValidString(userId)) {
                return reject('Invalid user id');
            }
            if (!isValidString(newText)) {
                return reject('Invalid comment');
            }
            commentsData.getCommentById(forumId, commentId).then((comment) => {
                if (comment.user !== userId) {
                    return reject('Fail to find comment with matching comment id and user id');
                }
                forums().then((forumColl) => {
                    forumColl.update(
                        {
                            _id: forumId,
                            "comments._id": commentId,
                            // "comments.user": userId,
                        },
                        {
                            "$set": {
                                "comments.$.content": newText,
                            },
                        },
                        (err, updateInfo) => {
                            if (err) {
                                return reject(err);
                            }
                            const result = updateInfo.result;
                            if (result.n < 1) {
                                return reject('Unable find comment with matching comment id');
                            }
                            if (result.nModified < 1) {
                                return reject('Fail to update comment');
                            }
                            exportedMethods.getForumById(forumId).then((forumInfo) => {
                                for (let c=0,lenComments=forumInfo.comments.length; c < lenComments; ++c) {
                                    const currComment = forumInfo.comments[c];
                                    if ((currComment._id === commentId) && (currComment.user === userId)) {
                                        return fulfill(currComment);
                                    }
                                }
                                return reject('Fail to find updated comment')
                            }).catch((err) => {
                                return reject(err);
                            });
                        }
                    );
                });
            }).catch((err) => {
                return reject(err);
            });
        });
    },
    deleteComment(forumId, commentId, userId) {
        return new Promise((fulfill, reject) => {
            if (!isValidString(forumId)) {
                return reject('Invalid forum id');
            }
            if (!isValidString(commentId)) {
                return reject('Invalid comment id');
            }
            if (!isValidString(userId)) {
                return reject('Invalid user id');
            }
            forums().then((forumColl) => {
                forumColl.update(
                    { _id: forumId },
                    {
                        $pull: {
                            comments: {
                                _id: commentId,
                                user: userId,
                            },
                        },
                    },
                    (err, updateInfo) => {
                        if (err) {
                            return reject(err);
                        }
                        const result = updateInfo.result;
        				if (result.n < 1) {
        					return reject('Unable find comment with matching comment id');
        				}
        				if (result.nModified < 1) {
        					return reject('Fail to remove comment');
        				}
                        return fulfill(commentId);
                    }
                );
            }).catch((err) => {
                return reject(err);
            });
        });
    }
}

module.exports = exportedMethods;
