
var current = {name: "", info: []};

document.getElementById("search_btn").onclick = function () {
    var name = document.getElementById("search_field").value;
    nameSearched(name);
};

function nameSearched(name) {
    setTitle(name);
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
            current.name = input;
            current.info = outputArray;
            showResults(outputArray);
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


document.getElementById("saved_btn").onclick = function () {
    document.getElementById("saved_list").style.display = "inline";
    
}

document.getElementById("saved_btn").style.display = "inline";


/* Firebase */ 

document.getElementById("login_btn").onclick = function () {
    firebase.auth().signInAnonymously().catch(function (error) {
        var errCode = error.code;
        var errMsg = error.message;

        console.log( errCode + "" + errMsg);
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
    } else {
        console.log("Logged out");
    }
});

savedList = function () {
    var userId = firebase.auth().currentUser.uid;
    return firebase.database().ref('/users/' + userId).once('value').then(function (snapshot) {
        var name = snapshot.val();
        var listString = "";
        for (x in name) {
            listString += `<li>${x}</li>`;
        }
        document.getElementById("datalist").innerHTML = listString;

    });
}

document.getElementById("saved_btn").onclick = function () {
    firebase.database().ref("users/" + firebase.auth().currentUser.uid + "/" + current.name).set({
        popularity: current.info
    });
    savedList();
}
