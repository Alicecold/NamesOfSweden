
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

function getSCBData(input) {
    $.support.cors = true;
    var nameQuery = {
        "query": [
            {
                "code": "Tilltalsnamn",
                "selection": {
                    "filter": "vs:NamnAllaFlickor",
                    "values": [
                        input + "K"
                    ]
                }
            }
        ],
        "response": {
            "format": "json"
        }
    };
    /* Yaaaay JQuery */
    $.ajax({
        type: "POST",
        url: "https://api.scb.se/OV0104/v1/doris/en/ssd/BE/BE0001/BE0001T04Ar/",   
        data: JSON.stringify(nameQuery),
        dataType: "json",
        success: function (recieved) {
            console.log("SUCCESS!");
            var outputArray = [];

            $.each(recieved.data, function(i,data) {
                outputArray.push([data.key[1], data.values]);	   
				});
            showResults(outputArray);
        },
        error: function (jqXHR, status, thrown) {
            console.log("Oooops! " + status + " " + thrown);
        }
    });
}


function showResults(output) {
    var resultTable = document.getElementById("result_table");
    
    resultTable.style.display = "inline-block";
    resultTable.innerHTML = "<tr><th>Year</th><th>Number of Baby Swedes with the name</th></tr>";
    for (var i = 0; i < output.length; i++){
        resultTable.innerHTML += "<tr><td>" + output[i][0] +  "</td><td>" + output[i][1] +  "</td></tr>";
    }

    /* When the results are shown, the option to save should as well */
    document.getElementById("saved_btn").style.display = "inline";
}

document.getElementById("saved_btn").onclick = function () {
    document.getElementById("saved_list").style.display = "inline";
}
