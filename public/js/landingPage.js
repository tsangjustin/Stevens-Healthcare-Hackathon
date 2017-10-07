(function($) {
    var forumList = $('#community-forum-list');

    $('#forums-filter').change(function(e) {
        console.log(this.value);
        $.ajax({
            "url": '/?sort_by=' + this.value,
            "type": 'PUT',
            "success": function(res) {
                console.log(res);
                var forums = res.forums;
                var forumHTML = "";
                if (forums && (Array.isArray(forums)) && (forums.length > 0)) {
                    for (var f=0, lenForums=forums.length; f < lenForums; ++f) {
                        var currForum = forums[f];
                        var forumItem = document.createElement('li');
                        forumItem.classList.add('list-group-item');
                        var forumLink = document.createElement('a');
                        forumLink.setAttribute('href', '/forums/' + currForum._id);
                        forumLink.textContent = currForum.title;
                        forumItem.appendChild(forumLink);
                        forumHTML += forumItem.outerHTML;
                    }
                    forumList.html(forumHTML);
                }
            }
        });
    });
})(jQuery)
