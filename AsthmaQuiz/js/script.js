$(function() {
  resize();
  $(window).resize(resize)

  function resize() {
    $('html').css('fontSize', $('body').width() / 100 + "px")
  }
})

var answerEnum = {
  positions: ["Supine", "Prone", "Sidelying", "Sitting", "Do Not Move"],
  hotPacks: ["Cervical", "Large Rectangle", "Small Rectangle", "None"] // DIVS TO BE MADE AS B

} // DIVS TO BE MADE AS BUTTON
var retrying = false;
var currentIndex = 0;
var questionsNotAnswered = [];
var answerCount;
var scenarios = []; // ANSWER KEY
$.ajax({
  url: "//apps.tlt.stonybrook.edu/gproxy/?id=1SGBucD9XypqxRLVcywcF9xAYuWS9dPDsQH6DIIHoKhI&gid=206774682"
}).done(function(data) {

  var quizInfo = $.csv.toArrays(data);

  //console.log(quizInfo.length - 1);
  for (var i = 0; i < quizInfo.length - 1; i++) {
    questionsNotAnswered.push(i);

    scenario = {};
    scenario["hotPacks"] = {};
    scenario["positions"] = {};
    scenario["scenarioText"] = quizInfo[i + 1][quizInfo[0].indexOf("Scenario")];
    scenario["correct_hotPacks"] = quizInfo[i + 1][quizInfo[0].indexOf("Which hot pack")];
    scenario["correct_positions"] = quizInfo[i + 1][quizInfo[0].indexOf("patient position")];
    scenario["correct_image"] = quizInfo[i + 1][quizInfo[0].indexOf("Which Image")];
    quizInfo[0].forEach(function(val, idx) {

      ["hotPacks", "positions"].forEach(function(val2, idx2) {


        if (answerEnum[val2].indexOf(val) != -1) {
          scenario[val2][val] = quizInfo[i + 1][idx]

        }
      })
    })

    scenarios.push(scenario)

  }

  createAnswerAreas();
  startQuestion();

  //scenarios.push([quizInfo[i+1][0],[quizInfo[i+1][1],quizInfo[i+1][2]]]);
})

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function closeAnswerDisplay() {
  if (retrying == false) {
    openCompletedDisplay();
    nextQuestion();
  }
  document.getElementById("answerDisplay").style.left = "-100%";
}

function closeCompletedDisplay() {
  document.getElementById("completedDisplay").style.left = "-100%";
}

function createAnswerAreas() {
  for (var propertyName in answerEnum) {
    answerEnum[propertyName].forEach(function(val, idx) {

      var posDiv = $('<div/>')
      $(posDiv).html(val)
      $(posDiv).attr("id", val)

      $('#' + propertyName).append(posDiv)

    })
    $('#' + propertyName + " div").on("click", handleClick);
    $('#' + propertyName + " div").css("cursor", "pointer");
  }
}

function handleClick(evt) {

  var clickedItem = evt.target.id
  var clickedCategory = $(evt.target).parent().attr("id")
  var correctItem = capitalizeFirstLetter(scenarios[currentScenario]["correct_" + clickedCategory]);

  $('#' + clickedCategory + 'TextHeader').html(clickedItem);
  $('#' + clickedCategory + "Text").html(scenarios[currentScenario][clickedCategory][clickedItem]);

  if (clickedItem.toLowerCase() == correctItem.toLowerCase()) {
    answerCount++;
    $('#' + clickedCategory + 'Container').css({
      "pointer-events": "none"
    });

    if (answerCount > 0) {
      $("#hotPacksSection").css("visibility", "visible");
    }

    if (answerCount == 2) {
      showCorrect(clickedItem, clickedCategory);
    }

  } else {
    showIncorrect(clickedItem, clickedCategory);
  }

}


function nextQuestion() {
  if (questionsNotAnswered.length != 0) {
    startQuestion();
    $("#positionsContainer").css("visibility", "visible");
    $("#hotPacksSection").css("visibility", "hidden");
    $("#positionsText").empty();
    $("#hotPacksText").empty();
    $('#positionsContainer,#hotPacks').css("pointer-events", "auto");
    retrying = true;
  } else {
    repopulatingQuestionsNotAnswered();
  }
}

function repopulatingQuestionsNotAnswered() {
  for (var i = 0; i < scenarios.length; i++) {
    questionsNotAnswered.push(i);
  }
  currentIndex = 0;
  retrying = false;
}

function openAnswerDisplay(ChosenItem, ChosenCategory) {
  document.getElementById("answerDisplay").style.left = "0";

  var chosenHotPacksDisplay;
  var chosenHotPacksDisplayText;
  var chosenPositionDisplay;
  var chosenPositionDisplayText;
  var correctPositionDisplay = capitalizeFirstLetter(scenarios[currentScenario].correct_positions);
  var correctHotPacksDisplay = capitalizeFirstLetter(scenarios[currentScenario].correct_hotPacks);



  if (ChosenCategory == "hotPacks") {
    chosenHotPacksDisplay = capitalizeFirstLetter(ChosenItem);

    chosenHotPacksDisplayText = scenarios[currentScenario]["hotPacks"][chosenHotPacksDisplay];
    chosenPositionDisplay = capitalizeFirstLetter(scenarios[currentScenario].correct_positions);
    chosenPositionDisplayText = scenarios[currentScenario]["positions"][chosenPositionDisplay];
    $("#OverlayChosenPosition,#OverlayChosenPositionText").css('color', '#2ab673');
  } else {
    chosenPositionDisplay = capitalizeFirstLetter(ChosenItem);
    chosenPositionDisplayText = scenarios[currentScenario]["positions"][chosenPositionDisplay];
    chosenHotPacksDisplay = "None Chosen";
    chosenHotPacksDisplayText = "";
    $("#OverlayChosenPosition,#OverlayChosenPositionText,#OverlayChosenHotPacks,#OverlayChosenHotPacksText").css("color", "#ed1c24");
  }

  var correctChoiceText = correctPositionDisplay + " & " + correctHotPacksDisplay;

  $("#OverlayChosenPosition").html(chosenPositionDisplay);
  $("#OverlayChosenPositionText").html(chosenPositionDisplayText);
  $("#OverlayChosenHotPacks").html(chosenHotPacksDisplay);
  $("#OverlayChosenHotPacksText").html(chosenHotPacksDisplayText);
  $("#OverlayCorrectChoice").html(correctChoiceText);

  $("#completedDisplayHeader,#completedDisplayText,#OverlayCorrectChoice").css('color', '#2ab673');
  showImage(scenarios[currentScenario].correct_image);
}

function showCorrect(clickedItem, clickedCategory) {
  $("#OverlayHeader").html("<u>Correct</u>");
  $("#OverlayHeader,#OverlayCorrectImage,#OverlayChosenHotPacks,#OverlayChosenHotPacksText").css("color", "#2ab673");
  openAnswerDisplay(clickedItem, clickedCategory);

  questionsNotAnswered.splice(currentIndex, 1);
  currentIndex %= questionsNotAnswered.length;

  nextQuestion();
}

function showImage(imageurl) {
  document.getElementById("OverlayImage").src = "./images/" + imageurl;
}

function showIncorrect(clickedItem, clickedCategory) {
  $("#OverlayHeader").html("<u>Incorrect</u>");
  $("#OverlayHeader,#OverlayCorrectImage,#OverlayChosenHotPacks,#OverlayChosenHotPacksText").css("color", "#ed1c24");
  openAnswerDisplay(clickedItem, clickedCategory);

  currentIndex += 1;
  currentIndex %= questionsNotAnswered.length;

  nextQuestion();
}

function openCompletedDisplay() {
  document.getElementById("completedDisplay").style.left = "0";
  progress.setKey(urlVars["key"], "done");

  if (urlVars["testing"] == "true") {
    console.log('\n' + "----------Key----------")
    console.log(progress.getKey(urlVars["key"]), urlVars["key"]);
    console.log("----------Key----------" + '\n')
  }

  window.parent.updateCompletion();
}

function startQuestion() {
  answerCount = 0;
  currentScenario = questionsNotAnswered[currentIndex];
  $("#scenarioHeader").html("Scenario " + (currentScenario + 1) + " / " + scenarios.length);
  $('#scenarioText').html(scenarios[questionsNotAnswered[currentIndex]].scenarioText);


  $("#positionsTextHeader,#hotPacksTextHeader").html("Choose One Above").css({
    "background-color": "#7e828c",
    "color": "white"
  });
}
