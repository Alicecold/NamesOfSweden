
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
                        "AliceK"
                    ]
                }
            },
            {
                "code": "Tid",
                "selection": {
                    "filter": "item",
                    "values": [
                        "2016"
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
        url: "http://api.scb.se/OV0104/v1/doris/en/ssd/BE/BE0001/BE0001T04Ar/",   
        data: JSON.stringify(nameQuery),
        dataType: "json",
        success: function (data) {
            console.log("Sucess! " + data.data[0].key);
        },
        error: function (jqXHR, status, thrown) {
            console.log("Oooops! " + status + " " + thrown);
        }
    });
    showResults();
}

/* When the results are shown, the option to save should as well */
function showResults() {
    document.getElementById("saved_btn").style.display = "inline";
    document.getElementById("result_table").style.display = "inline";
}

document.getElementById("saved_btn").onclick = function () {
    document.getElementById("saved_list").style.display = "inline";
}