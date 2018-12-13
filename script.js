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
var phaseText = ["Find the Triggers", "Ways to avoid the triggers"];
var thoughtHeaderText = ["TRIGGER:", "How to avoid-reduce this trigger:",""];
var aspect;
var factorTranslate = 1;
var factorScale = 1;
var state;


/* Tutorial - Hallway
  Created three items for the hallway to show the mechanics
*/
var tutorialItems = ["Carpet", "Mold", "Rat"];
var tutorialItemCount = 0;

//Beginning room defaults
var defaults = {
  "phase": 0,
  "edit": false,
  "currentItemIndex": 0,
  "itemsClicked": [],
  "currentRoom": "hallway"
}



/* Close Button
  parameters: item name, thoughtTypes
  return
*/
function closeBubble(itemName, thoughtType) {
  var currentItem = roomInfo.targets.find(function(itemIter) {
    return itemIter.Name == itemName;
  })
  bubbleActive = false;
  $("#thoughtBubble").css({
    "display": "none"

  });
  if (currentItem.isTrigger) {
    if (state.phase == 1) {
      disappear(currentItem);
    }

    if (thoughtType == "postText") {
      showTreasureBox(currentItem);
      state.currentItemIndex++;
      tutorialItemCount++;
      countTriggers(currentItem);
    }
  }
}


function showPreText() {

  if (roomInfo.targets[state.currentItemIndex].preText) {
    thoughts(roomInfo.targets[state.currentItemIndex], "preText")
  }
}

function loadstate() {
  var dict = getParameters()
  if (Object.keys(dict).length) {
    localStorage.clear();
    state = {};
  }
  if (localStorage.hasOwnProperty("state")) {
    state = JSON.parse(localStorage.getItem("state"));
  } else {
    state = {}
  }

  Object.keys(dict).forEach(function(key) {
    state[key] = dict[key]
  });

  Object.keys(defaults).forEach(function(key) {

    if (!state.hasOwnProperty(key)) {
      state[key] = defaults[key];
    }
  })




}

function getParameterByName() {

  return false;

}

function getParameters() {
  var dict = {};
  decodeURIComponent(window.location.search).substring(1).split("&").forEach(function(val, idx) {

      nameVal = val.split("=");
      nameVal[1]

      if (nameVal[0] == "itemsClicked") {
        dict[nameVal[0]] = JSON.parse(decodeURIComponent(nameVal[1]));
      } else dict[nameVal[0]] = nameVal[1]
    }


  );
  return dict;
}
loadstate()

var fps, fpsInterval, startTime, now, then, elapsed;
$(window).resize(function() {
  resizeScreen();
});



$(function() {



  $('#phaseNum').html(phaseText[state.phase]);


  /* Help Button
    Click function
  */

  $("#help").on("click",function(){
  })
  loadNewRoom(state.currentRoom);

  $("#closeHome").on("click", function() {
    window.location = "https://apps.tlt.stonybrook.edu/asthma/index.html"
  })
});

function helpTip() {
    var popup = document.getElementById("helpPopUp");
    popup.classList.toggle("show");
}

function GetBrowserDim() {
  if (window.innerHeight) {
    return {
      w: window.innerWidth,
      h: window.innerHeight
    };
  } else {
    return {
      w: document.body.clientWidth,
      h: document.body.clientHeight
    };
  }
}
function resizeScreen() {
  var w = GetBrowserDim().w
  var h = GetBrowserDim().h
  // If the aspect ratio is greater than or equal to 4:3, fix height and set width based on height
  if ((w / h) >= aspect) {
    stageHeight = h;
    stageWidth = (aspect) * h * 1.35;
    stageLeft = (w - stageWidth) / 2;
    stageTop = 0;
  }
  // If the aspect ratio is less than 4:3, fix width and set height based on width
  else {
    stageWidth = w;
    stageHeight = (aspect) * w;
    stageTop = (h - stageHeight) / 2;
    stageLeft = 0;
  }

  // Set "screen" object width and height to stageWidth and stageHeight, and center screen
  $("#screen,#homescreen").css({
    width: stageWidth + "px",
    height: stageHeight + "px",
    left: stageLeft + "px",
    top: stageTop + "px"
  });
  $("html").css('fontSize', stageWidth / 70 + "px");
}

function loadNewRoom(roomName) {
  totalTriggers = 0;
  state.currentRoom = roomName;
  if(roomName == "hallway"){
    tutorialItemCount=0;
  }
  $('#phaseNum').html(phaseText[state.phase]);
  var Dev = "";
  $.getJSON("json/" + roomName + Dev + ".json", function(data) {

    roomInfo = data;

    $("#roomSVG").load("img/rooms/" + data.roomImage, roomSvgLoad);

    resizeScreen();
  }).fail(function() {

  })
}

function removeHighlightCopy() {
  // FOR EVERY OBJECT WITH AN ID THAT CONTAINS THE WORD "COPY", REMOVE THE OBJECT
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
  clonePart.children().attr("fill", "rgba(0,0,0,0)");
  clonePart.insertBefore($(id));
  return clonePart;
}

function roomSvgLoad() {
  var filter = document.createElementNS("http://www.w3.org/2000/svg", "filter");
  filter.setAttribute("id", "blurMe");
  var gaussianFilter = document.createElementNS("http://www.w3.org/2000/svg", "feGaussianBlur");
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

    cubbyDiv.on("click", function (evt) {
      var item = roomInfo.targets[lookup[evt.currentTarget.id.split("_")[1]]];

      var thoughtType = "hint";

      $('#cubbyHint').text(item[thoughtType]);
      $("#cubbyHint").css({
        left: item["hintXValue"] + "%"
      });

      var popup = document.getElementById("cubbyHint");
      popup.classList.toggle("show");
    }
);


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


      cubbyItemBBox = document.getElementById("cubbySVG_" + value.Name).getBBox()

      $("#cubbySVG_" + value.Name + ' g[id]').each(function(item, val) {

        var oldID = $(val).attr("id");
        $(val).attr("id", "cubbySVG_" + oldID)

      })


      document.getElementById("cubbySVG_" + value.Name).setAttribute("transform", value.thumbScale || "");
      resizeScreen();
      totalTriggers++;


    }



    $("#" + value.Name).addClass("clickable")
    lookup[value.Name] = index;
    aspect = 1 / 1
  })

  state.triggersLeft = totalTriggers;
  if (totalTriggers < 4) {
    $(".cubbyCopy").css("width", "25%")
    $(".cubbyCopy").css("height", "90%")
  } else {
    $(".cubbyCopy").css("width", (100 / totalTriggers) + "%")
  }
  if(state.currentRoom == "frontYard"){
    hideLRBubbles();
  }else{
    displayTriggersLeft();
    makeClickEvents();
  }

  showPreText();

  $('body').animate({
    "opacity": 1
  }, 1000)

  resizeScreen();
}

function makeClickEvents() {

  $(".clickable").on("click", function(evt) {

    if (!bubbleActive || state.currentRoom == "hallway") {
      bubbleActive = true;
      var clickedItem = evt.currentTarget.id
      if (state.currentRoom == "hallway") {
        if(clickedItem == tutorialItems[tutorialItemCount]){
          itemClicked(clickedItem)
          $('#thoughtHeader').show();
          closeBubble(clickedItem, "preText")
        }
      }else{
        itemClicked(clickedItem)
        $('#thoughtHeader').show();
        closeBubble(clickedItem, "preText")
      }

    }
  });
}

function itemClicked(clickedItem) {


  var item = roomInfo.targets[lookup[clickedItem]];
  var fps = item.frameRate || defaultFrameRate;
  if ("audioFile" in item) {
    soundEffects[item.Name].playclip();
  }

  startAnimating(fps, item);


};

function disappear(item) {


  $("#" + item.Name).animate({
      opacity: 0,
    },
    1000,
    function() {


    }
  );



}

function showTreasureBox(item) {

  var xerox = $("#cubbySVG_" + item.Name);
  xerox.animate({
      opacity: 1,
    },
    1000,
    function() {
      transition();

    }
  );
}


function transition() {
  if (!state.triggersLeft) {
    state.triggersLeft = totalTriggers;
    if(state.phase == 0){
      document.getElementById("phaseNum").style.backgroundColor = "#00e673";
      document.getElementById("triggersLeft").style.backgroundColor = "#00e673";
    }
    if (state.phase == 1) {
      document.getElementById("phaseNum").style.backgroundColor = "#b01616";
      document.getElementById("triggersLeft").style.backgroundColor = "#b01616";
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

  if(state.edit != "true"){
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
  $("#close").on("click", function(evt) {


    closeBubble(item.Name, thoughtType)

  });



  function displayThought(item, thoughtType) {
    removeHighlightCopy()

    if (state.currentRoom == "hallway") {
      highlightComponent("#" + item.Name)
    }
    if(item[thoughtType][state.phase]!=""){
    bubbleActive = true;

    $("#thoughtBubble").css({
      "left": (item.xValue || 5) + "%",
      "top": (item.yValue || 20) + "%"
    });
    $("#thoughtBubble").addClass("thoughtPop");
    $("#thoughtBubble").css("display", "inline");
    if (state.edit == "true") {

      createEditor(  $('#thoughtBubble p'),item,thoughtType)


    } else {

      var itemText = item.Title || item.bannerText
      var headerText = thoughtHeaderText[state.phase].toUpperCase()
      var pre = false;
      if(state.currentRoom == "hallway" && state.c){
        headerText = "Found Item:"
      }

      if(state.triggersLeft==1 && state.phase == 1 && thoughtType == "postText"){
        additionalText += roomInfo.completedText;
      }
      $('#thoughtHeaderText').html("&nbsp;" + headerText + " " + itemText)
      $("#thoughtBubble p").html(item[thoughtType][state.phase] + additionalText)
    }


  }

  }
}
function createEditor(el,item,thoughtType){
  el.html('<form><textarea id=txtArea></textarea> </form>');


  $('textarea#txtArea').ckeditor({
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
      window.location = "?edit=true&item=" + item.Name + "&room=" + state.currentRoom + "&phase=" + state.phase;
    });
    event.preventDefault();
  })

}

function countTriggers(item) {
  if ((state.itemsClicked.indexOf(item.Name) == -1)) {
    if(state.triggersLeft){
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


//Show TriggersLeft on the top left of the screen
function displayTriggersLeft() {
  $('#triggersLeft').html(state.triggersLeft);
}
//Hide TriggersLeft and phaseNum on the top left of the screen
function hideLRBubbles(){
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
  if (isAnimating) requestAnimationFrame(animate);
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
      $("[id^='" + itemID + "']").each(function(idx, val) {

          if (RegExp(itemID + '[0-9]*$').test(val.id)) {
            $(val).attr("style", "display:none")
            animationLength++;
          }


        }



      )






      if (item.animationFrame <= (animationLength * (animationItem.loopAmount + 1))) {
        //var displayFrame = (animationFrame % animationItem.totalAnimationFrames) + 1
        //wacky cal
        var displayFrame = Math.abs((item.animationFrame + animationLength - 2) % ((animationLength - 1) * 2) - (animationLength - 1)) + 1

        $(selector + displayFrame).attr("style", "display:inline")
        item.animationFrame++
      } else {
        thoughts(item, "postText");
        removeHighlightCopy()
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
