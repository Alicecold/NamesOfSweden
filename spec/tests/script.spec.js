
describe("Script", function () {
    var firebase = require("../../jasminMocks/firebase.js");
    var script = require("../../js/script.js");
    var jsdom = require("jsdom");

    beforeEach(function () {
        //Call on jsdom enviroment
        //(most of the code uses some sort of manipulation with the DOM or to Firebase,
        // so this would make some of the tests easier to run)
        jsdom.env("../../index.html", function (err, window) {
            // free memory associated with the window 
            window.close();
        });

    })

    it("should return true if a user is not null", function () {
        spyOn(global, 'createTableFavs');

        //when loginstate is changed and a user exists
        var result = firebaseStateChangedToLogin({ uid: "uid", isAnonymous: true });
        //then return true
        expect(result).toBe(true);
        expect(createTableFavs).toHaveBeenCalled();
    });

    it("should return false if a user is null", function () {
        spyOn(global, 'ableToSave');

        //when loginstate is changed and a user do not exists
        var result = firebaseStateChangedToLogin(null);

        //then return false, and has been called 
        expect(result).toBe(false);
        expect(ableToSave).toHaveBeenCalledWith(false, null);
    });
        it("should return true if the user has made a search and a user is logged in", function(){
        //Given that there is a user
        var currentUser = {uid: "uid"};
        spyOn(global,"styleDisplayById");

        //when ableToSave is called with "true" as an argument
        var result = ableToSave(true, currentUser);

        //then result is true and styleDisplayById has been called 
        expect(result).toBe(true);
        expect(styleDisplayById).toHaveBeenCalled();

    });

    it("should return false if the user has made a search and but a user isn't logged in", function(){
        //Given that there is no user
        var currentUser = null;
        spyOn(global,"styleDisplayById");

        //when ableToSave is called with "true" as an argument
        var result = ableToSave(true, currentUser);

        //then result is false and styleDisplayById has been called 
        expect(result).toBe(false);
        expect(styleDisplayById).toHaveBeenCalled();

    });

});

