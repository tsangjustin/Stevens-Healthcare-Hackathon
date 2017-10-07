(function($) {
    var searchTimeout = undefined;
    var searchInput = $("#searchBox");
    var searchButton = $("#searhButton");
    var communityForumsList = $("#community-forums");
    var fullCommunityForum = communityForumsList.html();

    searchInput.keyup(function(e) {
    });

    searchButton.click(function(e) {
        e.preventDefault();
        clearTimeout(searchTimeout);
        var url = "/forums/search?";
        var searchParams = {};
        var titleInput = searchInput.val().trim();
        var checkedPrices = $('input[name="prices[]"]:checked');
        var checkedLabels = $('input[name="labels[]"]:checked');
        // Add title/content search in query
        if (titleInput.length > 0) {
            searchParams.title = titleInput.toLowerCase();
        }
        // Add labels to query
        if (checkedLabels.length > 0) {
            searchParams.labels = [];
            checkedLabels.each(function() {
                searchParams.labels.push(this.value);
            });
        }
        // Add prices to query
        if (checkedPrices.length > 0) {
            searchParams.prices = [];
            checkedPrices.each(function() {
                searchParams.prices.push(this.value);
            });
        }
        console.log(searchParams);
        var queryString = "";
        var queryKeys = Object.keys(searchParams);
        for (q=0, lenKeys=queryKeys.length; q < lenKeys; ++q) {
            var currKey = queryKeys[q];
            queryString += currKey + "=" + ((Array.isArray(searchParams[currKey])) ? encodeURIComponent(searchParams[currKey].join("||")) : searchParams[currKey]) + "&";
        }
        checkedPrices
        checkedPrices
        if (queryString.length <= 0) {
            communityForumsList.html(fullCommunityForum);
        } else {
            searchTimeout = setTimeout(function() {
                console.log(url);
                $.ajax({
                    "url": url + queryString,
                    "type": "GET",
                    "dataType": 'html',
                    "success": function(res) {
                        console.log(res);
                        communityForumsList.html(res);
                    }
                });
            }, 1500);
        }
    });
})(jQuery)
