/* My attempt at a firabase-mock */
firebase = (function () {

    var firebase = {
    }

    firebase.database = function () {
        return true;
    }
    firebase.auth = function () {

        return true;
    }

    firebase.database().ref = function () {
        return true;
    }
    return firebase;

})();
