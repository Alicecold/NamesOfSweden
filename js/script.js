
let current = { name: "", info: [] };

document.getElementById("search_btn").onclick = function () {
    var name = document.getElementById("search_field").value;
    getSCBData(name);
}

function setTitle(name) {
    document.getElementById("title_text").innerHTML = "Results for the name: " + name;
}

function setTitleNameNotFound(name) {
    document.getElementById("title_text").innerHTML = "The name '" + name + "' could not be found. It might be too uncommon (< 10 newborns/year since 1998) or there might be a spelling error.";
    document.getElementById("saved_btn").style.display = "none";
    document.getElementById("result_table").style.display = "none";
}

function getSCBData(input) {
    /* Yaaaay JQuery */
    $.support.cors = true;
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

            if (outputArray.length > 0) {
                current.name = input;
                current.info = outputArray;
                showResults(outputArray);
                setTitle(input);
            }

            document.getElementById("saved_btn").style.display = "inline";
        },
        error: function (jqXHR, status, thrown) {
            setTitleNameNotFound(input);
        }
    });
}


function showResults(output) {
    var resultTable = document.getElementById("result_table");

    resultTable.style.display = "inline-block";
    resultTable.innerHTML = "<tr><th>Year</th><th>Number of Newborn Swedes</th></tr>";
    for (var i = 0; i < output.length; i++) {
        resultTable.innerHTML += "<tr><td>" + output[i][0] + "</td><td>" + output[i][1] + "</td></tr>";
    }
}



/* Firebase */

/*Login/logout*/
document.getElementById("login_btn").onclick = function () {
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

firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
        var isAnonymous = user.isAnonymous;
        var uid = user.uid;
        console.log("Logged In: " + uid);
        if (savedList()) {
            document.getElementById("saved_list").style.display = "inline";
        }
    } else {
        console.log("Logged out");
    }
});

/*Collect from firebase */
savedList = function () {
    var userId = firebase.auth().currentUser.uid;
    firebase.database().ref('/users/' + userId).once('value', function (snapshot) {
        var listString = "";
        snapshot.forEach(function (childSnapshot) {
            listString += `<li class="namelist">${childSnapshot.key}</li>`;
        });
        document.getElementById("datalist").innerHTML = listString;
    });
}

/*Put to firebase*/
document.getElementById("saved_btn").onclick = function () {
    firebase.database().ref("users/" + firebase.auth().currentUser.uid + "/" + current.name).set({
        popularity: current.info
    });
    if (savedList()) {
        document.getElementById("saved_list").style.display = "inline";
    }
}
