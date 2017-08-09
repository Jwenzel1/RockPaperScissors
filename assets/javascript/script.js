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

function updateStatsHTML(player){
  databaseRef.ref("/players/" + player).once("value", function(snapshot){
    var wins = snapshot.val().wins;
    var losses = snapshot.val().losses;
    var ties = snapshot.val().ties;
    $("#" + player + "Stats").text("Wins : " + wins + "   Losses : " + losses + "   Ties : " + ties);
    $("#" + player + "Info").text("");
  });
}

function putMessage(message){
  var $messageToAppend = $("<p>").append(message).append($("<hr>"));
  $("#messaging").prepend($messageToAppend);
}

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
      updateStatsHTML("player1");
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
      updateStatsHTML("player2");
    }
  }
  else if(snapshot.val().player2 != undefined){
    p2Name = "";
    $("#player2 form").show();
    $("#player2 .hidden").hide();
  }
});

databaseRef.ref("/playerChoices").on("value", function(snapshot){
  if(snapshot.exists() && snapshot.child("player1Choice").exists() && snapshot.child("player2Choice").exists()){
    var p1choice = snapshot.val().player1Choice;
    var p2choice = snapshot.val().player2Choice;
    var game = {Rock : "Scissors", Paper : "Rock", Scissors : "Paper"};
    databaseRef.ref("/players").once("value", function(snap){
      var p1Name = snap.val().player1.player1;
      var p2Name = snap.val().player2.player2;
      var message = p1Name + " plays " + p1choice + " and " + p2Name + " plays " + p2choice + " : ";
      if(p1choice === p2choice){ // Tie Game
        var p1Ties = snap.val().player1.ties + 1;
        var p2Ties = snap.val().player2.ties + 1;
        message += "Players Tied";
        databaseRef.ref("/players/player1").update({ties : p1Ties});
        databaseRef.ref("/players/player2").update({ties : p2Ties});
      }
      else if(game[p1choice] === p2choice){ // p1 Wins
        var p1Wins = snap.val().player1.wins + 1;
        var p2Losses = snap.val().player2.losses + 1;
        message += p1Name + " Wins!";
        databaseRef.ref("/players/player1").update({wins : p1Wins});
        databaseRef.ref("/players/player2").update({losses : p2Losses});
      }
      else{ // p2 Wins
        var p1Losses = snap.val().player1.losses + 1;
        var p2Wins = snap.val().player2.wins + 1;
        message += p2Name + " Wins!";
        databaseRef.ref("/players/player1").update({losses : p1Losses});
        databaseRef.ref("/players/player2").update({wins : p2Wins});
      }
      databaseRef.ref("/playerChoices").remove();
      updateStatsHTML("player1");
      updateStatsHTML("player2");
      putMessage(message);
    });
  }

});

databaseRef.ref("/players").on("child_removed", function(snapshot){
  if(snapshot.val().player1 !== undefined){
    p1Name = "";
    $("#player1 form").show();
    $("#player1 .hidden").hide();
  }
  else{
    p2Name = "";
    $("#player2 form").show();
    $("#player2 .hidden").hide();
  }
});

$(document).on("click", ".btn", function(){
  var player = $(this).siblings("span").attr("id");
  var buttonText = $(this).text();
  databaseRef.ref("/players").once("value", function(snapshot){
    if(snapshot.child("player1").exists() && snapshot.child("player2").exists()){
      var player1Key = snapshot.val().player1.controller;
      var player2Key = snapshot.val().player2.controller;
      if(player === "player1Name" && playerKey === player1Key){
        $("#player1Info").text("You chose " + buttonText);
        databaseRef.ref("/playerChoices").update({player1Choice: buttonText});
      }
      else if(player === "player2Name" && playerKey === player2Key){
        $("#player2Info").text("You chose " + buttonText);
        databaseRef.ref("/playerChoices").update({player2Choice: buttonText});
      }
    }
  });
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
        databaseRef.ref("/playerChoices/player1Choice").onDisconnect().remove();
        databaseRef.ref("/messages").onDisconnect().remove();
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
        databaseRef.ref("/playerChoices/player2Choice").onDisconnect().remove();
        databaseRef.ref("/messages").onDisconnect().remove();
      }
    });
  }
});

databaseRef.ref("/messages").on("child_added", function(snapshot){
  putMessage(snapshot.val());
});

$("#sendMessage").on("click", function(){
  var message = $("#textarea").val();
  $("#textarea").val("");
  if(message != ""){
    databaseRef.ref("/messages").push(message);
  }
});
