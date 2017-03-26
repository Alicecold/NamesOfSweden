firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
        if (user.isAnonymous) {
            document.getElementById("user_info").innerHTML = "<i class='fa fa-user-circle'  aria-hidden='true'></i> Logged in <em>Anonymously</em>";
        }
        
    } else {

        document.getElementById("saved_list").style.display = "none";
        firebaseStateChangedToLogin(firebaseStateChangedToLogin(user));
    }

    var isLoggedIn = firebaseStateChangedToLogin(user);
    toggleLoggedInNavbarState(isLoggedIn);
});