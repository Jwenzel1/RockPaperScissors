// Initialize Firebase
var config = {
  apiKey: "AIzaSyBlqs38Qmv1O2umpHGoZhmRn-jRJ5w1u60",
  authDomain: "rockpaperscissors-6d21b.firebaseapp.com",
  databaseURL: "https://rockpaperscissors-6d21b.firebaseio.com",
  projectId: "rockpaperscissors-6d21b",
  storageBucket: "rockpaperscissors-6d21b.appspot.com",
  messagingSenderId: "678716992014"
};
firebase.initializeApp(config);

var databaseRef = firebase.database();
var connectionsRef = databaseRef.ref("/connections");
var connectedRef = databaseRef.ref(".info/connected");
var p1Name;
var p2Name;
var playerKey;

// When the client's connection state changes...
connectedRef.on("value", function(snapshot) {
  // If they are connected..
  if (snapshot.val()) {
    // Add user to the connections list.
    var con = connectionsRef.push(true);
    playerKey = con.key;
    // Remove user from the connection list when they disconnect.
    con.onDisconnect().remove();
  }
});

databaseRef.ref("/players").on("child_added", function(snapshot){
  if(snapshot.val().player1){
    if($("#player1 form").is(":visible")){
      $("#player1 form").toggle();
    }
    if(!($("#player1 .hidden").is(":visible"))){
      p1Name = snapshot.val().player1;
      $("#player1 .hidden").toggle();
      $("#player1Name").text(p1Name);
    }
  }
  else if(snapshot.val().player1 != undefined){
    p1Name = "";
    $("#player1 form").show();
    $("#player1 .hidden").hide();
  }
  if(snapshot.val().player2){
    if($("#player2 form").is(":visible")){
      $("#player2 form").toggle();
    }
    if(!($("#player2 .hidden").is(":visible"))){
      p2Name = snapshot.val().player2;
      $("#player2 .hidden").toggle();
      $("#player2Name").text(p2Name);
    }
  }
  else if(snapshot.val().player2 != undefined){
    p2Name = "";
    $("#player2 form").show();
    $("#player2 .hidden").hide();
  }
});

$(document).on("click", ".btn", function(){
  if($(this).siblings("span").attr("id") === "player1Name"){
    $("#player1Info").text("You chose " + $(this).text());
  }
  else{
    $("#player2Info").text("You chose " + $(this).text());
  }
});

$(".submit").on("click", function(event){
  event.preventDefault();
  if($(this).attr("data-player") === "1"){
    p1Name = $("#player1NameInput").val();
    $("#player1Name").text(p1Name);
    databaseRef.ref("/players/player1").set({
      player1:p1Name,
      wins:0,
      ties: 0,
      losses: 0,
      controller: playerKey
    });
    databaseRef.ref("/players/player1").once("value", function(snapshot){
      if(snapshot.val().controller === playerKey){
        databaseRef.ref("/players/player1").onDisconnect().remove();
      }
    });
  }
  else{
    p2Name = $("#player2NameInput").val();
    $("#player2Name").text(p2Name);
    databaseRef.ref("/players/player2").set({
      player2:p2Name,
      wins:0,
      ties: 0,
      losses: 0,
      controller: playerKey
    });
    databaseRef.ref("/players/player2").once("value", function(snapshot){
      if(snapshot.val().controller === playerKey){
        databaseRef.ref("/players/player2").onDisconnect().remove();
      }
    });
  }
});
