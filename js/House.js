class House {

  constructor() {
    this.currentRoom = "hallway"
    this.autoplay=false;
    this.isTutorial = true;
    if (window.location.hash) {
      this.currentRoom = window.location.hash.split("#")[1]

      this.isTutorial = false;
    }
    this.loadRoom(this.currentRoom)
  }
  loadRoom() {
    $.get(`JSON/${this.currentRoom}.json`, (result) => {
      this.Room = new Room(this, result)
      $('#screen').css({
        opacity: 0
      });
    });
  }
}
