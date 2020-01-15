class Target {
  constructor(room, targetInfo) {
    this.room = room;
    this.isAnimating = false;
    this.currentFrame = 1;
    this.currentLoop = 1;

    this.targetInfo = targetInfo;
    this.loopAmount = this.targetInfo.loopAmount || 1;
    this.targetSelector = $(`#roomSVG  #${this.targetInfo.Name}`)

    this.targetSelector.on("click", (evt) => {


      this.itemClicked(evt)

    })

  }






  itemClicked(evt) {
    var soundEffect = ss_soundbits("audio/" + this.targetInfo.audioFile);
    soundEffect.playclip();

    this.animate().then(() => {
    setTimeout(  ()=>this.modalAndCubbyShow(evt),500)
    })
  }

  // initialize the timer variables and start the animation

  modalAndCubbyShow(evt) {

    if (this.targetInfo.isTrigger) {
      var cubbyCheck = evt.currentTarget.id.slice(0,8)

      if(cubbyCheck === "cubbySVG"){

      }else{
        this.room.removeTarget()
        var cubbyTarget = `#cubbySVG_${this.targetInfo.Name}`
        $(cubbyTarget).show(2000)
        $(cubbyTarget).off().on("click", (evt) => this.itemClicked(evt));

        $(`#${this.targetInfo.Name}`).hide("1000");
        this.room.blur.removeHighlightCopy()
        if (this.room.house.isTutorial && this.room.triggersLeft) {

          this.room.setupTarget(this.room.roomInfo.targets[this.room.currentTargetId])
        }
      }
      //  isTrigger = true;
    }
    // var item = roomData.targets[lookup[clickedItem]];

    var itemName = this.targetInfo.Name
    if (true || !$("#thoughtBubble").length) {


      if (!this.room.triggersLeft) {
        this.room.showHeader = true
      }

      this.targetModalDialog = new ModalDialog(this.room, this.targetInfo, "postText", this.room.showHeader, this.targetInfo.isTrigger)

      this.targetModalDialog.displayTargetInfo()




      this.targetSelector.off()
    }


  }


  animate(isInternal = false) {


    var framesSelector = $(`[id^="${this.targetInfo.Name}-"]`)

    if (framesSelector.length == 0) {

      this.animateDeferred = $.Deferred();
      this.animateDeferred.resolve("vfdg");
      return this.animateDeferred.promise();


    }

    framesSelector.hide();

    var currentLayer = $(`#${this.targetInfo.Name}-${this.currentFrame}`)
    $(`#${this.targetInfo.Name}-${this.currentFrame}`).show();
    if (currentLayer.length == 1) {

      this.currentFrame++
      setTimeout(() => this.animate(true), 2000 / this.targetInfo.frameRate)
    } else {
      if (this.loopAmount <= this.currentLoop) {

      $(`#${this.targetInfo.Name}-${this.currentFrame-1}`).show();

        this.animateDeferred.resolve("vfdg")

      } else {

        this.currentFrame = 1;
        this.currentLoop++;
        this.animate(true);


      }


    }
    //setTimeout(()=>animateDeferred.resolve("vfdg"),4000)
    if (!isInternal) {

      this.animateDeferred = $.Deferred();
      return this.animateDeferred.promise();

    }


  }

}
