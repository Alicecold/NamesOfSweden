// Basic onlick-interactions with the DOM 
(function () {
    document.getElementById("saved_btn").onclick = function () {
        saveToFirebase(firebase.auth().currentUser);
    }
    document.getElementById("search_btn").onclick = function () {
        
        searchForName();
    }
    document.getElementById("logout_btn").onclick = function () {
        logOut();
    }

    document.getElementById("login_anon_btn").onclick = function () {
    logIn();
}

})();