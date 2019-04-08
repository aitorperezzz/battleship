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

  initialize(bundle) {
    // Master has sent some basic information on first connection.
    console.log('Initial data coming from the server');

    // Give the sizes of the maps to the Map object.
    this.map.atInitialize(bundle);
    createCanvas(this.map.sizes.canvasx, this.map.sizes.canvasy);
    this.placeCanvas();
    this.initialized = true;
  }

  placeCanvas() {
    // Called when the canvas is first created. Position it inside parent element.
    let canvas = document.getElementsByTagName('canvas')[0];
    document.getElementById('canvasArea').appendChild(canvas);
  }

  clientReady() {
    // The user has pressed the ready button.
    let data = {
      socketId: this.socketId,
    };
    socket.emit('ready', data);
  }

  modifyButtonArea() {
    // Modifies the button area according to the mode.
    let area = document.getElementById('buttonArea');
    let newButton;

    switch (this.mode) {
      case 'wait':
        // Add the ready button.
        newButton = document.createElement('button');
        newButton.setAttribute('onclick', 'client.clientReady()');
        newButton.innerHTML = 'Ready!';
        area.appendChild(newButton);
        break;
      case 'prepare':
        // Remove all previous buttons and add the finished preparing button.
        while (area.firstChild) {
          area.removeChild(area.firstChild);
        }
        newButton = document.createElement('button');
        newButton.setAttribute('onclick', 'client.sendMap()');
        newButton.innerHTML = 'Finished. Send my map!';
        area.appendChild(newButton);
        break;
    }
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
    this.modifyButtonArea();
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
