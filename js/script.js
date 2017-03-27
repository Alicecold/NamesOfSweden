
let current = { name: "", info: [] };



searchForName = function () {
    var name = document.getElementById("search_field").value;
    getSCBData(name);
    console.log("search");
    return false; //false -> the inline onSubmit in HTML will not try to submit using adressbar 
}
setTitle = function (name, reason) {
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
hideMainTable = function () {
    styleDisplayById("saved_btn", "none");
    styleDisplayById("result_table", "none");
}


fixCaseOfName = function (input) {
    return input.substring(0, 1).toUpperCase() + input.substring(1, input.length).toLowerCase();
}


getSCBData = function (input, user) {
    /* Yaaaay JQuery */
    $.support.cors = true;

    /* SCB API Expects first letter to be Upper case */
    input = fixCaseOfName(input);
    console.log(input);
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
            console.log(outerWidth.length);
            /* Sorting out false alarms*/
            if (outputArray.length > 0) {
                current.name = input;
                current.info = outputArray;
                createTableResults(outputArray);
                setTitle(input, "found");
                ableToSave(true, firebase.auth().currentUser);
            } else {
                setTitle(input, "notfound");
                hideMainTable();
                ableToSave(false, firebase.auth().currentUser);
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
    resultTable.innerHTML = "<tr><th>Year</th><th>Number of Newborn Swedes</th></tr>";
    for (var i = 0; i < output.length; i++) {
        if (i % 2 == 0)
            resultTable.innerHTML += "<tr class='nosweden-alternate-row'><td>" + output[i][0] + "</td><td>" + output[i][1] + "</td></tr>";
        else
            resultTable.innerHTML += "<tr><td>" + output[i][0] + "</td><td>" + output[i][1] + "</td></tr>";
    }
    styleDisplayById("result_table", "inline-block");
}



/* Firebase */

/* shows save-button based on the status of the user and the search */
ableToSave = function (hasSearched, user) {
    if (hasSearched && user) {
        styleDisplayById("saved_btn", "inline");
        return true;
    }
    else {
        styleDisplayById("saved_btn", "none");
        return false;
    }
}

styleDisplayById = function (element, display) {
    switch (display) {
        case "inline":
        case "none":
        case "inline-block":
            document.getElementById(element).style.display = display;
            return true;
    }
    return false;
}

/*Log in/Log out*/
logIn = function () {
    firebase.auth().signInAnonymously().catch(function (error) {

        console.log(error.code + " " + error.message);
    });
}

logOut = function (user) {
    firebase.auth().signOut().then(function () {
    }, function (error) {
        console.log(error.message);
    });

    /* some cleaning after the anonymous users */
    if (user.isAnonymous) {
        /* remove dbs entries */
        firebase.database().ref("users/" + user.uid).remove();

        /* delete user */
        user.delete().then(function () {
        }, function (error) {
            console.log(error.message);
        });
    }

}

/* response upon firebase onAuthStateChanged 
- if the user is not logged in, the user should not be able to save
- else, the user should have a favourite stats list showed for them*/
firebaseStateChangedToLogin = function (user) {
    if (user) {
        createTableFavs(user);
        return true;
    } else {
        ableToSave(false, user);
        return false;
    }
}

/* Changes the navbar and what elements that should be shown based on login state */
toggleLoggedInNavbarState = function (loggedIn) {
    if (loggedIn) {
        for (x of document.getElementsByClassName("nosweden-loggedout"))
            x.style.display = "none";
        for (x of document.getElementsByClassName("nosweden-loggedin"))
            x.style.display = "inline";
        return true;
    } else {
        for (x of document.getElementsByClassName("nosweden-loggedin"))
            x.style.display = "none";
        for (x of document.getElementsByClassName("nosweden-loggedout"))
            x.style.display = "inline";
        return false;
    }

}

/*Collect from firebase */
createTableFavs = function (user) {
    firebase.database().ref('/users/' + user.uid).once('value', function (snapshot) {
        var savedNames = [];
        snapshot.forEach(function (childSnapshot) {
            savedNames.push(childSnapshot.key);
        });

        if (savedNames.length == 0) {
            styleDisplayById("saved_list", "none");
            return false;
        }

        createFavTableFromArray(savedNames);
        createFavTableOnClicks(user);
    });

    styleDisplayById("saved_list", "inline");
    return true;
}

/* Created the HTML for the list with the saved searches */
createFavTableFromArray = function (savedNames) {
    var listString = "";
    for (name of savedNames)
        listString += `<tr><td class="nosweden-namerows nosweden-clickable">${name}</td> <td><i class="fa fa-trash nosweden-delete-item nosweden-clickable" aria-hidden="true"></i></td></tr>`;
    document.getElementById("data_list").innerHTML = listString;
}

/* Makes the searchlist clickable */
createFavTableOnClicks = function (user) {
    var rows = document.getElementsByClassName("nosweden-namerows");
    var deleteListItemIcon = document.getElementsByClassName("nosweden-delete-item"); // I assume that they will be the same number, since I created them simultaneously

    for (var i = 0; i < rows.length; i++) {
        var thisName = rows[i].innerHTML;
        rows[i].onclick = (function (thisName) {
            return function () {
                firebase.database().ref('/users/' + user.uid + '/' + thisName + '/popularity/').once('value', function (snapshot) {
                    createTableResults(snapshot.val());
                    console.log(thisName);
                });
                setTitle(thisName, "saved");
            };
        })(thisName);

        deleteListItemIcon[i].onclick = (function (thisName) {
            return function () {
                firebase.database().ref('/users/' + user.uid + '/' + thisName + '/').remove();
                setTitle(thisName, "removed");
                createTableFavs(user); // Update Table
                hideMainTable();
            };
        })(thisName);
    }
}


/*Put to firebase*/
saveToFirebase = function (user) {
    firebase.database().ref("users/" + user.uid + "/" + current.name).set({
        popularity: current.info
    });
    createTableFavs(user); //Update table
}



