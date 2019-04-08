class Client {
  // This class handles the main logic of the client.

  constructor() {
    this.mode = 'wait';
    this.socketId;
    this.playerId;
    this.players = [];
    this.initialized = false;

    // Initialize the map.
    this.map = new ClientMap();
  }

  connect(socketId) {
    // Function triggered when the user connects for the first time.
    // Keep a copy of its socket id.
    client.socketId = socketId;
    console.log('Client connected with socket id: ' + client.socketId);
  }

  initialize(data) {
    // Master has sent some basic information at connection.
    console.log('Initializing the sizes of the canvas');

    // Give the sizes of the maps to the Map object.
    this.map.sizes = data;
    let canvas = createCanvas(this.map.sizes.canvasx, this.map.sizes.canvasy);
    canvas.parent("canvasArea");
    this.initialized = true;
  }

  display() {
    background(0);
    if (this.initialized) {
      this.map.display(this.mode);
    }
  }

  addPlayer(data) {
    console.log('Adding a new player');
    this.players.push(data);

    // If I am a player, update my player id.
    for (let k = 0; k < this.players.length; k++) {
      if (this.players[k].socketId == this.socketId) {
        // I am this player.
        this.playerId = this.players[k].playerId;
      }
    }
  }

  updateMode(data) {
    // Receives a new mode and updates it.
    console.log('Changing to ' + data + ' mode');
    this.mode = data;
  }

  clicked(mx, my) {
    // The client has clicked.

    // Check if the click was outside the canvas.
    if (mx < 0 || mx > this.map.sizes.canvasx || my < 0 || my > this.map.sizes.canvasy) {
      console.log('Click was outside the canvas. Not treating it');
      return;
    }

    // If in prepare mode, the user can only select a boat to place.
    if (this.mode == 'prepare') {
      this.map.selectBoat(mx, my);
    }

    // While in play mode, send the click to the server.
    if (this.mode == 'play') {
      let data = {
        socketId: this.socketId,
        mx: mx,
        my: my
      };
      socket.emit('click', data);
    }
  }

  pressed(keyCode, key) {
    // Receives a code of the key pressed and treats it.

    // While in prepare mode, one can manipulate the boat.
    if (this.mode == 'prepare') {
      this.map.manipulateBoat(keyCode, key);
    }
  }

  sendMap() {
    // This player has finished preparing its boats, so send the map to the server.
    let data = {
      playerId: this.playerId,
      socketId: this.socketId,
      grid: this.map.grid
    };
    socket.emit('sendMap', data);

    // TODO: change mode and something else???
  }

  bombing(data) {
    // After a bombing, receives the new maps with all information.
    this.map.bombing(data);
  }
}
