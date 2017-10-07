(function($) {
    var mainWrapper = $("#main");
    var profile = $("#profile-wrapper");
    var editIcon = $("#edit-icon");
    var saveIcon = $("#save-icon");
    var cancelEditIcon = $("#cancel-edit-icon");
    var avatarBox = $("#avatar");
    var editAvatarIcon = $("#editAvatar");
    // Edit Profile Fields
    var usernameInput = $('#username');
    var emailInput = $('#email');
    var genderInput = $('#gender');
    var newImage = "";
    var defaultName = usernameInput.val();
    var defaultEmail = emailInput.val();
    var defaultGender = genderInput.val();

    editIcon.click(function() {
        $.ajax({
            "url": '/profile/edit',
            "type": 'GET',
            "dataType": "html",
            "success": function(res) {
                profile.html(res);
            }
        });
    });

    // User edits image
    editAvatarIcon.change(function() {
        var reader = new FileReader();
        var file = document.querySelector('input[type=file]').files[0];
        reader.addEventListener("load", function() {
            avatarBox.attr('src', reader.result);
            newImage = reader.result;
        }, false);

        if (file) {
            reader.readAsDataURL(file);
        }
    });

    saveIcon.click(function() {
        var newProfile = {};
        var newName = usernameInput.val();
        var newEmail = emailInput.val();
        var newGender = genderInput.val();
        if ((newName.length > 0) && (newName !== defaultName)) {
            newProfile.username = newName;
        }
        if ((newEmail.length > 0) && (newEmail !== defaultEmail)) {
            newProfile.email = newEmail;
        }
        if ((newGender.length > 0) && (newGender !== defaultGender)) {
            newProfile.gender = newGender
        }
        if (newImage.length > 0) {
            newProfile.avatar = newImage;
        }
        $.ajax({
            "url": "/profile/edit",
            type: "POST",
            "dataType": "html",
            "data": newProfile,
            "success": function(res) {
                mainWrapper.html(res);
            }
        });
    });

    cancelEditIcon.click(function() {
        console.log('Canceling');
        $.ajax({
            "url": "/profile/?layout=false",
            type: "GET",
            "dataType": "html",
            "success": function(res) {
                mainWrapper.html(res);
            }
        });
    });
})(jQuery)
