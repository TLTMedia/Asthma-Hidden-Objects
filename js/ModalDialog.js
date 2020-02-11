class ModalDialog {
  constructor(room, target, textType, showHeader, isTrigger = true) {
    this.isTrigger = isTrigger;
    this.room = room;
    this.showHeader = showHeader;
    this.target = target;
    this.textType = textType;
    this.audioPlay = this.room.house.autoplay ? 'audioOn' : 'audioOff';
    this.displayTargetInfo();


  }


  displayTargetInfo() {

    this.closeModalDialog();
    this.makeDOMItems();
    this.makeModalEvents();
    setTimeout(() => this.changePlayState(), 1000)
  }

  makeModalEvents() {

    $("#AudioButton").on("click", () => this.toggleSpokenAudio())





    $("#close").click(() => {

      this.closeModalDialog();

      if (!this.room.triggersLeft) {
        this.room.house.currentRoom = this.room.roomInfo.nextRoom;
        this.room.house.isTutorial = false;
        setTimeout(()=>this.room.house.loadRoom(),1000)


      }

    })
  }


  toggleSpokenAudio() {
    $("#AudioButton").toggleClass("audioOff audioOn")
    this.room.house.autoplay = !this.room.house.autoplay;
    this.changePlayState();
  }


  changePlayState() {

    if (this.room.house.autoplay) {

      $("#audioTag")[0].play();
    } else {

      $("#audioTag")[0].pause();
    }


  }

  makeDOMItems() {


if(this.room.house.autoplay){
  var audioButton="audioOn"
}
else{
  var audioButton="audioOff"
}


    var thoughtHeader = $("<div/>", {
      id: "thoughtHeader",
      html: this.target.bannerText
    })
    var leftInfo = $("<div/>", {
      id: "leftBubble",
      html: this.target[this.textType][0]
    })
    var rightInfo = $("<div/>", {
      id: "rightBubble",
      html: this.target[this.textType][1]
    })
    var comboInfo = $("<div/>", {
      id: "thoughtBubble",
      class: "thoughtPopAnimation",
      css: {
        "left": `${this.target.xValue}%`,
        "top": `${this.target.yValue}%`
      }
    })
    var bubbles = $("<div/>", {
      id: "Bubbles"
    })
    var buttons = $("<div/>", {
      class: "ButtonBank"
    })
    var audio = $("<div/>", {
      id: "AudioButton",
      class: audioButton
    })
    var audioTag = $("<audio/>", {
      id: "audioTag",
      class: this.audioPlay
    })
    var audioSource = $("<source/>", {
      src: `audio/spokenAudio/${this.textType}/${this.room.house.currentRoom}_${this.target.Name}.mp3`
    })
    var closeButton = $("<div/>", {
      id: "close",
      html: "✖"
    })
    $("#roomSVG").append(comboInfo.append(thoughtHeader.append(buttons.append(audio, closeButton)), bubbles.append(leftInfo, rightInfo), audioTag.append(audioSource)))





    if (this.showHeader == false) {

      //leftInfo.prepend(audio);

      [closeButton, rightInfo].forEach(item => item.hide())



    }
    if (!this.isTrigger) {
      rightInfo.hide()
    }



  }



  closeModalDialog() {

    $("#thoughtBubble").remove();
  }


}
