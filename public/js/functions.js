var host = "ws://" + window.location.hostname + ":8080";
var ws = new WebSocket(host);
ws.onopen = function() {
    console.log("Connected");
};

ws.onmessage = function (evt) { 
    var obj = JSON.parse(evt.data);
    console.log("Message is received: " + JSON.stringify(obj));
    if (obj.type === "players") {
        updatePlayers(obj.data);
    }
};

ws.onclose = function() { 
    console.log("Connection closed"); 
};

window.onbeforeunload = function(event) {
    ws.close();
};
    
function updatePlayers(players) {
    players.sort(function(p1, p2) { return p1.score <= p2.score; });
    document.getElementById("players").innerHTML =
        "<tr><th>Position</th><th>Name</th><th>Score</th><tr>";
    for (var i = 0; i < players.length; i++) {
        document.getElementById("players").innerHTML +=
            "<tr><th>" + (i + 1) + "</th><th>" + players[i].name +
            "</th><th>" + +players[i].score + "</th><tr>";
    }
}

