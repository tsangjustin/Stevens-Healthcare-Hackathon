// Node Modules
const router = require('express').Router();
const xss    = require("xss");
// Custom Node Modules
const data = require("../data");
const forumsData = data.forums;
const userData = data.user;

// Get avatars for each community forum
function getAllAvatars(forumList) {
    return new Promise((resolve, reject) => {
        if (forumList.length == 0) {
            return resolve();
        }
        let numAvatars = 0;
        forumList.forEach((element) => {
            userData.getAvatar(element.user)
                .then((avatar) => {
                    element.avatar = avatar;
                    numAvatars++;
                    if (numAvatars == forumList.length) {
                        //we have seen all the avatars and can return
                        return resolve();
                    }
                })
                .catch((err) => {
                    element.avatar = "/public/image/avatar.png";
                    return reject();
                });
        });
    });
}

// View existing forums by most recent or most popular
router.get('/', (req, res) => {
    let info = req.locals || {};
    // const sort_by = req.query.sort_by || 'recent';
    let searchFilters = {
        price: {},
        labels: {},
    };

    forumsData.getAllForums().then((forumList) => {
        forumList.sort((f1, f2) => {
            return (f1.createdOn > f2.createdOn) ? 1 : -1
        });
        info.forums = (forumList && (Array.isArray(forumList))) ? forumList : [];
        for (let f=0, lenForums = forumList.length; f < lenForums; ++f) {
            const currForum = forumList[f];
            // Check labels
            for (let l=0, lenLabels=(currForum.labels || []).length; l < lenLabels; ++l) {
                searchFilters.labels[currForum.labels[l]] = true;
            }
            // Check pricing filter
            const clothings = (currForum.clothing || []);
            for (let c=0, lenClothing=clothings.length; c < lenClothing; ++c) {
                const clothingPrice = clothings[c].price || -1;
                if (clothingPrice >= 0 && clothingPrice < 49.5) {
                    searchFilters.price['0-49'] = true;
                } else if (clothingPrice >= 49.5 && clothingPrice < 99.5) {
                    searchFilters.price['50-99'] = true;
                } else if (clothingPrice >= 99.5 && clothingPrice < 199.5) {
                    searchFilters.price['100-199'] = true;
                } else if (clothingPrice >= 199.5 && clothingPrice < 499.5) {
                    searchFilters.price['200-499'] = true;
                } else if (clothingPrice >= 499.5 && clothingPrice < 999.5) {
                    searchFilters.price['500-999'] = true;
                } else if (clothingPrice >= 999.5) {
                    searchFilters.price['1000+'] = true;
                }
            }
        }
        if (Object.keys(searchFilters.price).length > 0) {
            info.price = searchFilters.price;
        }
        if (Object.keys(searchFilters.labels).length > 0) {
            info.labels = searchFilters.labels;
        }
        return getAllAvatars(info.forums);
    })
    .then(() => {
        info.helpers = {
            removeSpace: (str) => str.replace(/\s/g, '-'),
        };
        return res.render('forums', info);
    })
    .catch((err) => {
        console.log(err);
        return res.status(500).send();
    });
});

// Form to create a new forum
router.get('/create', (req, res) => {
    let userInfo = req.locals || {}
    // console.log("user", req.user);
    // Must be authenticated to create forum
    if (!req.user) {
        // return res.status(403).send();
        return res.redirect('/log_in');
    }

    if (req.query.c_name && req.query.c_url) {
        userInfo.defaultText = `#${req.query.c_name}[${req.query.c_url}]`;
    }

    return res.render('forums/create', userInfo);
});

// Create a new forum
router.post('/', (req, res) => {
    // let userId = '717fd940-6d56-42f3-a08e-4bf15de7ee0d'; // FOR TESTING
    if (!req.user) {
        return res.redirect('/log_in');
    }
    let userId = req.user._id;
    let title = xss(req.body.title);
    let content = xss(req.body.content);
    let labels = xss(req.body.labels);
    const clothing = req.body.clothing || [];

    if (!title || !content || !userId) {
        // Invalid request, required parameters missing
        return res.status(400).send();
    }
    if (!labels) {
        labels = []
    } else {
        // labels = labels.split(",").map(x=>x.trim());
        labels = labels.split(",").map(label => label.trim());
    }

    forumsData.addForum(title, content, labels, userId)
        .then((newForum) => {
            return res.redirect(`/forums/${newForum._id}`);
        }).catch((err) => {
            // console.log("hi", err);
            return res.status(500).send();
        });
});

// Run search on community forums by filter
router.get('/search/', (req, res) => {
    console.log(req.query)
    const text = req.query.title || undefined;
    const prices = (req.query.prices || "").split('||') || undefined;
    const labels = (req.query.labels || "").split('||') || undefined;
    let forumsInfo = {
        layout: false,
    };

    forumsData.searchForums(text, prices, labels).then((forumsQuery) => {
        forumsInfo.forums = forumsQuery
        return getAllAvatars(forumsInfo.forums);
    }).then(() => {
        // console.log(forumsInfo);
        // return res.json(forumsInfo);
        return res.render('forums/communityForums', forumsInfo);
    }).catch((err) => {
        console.log(err);
        return res.sendStatus(500);
    });
});

const contentToHtml = (content) => {
    return xss(content)
    .replace(/#([^\[]+)\[([^\]]+)\]/g, (match, name, url) => `<a target='_blank' href='${url}'>${name}</a>`)
    .replace(/@([\w-]+)/g, (match, username) => `<a target='_blank' href='#'>${username}</a>`);
}

// View specific forum post
router.get('/:forum_id/', (req, res) => {
    let info = req.locals;
    forumsData.getForumById(req.params.forum_id)
        .then((forumData) => {
            // Use an object for the comments thread for O(1) lookup and then convert to array
            commentsThread = {}
            forumData.comments.map((comment) => {
                comment.isOwner = (comment.user === (req.user || {})._id);
                comment.subthreads = [];
                return comment;
            });
            forumData.comments.sort((x, y) => x.datePosted - y.datePosted).forEach(comment => {
                if (comment.parentComment) {
                    if (!commentsThread[comment.parentComment]) {
                        commentsThread[comment.parentComment] = {
                            _id: comment.parentComment,
                            datePosted: undefined,
                            content: "Comment deleted",
                            user: undefined,
                            parentComment: undefined,
                            likes: [],
                            dislikes: [],
                            subthreads: [],
                        }
                    }
                    commentsThread[comment.parentComment].subthreads.push(comment);
                }
                commentsThread[comment._id] = comment;
            })
            console.log(commentsThread["421feec5-fade-4b71-ad6f-01690ba1f2be"]);
            // Remove non-top level comments
            forumData.commentsThread = Object.values(commentsThread).filter(x => !x.parentComment);
            info.forum = forumData;
            info.isOwner = (forumData.user === (req.user || {})._id);
            // console.log(JSON.stringify(info));
            info.helpers = {
                contentToHtml,
                forum_id: () => forumData._id,
                URIencode: (uri) => encodeURIComponent(uri),
            };
            // get user avatar
            return userData.getAvatar(info.forum.user);
        }).then((userAvatar) => {
            info.forum.avatar = userAvatar;
            // get all other avatars
            return getAllAvatars(info.forum.comments);
        }).then(() => {
            return res.render('forums/single', info);
        }).catch((err) => {
            console.log(err)
            return res.status(404).render('error/404.handlebars');
        });
});


// Update specific fields of forum
router.put('/:forum_id', (req, res) => {
    if (!req.user) {
        return res.status(401).json({ error: "Invalid session" });
    }
    let userId = req.user._id;
    let forumId = req.params.forum_id;
    let title = xss(req.body.title);
    if (title && title == "") {
        title = null;
    }
    let content = xss(req.body.content);
    if (content && content == "") {
        content = null;
    }
    let labels = xss(req.body.labels);
    if (labels) {
        labels = labels.split(",").map(label => label.trim());
    }
    else {
        labels = [];
    }

    forumsData.updateForum(forumId, userId, title, content, labels)
        .then((forumData) => {
            return res.json(Object.assign(forumData, {content: contentToHtml(content)}));
        }).catch((err) => {
            return res.status(500).json({ error: err });
        });
});

// Delete a forum
router.delete('/:forum_id', (req, res) => {
    if (!req.user) {
        return res.status(401).json({ error: "Invalid session" });
    }
    let userId = req.user._id;
    let forumId = req.params.forum_id;
    forumsData.deleteForum(forumId, userId)
        .then((forumData) => {
            return res.json({'redirect': '/'});
        }).catch((err) => {
            return res.status(404).render('error/404.handlebars');
        });
});

// Get a list comments for forum id
router.get('/:forum_id/comments', (req, res) => {

});

router.put('/:forum_id/like', (req, res) => {
    if (!req.user) {
        return res.status(401).json({error: "Invalid session"});
    }
    const forumId = req.params.forum_id;
    const userId = req.user._id;
    forumsData.likeForum(forumId, userId).then((updatedLikeDislike) => {
        console.log(updatedLikeDislike);
        return res.json(updatedLikeDislike);
    }).catch((err) => {
        console.log(err);
        return res.status(500).json({error: err});
    });
});

router.put('/:forum_id/dislike', (req, res) => {
    if (!req.user) {
        return res.status(401).json({error: "Invalid session"});
    }
    const forumId = req.params.forum_id;
    const userId = req.user._id;
    forumsData.dislikeForum(forumId, userId).then((updatedLikeDislike) => {
        console.log(updatedLikeDislike);
        return res.json(updatedLikeDislike);
    }).catch((err) => {
        console.log(err);
        return res.status(500).json({error: err});
    });
});

// Add comment to forum
router.post('/:forum_id/comments', (req, res) => {
    // Must be signed in to submit comment
    if (!req.user) {
        // TODO what should this behavior be?
        return res.redirect('/log_in');
    }
    const forumId = req.params.forum_id;
    const userId = req.user._id;
    const parentCommentId = req.body.parentCommentId;
    const comment = xss(req.body.comment);

    forumsData.addComment(forumId, userId, parentCommentId, comment)
        .then(() => {
            return res.redirect(`/forums/${forumId}`);
        }).catch((err) => {
            console.log(err);
            res.status(404).send();
            return res.redirect(`/forums/${forumId}`);
        });
});

// Update a comment by id for specific post
router.put('/:forum_id/comments/:comment_id/', (req, res) => {
    if (!req.user) {
        return res.sendStatus(401);
    }
    const forumId = req.params.forum_id;
    const commentId = req.params.comment_id;
    const userId = req.user._id;
    const newText = xss(req.query.comment);
    forumsData.editComment(forumId, commentId, userId, newText).then((updatedComment) => {
        return res.json(Object.assign(updatedComment, {content: contentToHtml(newText)}));
    }).catch((err) => {
        console.log(err);
        return res.sendStatus(500);
    });
});

// Shows all forum posts under specified clothing type
router.get('/:clothing_type', (req, res) => {

});

// Create a new forum under specific clothing type
router.post('/:clothing_type', (req, res) => {

});

router.delete('/:forum_id/comments/:comment_id/', (req, res) => {
    if (!req.user) {
        return res.status(401).json({error: "Invalid session"});
    }
    const userId = req.user._id;
    const forumId = req.params.forum_id;
    const commentId = req.params.comment_id;
    forumsData.deleteComment(forumId, commentId, userId).then((deletedComment) => {
        return res.json({commentId: commentId});
    }).catch((err) => {
        return res.status(500).json({error: err});
    });
});

// Update a comment by id for specific post
router.put('/:forum_id/comments/:comment_id/like', (req, res) => {
    if (!req.user) {
        return res.status(401).json({error: "Invalid session"});
    }
    const forumId = req.params.forum_id;
    const userId = req.user._id;
    const commentId = req.params.comment_id;

    forumsData.likeComment(forumId, userId, commentId).then((newCommentLike) => {
        return res.json(newCommentLike);
    }).catch((err) => {
        console.log(err);
        res.status(404).json({error: err});
    });
});

router.put('/:forum_id/comments/:comment_id/dislike', (req, res) => {
    if (!req.user) {
        return res.status(401).json({error: "Invalid session"});
    }
    const forumId = req.params.forum_id;
    const userId = req.user._id;
    const commentId = req.params.comment_id;

    forumsData.dislikeComment(forumId, userId, commentId).then((newCommentLike) => {
        return res.json(newCommentLike);
    }).catch((err) => {
        console.log(err);
        return res.status(404).json({error: err});
    });
});

module.exports = exports = router;
