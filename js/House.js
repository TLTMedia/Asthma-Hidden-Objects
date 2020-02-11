class House {

  constructor() {
    this.autoplay = false;
    this.currentRoom = "Hallway"
    var checkLocalStorage = localStorage.getItem('currentRoom')
    if (checkLocalStorage) {
      this.currentRoom = checkLocalStorage
    }


    if (window.location.hash) {
      this.currentRoom = window.location.hash.split("#")[1]
    }
    if (this.currentRoom == "Hallway") {
      this.isTutorial = true;
    } else {
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
  $(document).attr("title",`Asthma Trigger House ${this.currentRoom.replace("%20"," ")}`);
    }).fail(function() {
      window.location = "./#Hallway";
      location.reload();
    });

    localStorage.setItem('currentRoom', this.currentRoom)
  }
}
