/*global variables*/
var defaultFrameRate = 5
var lookup = {};
var items = {};
var animationItem;
var animationFrame;
var soundEffects = {};
var animatingList = [];
var isAnimating;
var totalTriggers;
var stop = false;
var frameCount = 0;
var roomInfo;
var bubbleActive = false;
var phaseText = ["Find the Triggers", "Ways to Avoid the Triggers"];
var thoughtHeaderText = ["", "", ""];
var aspect;
var factorTranslate = 1;
var factorScale = 1;
var defaults = {
  "phase": 0,
  "edit": false,
  "currentItemIndex": 0,
  "itemsClicked": [],
  "currentRoom": "hallway"
}
var state = loadState();;
//var state;

/* Tutorial - Hallway
  Created three items for the hallway to show the mechanics
*/
var tutorialItems = ["Carpet", "Mold", "Rat"];
var tutorialItemCount = 0;

// Beginning room defaults

/* Close Button
  parameters: item name, thoughtTypes
  return
*/
function closeBubble(itemName, thoughtType) {
  var currentItem = roomInfo.targets.find(function(
    itemIter) {
    return itemIter.Name == itemName;
  })
  bubbleActive = false;
  $("#thoughtBubble").css({
    "display": "none"

  });
  if (currentItem.isTrigger) {


    if (thoughtType == "postText") {
      showTreasureBox(currentItem);
      state.currentItemIndex++;
      tutorialItemCount++;
      countTriggers(currentItem);
    }

    if (state.phase == 1) {
      disappear(currentItem);
    }

  }
}

function
showPreText() {
  if (roomInfo.targets[state.currentItemIndex].preText) {
    thoughts(roomInfo.targets[state.currentItemIndex], "preText")
  }
}

function
loadState() {
  var loadstate;
  var dict = getParameters()
  if (Object.keys(dict).length) {
    localStorage.clear();
    loadstate = {};
  }
  if (localStorage.hasOwnProperty("state")) {
    loadstate = JSON.parse(localStorage.getItem("state"));
  } else {
    loadstate = {}
  }

  Object.keys(dict).forEach(function(key) {
    loadstate[key] = dict[key]
  });

  Object.keys(defaults).forEach(function(key) {
    if (!loadstate.hasOwnProperty(key)) {
      loadstate[key] = defaults[key];
    }
  })
  return loadstate;
}

function
getParameterByName() {
  return false;
}

function
getParameters() {
  var dict = {};
  decodeURIComponent(window.location.search)
    .substring(1)
    .split("&")
    .forEach(function(val, idx) {
        nameVal = val.split("=");
        nameVal[1]

        if (nameVal[0] == "itemsClicked") {
          dict[nameVal[0]] = JSON.parse(decodeURIComponent(nameVal[1]));
        } else dict[nameVal[0]] = nameVal[1]
      }

    );
  return dict;
}

var fps, fpsInterval, startTime, now, then, elapsed;

$(function() {
  loadNewRoom(state.currentRoom);
});

function loadNewRoom(roomName) {
  totalTriggers = 0;
  state.currentRoom = roomName;
  if (roomName == "hallway") {
    tutorialItemCount = 0;
  }

  $('#help').addClass(`helpPhase${state.phase}`)
  $('#help').removeClass(`helpPhase${1 - state.phase}`)
  console.log(`helpPhase${1 - state.phase}`)
  if (state.phase == 1) {
    document.getElementById("phaseNum").style.backgroundColor = "#00e673";
    document.getElementById("triggersLeft").style.backgroundColor = "#00e673";
  }
  if (state.phase == 0) {
    document.getElementById("phaseNum").style.backgroundColor = "#b01616";
    document.getElementById("triggersLeft").style.backgroundColor = "#b01616";
  }
  $('#phaseNum')
    .html(`Phase ${parseInt(state.phase) + 1.0}: ${phaseText[state.phase]}`);
  var Dev = "";
  $.getJSON("json/" + roomName + Dev + ".json", function(data) {
    roomInfo = data;
    console.log(roomInfo)
    if (roomName == "frontYard") {
      $.get("credits.html", function(data) {
        roomInfo.targets[0].postText = [data, ""]
        $("#help").hide();

      })


    }
    $("#roomSVG").load("img/rooms/" + data.roomImage, roomSvgLoad);

    resizeWindow();
  }).fail(function() {
    console.log("I failed", "img/rooms/" + data)
  })
}

function removeHighlightCopy() {
  // FOR EVERY OBJECT WITH AN ID THAT CONTAINS THE WORD "COPY", REMOVE THE
  // OBJECT
  $("[id$='BlurCopy']").remove();
}

function highlightComponent(id) {

  var origPart = $(id);
  var clonePart = $(id).clone();
  lastPart = clonePart;
  clonePart.attr("pointer-events", "none");
  clonePart.toggleClass("highlightPart");
  clonePart.attr("id", id.replace("#", "") + "BlurCopy");

  clonePart.attr("filter", "url(#blurMe)");
  clonePart.attr("transform", $(id).attr("transform"));
  clonePart.children().attr("fill", "rgb(255,0,0)");
  clonePart.insertBefore($(id));
  return clonePart;
}

function roomSvgLoad() {
  var filter = document.createElementNS("http://www.w3.org/2000/svg", "filter");
  filter.setAttribute("id", "blurMe");
  var gaussianFilter =
    document.createElementNS("http://www.w3.org/2000/svg", "feGaussianBlur");
  gaussianFilter.setAttribute("in", "SourceGraphic");
  gaussianFilter.setAttribute("stdDeviation", "2");
  filter.appendChild(gaussianFilter);
  $('svg').prepend(filter)
  $("#treasureChest").empty();

  $(roomInfo.targets).each(function(index, value) {
    if ("audioFile" in value) {
      soundEffects[value.Name] = ss_soundbits("audio/" + value.audioFile);
    }
    if ("isTrigger" in value) {

      var cubbyDiv = $(".cubbyCopier").clone()

      cubbyDiv.attr("id", "cubby_" + value.Name)
      cubbyDiv.attr("class", "cubbyCopy")

      $("#treasureChest").append(cubbyDiv)
      var cubbySVG = $("#cubby_" + value.Name + " svg");

      var cubbyItem = jQuery("#" + value.Name).clone();

      cubbyItem.attr("id", "cubbySVG_" + value.Name);
      var opacityVal = "1";

      if (state.itemsClicked.indexOf(value.Name) == -1) {

        opacityVal = "0";
      }

      cubbyItem.appendTo(cubbySVG).css('opacity', opacityVal);
      console.log(value.Name)
      cubbyItemBBox =
        document.getElementById("cubbySVG_" + value.Name).getBBox()

      $("#cubbySVG_" + value.Name + ' g[id]').each(function(item, val) {
        var oldID = $(val).attr("id");
        $(val).attr("id", "cubbySVG_" + oldID)
      })

      document.getElementById("cubbySVG_" + value.Name)
        .setAttribute("transform", value.thumbScale || "");
      resizeWindow();
      totalTriggers++;
    }

    $("#" + value.Name).addClass("clickable")
    lookup[value.Name] = index;
    aspect = 1 / 1
  })
  $('.cubbyCopy').on("mouseenter", function(evt) {
    var item = roomInfo.targets[lookup[evt.currentTarget.id.split("_")[1]]];
    var width = $(evt.currentTarget).width()

    $('#cubbyHint').text(item["hint"]);
    // if(item.hintXValue){
    //   var left = `${$(evt.currentTarget).position().left + width / 2.4}px`
    //
    // }
    var left = `${($(evt.currentTarget).position().left + width)-width}px`
    console.log(left)
    $("#cubbyHint").css({
      left: left
    });
    $('#cubbyHint').show()
    //  highlightComponent("#" + item.Name)
  })
  $('.cubbyCopy').on("mouseleave", function(evt) {
    $('#cubbyHint').hide()
    // removeHighlightCopy()
  });

  state.triggersLeft = totalTriggers;
  if (totalTriggers < 4) {
    $(".cubbyCopy").css("width", "25%")
    $(".cubbyCopy").css("height", "90%")
  } else {
    $(".cubbyCopy").css("width", (100 / totalTriggers) + "%")
  }
  makeClickEvents();
  if (state.currentRoom == "frontYard") {
    hideLRBubbles();
    $(".clickable").trigger("click")
  } else {
    displayTriggersLeft();
  }

  showPreText();

  $('body').animate({
    "opacity": 1
  }, 1000)

  resizeWindow();
}

function makeClickEvents() {
  $(".clickable").on("click", function(evt) {
    console.log($("#thoughtBubble").is(":visible"))
    if (!$("#thoughtBubble").is(":visible") || state.currentRoom == "hallway") {
      bubbleActive = true;


      var clickedItem = evt.currentTarget.id
      if (state.currentRoom == "hallway") {
        if (clickedItem == tutorialItems[tutorialItemCount]) {
          itemClicked(clickedItem)
          $('#thoughtHeader').show();
          closeBubble(clickedItem, "preText")
        }
      } else {
        itemClicked(clickedItem)
        $('#thoughtHeader').show();
        closeBubble(clickedItem, "preText")
      }
    }
  });

  //      $('#roomSVG > *').not( ".clickable" ).off("mouseup").on("mouseup", function(e) {
  //console.log($(e.target).parent())

  //          $("#close").trigger("click");
  //});




}

function itemClicked(clickedItem) {
  $(".clickable").css("pointer-events", "none");
  var item = roomInfo.targets[lookup[clickedItem]];
  var fps = item.frameRate || defaultFrameRate;
  if ("audioFile" in item) {
    soundEffects[item.Name].playclip();
  }

  startAnimating(fps, item);
};

function disappear(item) {

  $("#" + item.Name)
    .animate({
        opacity: 0,
      },
      1000,
      function() {
          $("#" + item.Name),remove();
      //  $("#" + item.Name).css("display", "none");
      });
  $("#" + item.Name).css("pointer-events", "none");
}

function showTreasureBox(item) {

  var xerox = $("#cubbySVG_" + item.Name);
  xerox.animate({
      opacity: 1,
    },
    1000,
    function() {
      transition();
    });
}

function transition() {

  console.log(state.triggersLeft, state.phase, state.currentRoom,
    roomInfo.nextRoom)
  if (!state.triggersLeft) {
    state.triggersLeft = totalTriggers;
    if (state.phase == 1) {
      state.currentRoom = roomInfo.nextRoom;
    }

    state.itemsClicked = []
    changePhase();

    loadNewRoom(state.currentRoom);
    //  return;
  } else {
    showPreText();
  }
  localStorage.setItem("state", JSON.stringify(state))
}

function thoughts(item, thoughtType) {



  if (state.edit != "true") {
    $('#thoughtHeader').hide();
  }
  if (thoughtType != "preText") {
    $('#thoughtHeader').show();
  }
  $("#thoughtBubble").removeClass("thoughtPop");

  var additionalText = ""
  if (!(state.itemsClicked.indexOf(item.Name) == -1)) {

    if (item.isTrigger) {
      additionalText = " <em>(You found this already!)</em>"
    }
  }

  displayThought(item, thoughtType)

  $("#close").off("click");
  $("#close").on("click",
    function(evt) {
      $(".clickable").css("pointer-events", "auto");
      closeBubble(item.Name, thoughtType)
    });

  function displayThought(item, thoughtType) {

    removeHighlightCopy()
    console.log(item)
    if (item[thoughtType].length < 2) {

      item[thoughtType] = [item[thoughtType][0], item[thoughtType][0]]
    }
    if (state.currentRoom == "hallway") {
      highlightComponent("#" + item.Name)
    }

    $("#thoughtBubble").css({
      "left": (item.xValue || 5) + "%",
      "top": (item.yValue || 20) + "%"
    });
    $("#thoughtBubble").addClass("thoughtPop");
    if (item[thoughtType][state.phase] || state.edit == "true") { //text not blank or blank but editable
      $("#thoughtBubble").css("display", "inline");
    }
    if (state.edit == "true") {

      createEditor($('#thoughtBubble p'), item, thoughtType)

    } else {

      var itemText = item.Title || item.bannerText || "None"
      var headerText = thoughtHeaderText[state.phase].toUpperCase()
      var pre = false;
      if (state.currentRoom == "hallway" && state.c) {
        headerText = "Found Item:"
      }

      if (state.triggersLeft == 1 && state.phase == 1 &&
        thoughtType == "postText") {
        additionalText += roomInfo.completedText;
      }
      $('#thoughtHeaderText').html("&nbsp;" + headerText + " " + itemText)

      if (state.currentRoom == "frontYard") {

        $('#thoughtHeader').hide();

      }
      $("#thoughtBubble p")
        .html(item[thoughtType][state.phase] + additionalText)


    }
  }
}

function createEditor(el, item, thoughtType) {
  el.html('<form><textarea id=txtArea></textarea> </form>');

  $('textarea#txtArea')
    .ckeditor({
      height: "300px",
      toolbarStartupExpanded: true,
      width: "100%"
    });

  $('textarea').val(item[thoughtType][state.phase])
  $('form').submit(function(event) {
    $.post("save.php", {
      name: item.Name,
      room: state.currentRoom,
      phase: state.phase,
      textType: thoughtType,
      text: $('textarea').val()
    }).done(function(data) {
      var location = "?edit=true&item=" + item.Name +
        "&currentRoom=" + state.currentRoom +
        "&phase=" + state.phase;
      console.log(location);
      window.location = location;
    });
    event.preventDefault();
  })
}

function countTriggers(item) {
  if ((state.itemsClicked.indexOf(item.Name) == -1)) {
    if (state.triggersLeft) {
      state.itemsClicked.push(item.Name);
      state.triggersLeft--;
    }

    displayTriggersLeft();
  }
}

function changePhase() {
  state.phase = 1 - state.phase;
  state.currentItemIndex = 0;
}

// Show TriggersLeft on the top left of the screen
function displayTriggersLeft() {
  $('#triggersLeft').html(state.triggersLeft);
}
// Hide TriggersLeft and phaseNum on the top left of the screen
function hideLRBubbles() {
  $('#triggersLeft').hide();
  $('#phaseNum').hide();
}

// initialize the timer variables and start the animation
function startAnimating(fps, item) {
  if (!isAnimating) {
    isAnimating = true;
    animationItem = item;
    animationItem.animationFrame = 1;
    animationItem.loopAmount = item.loopAmount | 0;
    animatingList.push(animationItem)
    fpsInterval = 1000 / fps;

    then = Date.now();
    startTime = then;
    animate();
  }
}

function animate() {
  if (isAnimating)
    requestAnimationFrame(animate);
  // calc elapsed time since last loop
  now = Date.now();
  elapsed = now - then;
  // if enough time has elapsed, dr)aw the next frame
  if (elapsed > fpsInterval) {
    then = now - (elapsed % fpsInterval);
    animatingList.forEach(function(item, index) {
      var itemID = item.Name.split("-")[0] + "-";
      var selector = "#" + itemID;
      var animationLength = 0
      $("[id^='" + itemID + "']")
        .each(function(idx, val) {
            if (RegExp(itemID + '[0-9]*$').test(val.id)) {
              $(val).attr("style", "display:none")
              animationLength++;
            }
          }

        )

      if (item.animationFrame <=
        (animationLength * (animationItem.loopAmount + 1))) {
        // var displayFrame = (animationFrame %
        // animationItem.totalAnimationFrames) + 1 wacky cal
        var displayFrame =
          Math.abs((item.animationFrame + animationLength - 2) %
            ((animationLength - 1) * 2) -
            (animationLength - 1)) +
          1

        $(selector + displayFrame).attr("style", "display:inline")
        item.animationFrame++
      } else {
        thoughts(item, "postText");
        removeHighlightCopy();
        delete animatingList[index]
        isAnimating = false;
        if (item.stopAtEnd) {
          $(selector + animationLength).attr("style", "display:inline");
        } else {
          $(selector + 1).attr("style", "display:inline");
        }
      }
    });
  }
}
