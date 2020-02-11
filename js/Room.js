class Room {
  constructor(house, roomInfo) {
    this.house = house;
    this.showHeader = true;
    this.roomInfo = roomInfo;
    this.roomName = this.house.currentRoom;
    this.totalTriggers = roomInfo.targets.reduce((total, target) => {

      if (target.isTrigger) {
        return total + 1
      } else return total
    }, 0)

    this.triggersLeft = this.totalTriggers;
    this.targets = []
    if (this.house.isTutorial) {
      this.showHeader = false;
      this.currentTargetId = 0;
    }

    this.setupRoom(this.roomInfo)
  }

  setupRoom() {
	location.hash=`#${this.roomName}`;
    $("#screen").children().remove();

    this.loadRoomImage(this.roomInfo).then(
      () => {
        this.blur = new Blur();
        this.blur.injectFilter();
        this.makeTreasureChest();
        this.makeCubbyBox();
        this.makeTriggerCounter();
        this.makeHint();
        this.makeHelp().then(()=>this.makeRoomTypeException());
        resizeWindow();
        $('#screen').fadeTo(1000, 1);
      }

    );
  }

makeRoomTypeException()

{
console.log(this.roomName)
  if (this.roomName.replace("%20"," ") == "Front%20Yard".replace("%20"," ")) {

setTimeout(()=>this.house.Room.targets[0].animate(false),1000);

    $.get("credits.html", (data) => {

      this.roomInfo.targets[0].postText = [data, ""]
      var md = new ModalDialog(this, this.roomInfo.targets[0], "postText", false)
      $("#helpButton").hide();
      $("#triggersLeft").hide()


        // comboInfo.css({
        //     "width": "40%",
        //     "height":"160%"
        //   });

      $('#thoughtBubble').addClass("finalCreditsBubble")

          $('#leftBubble').addClass("finalCreditsParent")


    })
  }

  if (this.roomName == "Hallway") {
    this.setupTarget(this.roomInfo.targets[this.currentTargetId])
    var md = new ModalDialog(this, this.roomInfo.targets[this.currentTargetId], "preText", false)
    md.displayTargetInfo()
  } else {

    this.setupTargets()
  }


}

  loadRoomImage(roomData) {
    var deferred = jQuery.Deferred();
    var roomDiv = $("<div/>", {
      id: "roomSVG"
    })
    $("#screen").append(roomDiv)
    $("#roomSVG").load(`img/rooms/${roomData.roomImage}`, () => {
      deferred.resolve("hurray")
    })

    return deferred.promise();
  }


  setupTargets() {

    for (var target of this.roomInfo.targets) {
      this.setupTarget(target)

    }

  }
  setupTarget(target, isPost = true) {

    this.targets.push(new Target(this, target, true));
    if (this.house.isTutorial) {
      this.blur.highlightComponent(`#${target.Name}`);
    }
  }

  removeTarget() {
    //
    this.targets.splice(this.currentTargetId, 1)
    this.currentTargetId++
    this.triggersLeft--;

    this.makeTriggerCounter()
    if (!this.triggersLeft) {
      this.house.currentRoom
    }
  }


  showItem(item) {

  }

  makeTreasureChest() {
    var treasureChest = $("<div/>", {
      id: "treasureChest"
    })
    $('#roomSVG').append(treasureChest)
  }

  makeCubbyBox() {


    $(this.roomInfo.targets).each(function(index, value) {

      if ("isTrigger" in value) {

        var cubbyBox = $("<div/>", {
          class: "cubbyBox"
        })
        cubbyBox.attr("id", "cubby_" + value.Name)
        cubbyBox.attr("class", "cubbyCopy")
        var template = $(cubbyTemplate)
        var oriObject = $(`#roomSVG #${value.Name}`).clone()
        template.append(oriObject)
        cubbyBox.append(template)
        oriObject.attr("transform", value.thumbScale)

        cubbyBox.find("g").each(function(item, val) {
          var olID = $(val).attr("id");
          $(val).attr("id", "cubbySVG_" + olID)
        })

        $("#treasureChest").append(cubbyBox)

        $(oriObject).hide();

      }
    })

  }






  getItem(itemName) {

    return this.roomInfo.targets.find((item) => item.Name == itemName)

  }


  // function countTriggers(item){
  //
  // }

  makeTriggerCounter() {

    var triggersLeftDiv = $("<div/>", {
      id: "triggersLeft",
      text: "Triggers Left: " + this.triggersLeft
    })
    $('#triggersLeft').remove()
    $("#roomSVG").append(triggersLeftDiv)
    // $("#triggersLeft").css("background-color", "green");

  }

  makeHelp() {

var dfd= $.Deferred();
  $.get("help.html", (helpHTML) => {

      var helpButton= $("<div/>", {
        id: "helpButton",
        html: "?"
      }).on("mouseover mouseout",()=> $('#help').toggle() )


      var help= $("<div/>", {
        id: "help",
        html: helpHTML
      }).hide()
      $("#roomSVG").append(helpButton,help)

      // $("#help").hide();
      dfd.resolve("Help HTML loaded")

    })
return dfd.promise();

  }
  makeHint() {

    var hintDiv = $("<div/>", {
      id: "cubbyHint"
    })


    $("#roomSVG").append(hintDiv)

    $('.cubbyCopy').on("mouseenter", (evt) => {
      // var item = this.roomInfo.targets[lookup[evt.currentTarget.id.split("_")[1]]];
      var itemName = evt.currentTarget.id.split("_")[1];
      var itemInfo = this.getItem(itemName);
      var left = `${($(evt.currentTarget).position().left + screen.width)-screen.width}px`

      $('#cubbyHint').css({
          left: left
        })
        .html(itemInfo.hint)
      $('#cubbyHint').show()

    });
    $('.cubbyCopy').on("mouseleave", function(evt) {
      $('#cubbyHint').hide()
    })
  }




}
