
let current = { name: "", info: [] };

document.getElementById("search_btn").onclick = function () {
    var name = document.getElementById("search_field").value;
    getSCBData(name);
}

function setTitle(name, reason) {
    switch (reason) {
        case "found":
            document.getElementById("title_text").innerHTML = "Results for the name: " + name;
            break;
        case "saved":
            document.getElementById("title_text").innerHTML = "Saved Results for the name: " + name;
            break;
        case "removed":
            document.getElementById("title_text").innerHTML = "Sucessfully removed " + name;
            break;
        case "notfound":
            document.getElementById("title_text").innerHTML = "The name '" + name +
                "' could not be found. It might be too uncommon (< 10 newborns/year since 1998) or there might be a spelling error.";
            break;
    }
}

function hideMainTable() {
    document.getElementById("saved_btn").style.display = "none";
    document.getElementById("result_table").style.display = "none";
}

function getSCBData(input) {
    /* Yaaaay JQuery */
    $.support.cors = true;

    /* SCB API Expects first letter to be Upper case */
    input = input.substring(0, 1).toUpperCase() + input.substring(1, input.length).toLowerCase();

    var nameQuery = {
        "query": [
            {
                "code": "Tilltalsnamn",
                "selection": {
                    "filter": "all",
                    "values": [
                        input + "*"
                    ]
                }
            },
        ],
        "response": {
            "format": "json"
        }
    };

    $.ajax({
        type: "POST",
        url: "https://api.scb.se/OV0104/v1/doris/en/ssd/BE/BE0001/BE0001T04Ar/",
        data: JSON.stringify(nameQuery),
        dataType: "json",
        success: function (recieved) {
            var outputArray = [];

            $.each(recieved.data, function (i, data) {
                /*Since Johan* also gives results like JohannaK and JohannesM */
                var recievedName = data.key[0].substring(0, data.key[0].length - 1);
                if (recievedName == input) {
                    outputArray.push([data.key[1], data.values[0]]);
                }
            });

            /* Sorting out false alarms*/
            if (outputArray.length > 0) {
                current.name = input;
                current.info = outputArray;
                createTableResults(outputArray);
                setTitle(input, "found");
                ableToSave(true);
            } else {
                setTitle(input, "notfound");
                hideMainTable();
                ableToSave(false);
            }
        },
        error: function (jqXHR, status, thrown) {
            setTitle(input, "notfound");
            hideMainTable();
        }
    });
}


function createTableResults(output) {
    var resultTable = document.getElementById("result_table");

    resultTable.style.display = "inline-block";
    resultTable.innerHTML = "<tr><th>Year</th><th>Number of Newborn Swedes</th></tr>";
    for (var i = 0; i < output.length; i++) {
        if (i % 2 == 0)
            resultTable.innerHTML += "<tr class='nosweden-alternate-row'><td>" + output[i][0] + "</td><td>" + output[i][1] + "</td></tr>";
        else
            resultTable.innerHTML += "<tr><td>" + output[i][0] + "</td><td>" + output[i][1] + "</td></tr>";
    }
}



/* Firebase */

ableToSave = function (able) {
    if (able && firebase.auth().currentUser)
        document.getElementById("saved_btn").style.display = "inline";
    else
        document.getElementById("saved_btn").style.display = "none";
}

/*Log in/Log out*/
document.getElementById("login_anon_btn").onclick = function () {
    firebase.auth().signInAnonymously().catch(function (error) {
        var errCode = error.code;
        var errMsg = error.message;

        console.log(errCode + " " + errMsg);
    });
}

document.getElementById("logout_btn").onclick = function () {
    firebase.auth().signOut().then(function () {
        console.log("Logged out");
    }, function (error) {
        console.log("Oops! " + error);
    });
}
document.getElementById("login_google_btn").onclick = function () {
    var provider = new firebase.auth.GoogleAuthProvider();
    provider.addScope('https://www.googleapis.com/auth/plus.login');
    firebase.auth().signInWithPopup(provider).then(function (result) {

        console.log("Hi google!");
    }).catch(function (error) {
        console.log("Ooops google!");
        var errorCode = error.code;
        var errorMessage = error.message;
        console.log(errorCode + " " + errorMessage);
    });
}

firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
        var isAnonymous = user.isAnonymous;
        var uid = user.uid;
        createTableFavs()
        toggleLoggedInNavbarState(true);
    } else {
        console.log("Logged out");
        ableToSave(false);
        document.getElementById("saved_list").style.display = "none";
        toggleLoggedInNavbarState(false);
    }
});

toggleLoggedInNavbarState = function (loggedIn) {
    if (loggedIn) {
        for (x of document.getElementsByClassName("nosweden-loggedout"))
            x.style.display = "none";
        for (x of document.getElementsByClassName("nosweden-loggedin"))
            x.style.display = "inline";
    } else {
        for (x of document.getElementsByClassName("nosweden-loggedin"))
            x.style.display = "none";
        for (x of document.getElementsByClassName("nosweden-loggedout"))
            x.style.display = "inline";
    }

}

/*Collect from firebase */
createTableFavs = function () {
    var userId = firebase.auth().currentUser.uid;
    firebase.database().ref('/users/' + userId).once('value', function (snapshot) {
        var listString = "";
        snapshot.forEach(function (childSnapshot) {
            listString += `<tr><td class="nosweden-namerows">${childSnapshot.key}</td> <td><i class="fa fa-trash nosweden-delete-item" aria-hidden="true"></i></td></tr>`;
        });
        document.getElementById("data_list").innerHTML = listString;
        var rows = document.getElementsByClassName("nosweden-namerows");
        var deleteListItemIcon = document.getElementsByClassName("nosweden-delete-item"); // I assume that they will be the same number, since I created them simultaneously

        if (rows.length == 0) {
            document.getElementById("saved_list").style.display = "none";
            return false;
        }


        for (var i = 0; i < rows.length; i++) {
            var thisName = rows[i].innerHTML;
            rows[i].onclick = (function (thisName) {
                return function () {
                    firebase.database().ref('/users/' + userId + '/' + thisName + '/popularity/').once('value', function (snapshot) {
                        createTableResults(snapshot.val());
                    });
                    setTitle(thisName, "saved");
                };
            })(thisName);

            deleteListItemIcon[i].onclick = (function (thisName) {
                return function () {
                    firebase.database().ref('/users/' + userId + '/' + thisName + '/').remove();
                    setTitle(thisName, "removed");
                    createTableFavs(); // Update Table
                    hideMainTable();
                };
            })(thisName);
        }
    });

    document.getElementById("saved_list").style.display = "inline";
    return true;
}

/*Put to firebase*/
document.getElementById("saved_btn").onclick = function () {
    firebase.database().ref("users/" + firebase.auth().currentUser.uid + "/" + current.name).set({
        popularity: current.info
    });
    createTableFavs()
}
