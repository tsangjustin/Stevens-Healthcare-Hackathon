(function($) {
    var likeForumButton = $('#forum-like-button');
    var dislikeForumButton = $('#forum-dislike-button');
    console.log(forumId);

    likeForumButton.click(function(event) {
        $.ajax({
            'url': '/forums/' + forumId + '/like',
            'type': 'PUT',
            'success': function(res) {
                console.log(res);
                likeForumButton.siblings('span').text(res.likes.length);
                dislikeForumButton.siblings('span').text(res.dislikes.length);
            },
            'error': function(err) {
                if (err) {
                    // window.location.href = '/log_in';
                    console.log(err);
                }
            },
            'dataType': 'json'
        });
    });

    dislikeForumButton.click(function(event) {
        $.ajax({
            'url': '/forums/' + forumId + '/dislike',
            'type': 'PUT',
            'success': function(res) {
                console.log(res);
                likeForumButton.siblings('span').text(res.likes.length);
                dislikeForumButton.siblings('span').text(res.dislikes.length);
            },
            'error': function(err) {
                if (err) {
                    // window.location.href = '/log_in';
                    console.log(err);
                }
            },
            'dataType': 'json'
        });
    });
})(jQuery, forumId)

function redirectLogin() {
    window.location.href = '/log_in';
}

function likeComment(event, commentId) {
    $.ajax({
        'url': '/forums/' + forumId + '/comments/' + commentId + "/like",
        'type': 'PUT',
        'success': function(res) {
            console.log(res);
            $(event.target).siblings('span').text(res.likes.length);
            $(event.target).closest('li').siblings('li').children('span').text(res.dislikes.length);
        },
        'error': function(err) {
            if (err) {
                // window.location.href = '/log_in';
                console.log(err);
            }
        },
        'dataType': 'json'
    })
}

function dislikeComment(event, commentId) {
    $.ajax({
        'url': '/forums/' + forumId + '/comments/' + commentId + "/dislike",
        'type': 'PUT',
        'success': function(res) {
            console.log($(event.target).siblings('span'));
            $(event.target).siblings('span').text(res.dislikes.length);
            $(event.target).closest('li').siblings('li').children('span').text(res.likes.length);
        },
        'error': function(err) {
            if (err) {
                // window.location.href = '/log_in';
                console.log(err);
            }
        },
        'dataType': 'json'
    })
}

function subComment(commentId) {
    $('#' + commentId + " > form textarea").val("");
    $('#' + commentId + " > form textarea").data("editing", "false");
    window["comment-" + commentId].update();
    $('#' + commentId + " > form textarea").val();
    $("#" + commentId + " > form").show();
}

function editComment(commentId) {
    $('#' + commentId + " > form textarea").val($('#' + commentId + " .content").data("original").toString().trim());
    $('#' + commentId + " > form textarea").data("editing", "true");
    window["comment-" + commentId].update();
    $('#' + commentId + " > form textarea").val();
    $("#" + commentId + " > .view").hide();
    $("#" + commentId + " > form").show();
}

function submitEditComment(commentId) {
    var editedText = $('#' + commentId + " textarea").val();
    if (editedText === "") {
        return;
    }

    if ($('#' + commentId + " > form textarea").data("editing") === "false") {
        return $("#" + commentId + " > form").submit();
    }
    var queryString = "comment=" + encodeURIComponent(editedText);

    $('#' + commentId + " > form input").attr("disabled", "disabled");
    $.ajax({
        'url': '/forums/' + forumId + '/comments/' + commentId + '?'  + queryString,
        'type': 'PUT',
        'success': function(res) {
            $('#' + commentId + " > .view .content").html(res.content);
            $('#' + commentId + " > .view .content").data("original", editedText);
            $("#" + commentId + " > .view").show();
            $("#" + commentId + " > form").hide();
            $('#' + commentId + " > form input").removeAttr("disabled");
        },
        'error': function(err) {
            if (err) {
                $("#" + commentId + " > .view").show();
                $("#" + commentId + " > form").hide();
                $('#' + commentId + " > form input").removeAttr("disabled");
                // window.location.href = '/log_in';
                console.log(err);
            }
        },
        'dataType': 'json'
    });
    return false;
}

function cancelEditComment(commentId) {
    $("#" + commentId + " > .view").show();
    $("#" + commentId + " > form").hide();
    return false;
}

function deleteComment(commentId) {
    $.ajax({
        'url': '/forums/' + forumId + '/comments/' + commentId,
        'type': 'DELETE',
        'success': function(res) {
            $("#" + commentId).remove();
        },
        'error': function(err) {
            if (err) {
                // window.location.href = '/log_in';
                console.log(err);
            }
        },
        'dataType': 'json'
    });
    return false;
}

// This works...
function displayEdit() {
    $("#editForum").show();
    $("#viewForum").hide();
    $("#loadingForum").hide();
}
function hideEdit() {
    $("#editForum").hide();
    $("#viewForum").show();
    $("#loadingForum").hide();
}
function displayLoading() {
    $("#editForum").hide();
    $("#viewForum").hide();
    $("#loadingForum").show();
}

$(document).ready(function() {
    $("#cancelUpdateForum").click(function (event) {
        event.preventDefault();
        hideEdit();
    });
    $("#updateForum").click(function (event) {
        event.preventDefault();
        displayLoading();
        let forumId = $("#forumId").val();
        let title = $("#newForumTitle").val();
        let content = $("#newForumContent").val();
        let labels = $("#newForumLabels").val();
        $.ajax({
            'url': '/forums/' + forumId,
            'type': 'PUT',
            'success': function (res) {
                hideEdit();
                console.log("Successfully updated forum " + forumId);
                $("#forumTitle").text(res.title);
                $("#forumContent").html(res.content);
                $("#forumClothing").html(
                    res.clothing.length ? '' : (
                        '<div class="col-sm-12">\
                            <li class="text-center list-group-item">\
                                <p>No clothing was tagged.</p>\
                            </li>\
                        </div>'
                    )
                );
                $("#forumLabels").html(
                    res.labels.length ? 
                        '<h2> Labels </h2><p>' + res.labels + '</p>' : ''
                );
                for (cloth of res.clothing) {
                    $("#forumClothing").append(
                        '<div class="col-sm-6 col-md-4">\
                            <div class="thumbnail">\
                                <a href="' + cloth.url + '" target="_blank" alt="' + cloth.name + '">\
                                    <img src="' + cloth.image + '" alt="' + cloth.name + '" />\
                                </a>\
                                <div class="caption">\
                                    <h3>' + cloth.name + '</h3>\
                                    <p>$' + cloth.price + '</p>\
                                </div>\
                            </div>\
                        </div>'
                    )
                }
            },
            'error': function (err) {
                if (err) {
                    console.log(err);
                }
            },
            'data': {
                "title": title,
                "content": content,
                "labels": labels
            },
            'dataType': 'json'
        });
    });
    $("#deleteForum").click(function (event) {
        event.preventDefault();
        let forumId = $("#forumId").val();
        $.ajax({
            'url': '/forums/' + forumId,
            'type': 'DELETE',
            'success': function (res) {
                console.log("Successfully deleted forum " + forumId);
                window.location = res.redirect;
            },
            'error': function (err) {
                if (err) {
                    console.log(err);
                }
            }
        });
    });

});
