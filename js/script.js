


document.getElementById("search_btn").onclick = function () {
    var name = document.getElementById("search_field").value;
    nameSearched(name);
};

function nameSearched(name) {
    setTitle(name);
    getSCBData(name);

}

function setTitle(name) {
    document.getElementById("title_text").innerHTML = "Result for the name: " + name;
}

function getSCBData(input) {
    
}