(function () {
    document.getElementById("saved_btn").onclick = function () {
        saveToFirebase();
    }
    document.getElementById("search_btn").onclick = function () {
        var name = document.getElementById("search_field").value;
        searchForName(name);
    }
    document.getElementById("logout_btn").onclick = function () {
        logOut();
    }

    document.getElementById("login_anon_btn").onclick = function () {
    logIn();
}

})();