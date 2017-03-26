
describe("Script", function () {
    var firebase = require("../../jasminMocks/firebase.js");
    var script = require("../../js/script.js");
    var jsdom = require("jsdom");

    beforeEach(function () {
        jsdom.env("../..index.html", function (err, window) {
            // free memory associated with the window 
            window.close();
        });
    })

    it("should return true if a user is not null", function () {
        //given the user exists and has logged in
        spyOn(global, 'createTableFavs');
        //when
        var result = firebaseStateChangedToLogin({ uid: "uid", isAnonymous: true });
        //then return true
        expect(result).toBe(true);
        expect(createTableFavs).toHaveBeenCalled();
    });

    it("should return false if a user is null", function () {
        //given the user exists and has logged in

        spyOn(global, 'ableToSave');

        var result = firebaseStateChangedToLogin(null);

        //then return true
        expect(result).toBe(false);
        expect(ableToSave).toHaveBeenCalledWith(false);
    });

});

