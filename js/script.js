
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
                    outputArray.push([data.key[1], data.values]);
                }
            });
            showResults(outputArray);
        },
        error: function (jqXHR, status, thrown) {
            console.log("Oooops! " + thrown);
            setTitleNameNotFound(input);
        }
    });
}


function showResults(output) {
    var resultTable = document.getElementById("result_table");

    resultTable.style.display = "inline-block";
    resultTable.innerHTML = "<tr><th>Year</th><th>Number of Baby Swedes with the name</th></tr>";
    for (var i = 0; i < output.length; i++) {
        resultTable.innerHTML += "<tr><td>" + output[i][0] + "</td><td>" + output[i][1] + "</td></tr>";
    }

    /* When the results are shown, the option to save should as well */
    document.getElementById("saved_btn").style.display = "inline";
}

document.getElementById("saved_btn").onclick = function () {
    document.getElementById("saved_list").style.display = "inline";

    var dbs = firebase.database();

    dbs.ref("users/test").set({
        name: "Alice",
    });

    
}
