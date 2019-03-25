// Client code for battleship.
let socket;
let client;

function setup() {
  // Initialize the client.
  client = new Client();

  // Connect to the socket.
  socket = io.connect('http://localhost:8080');

  // Declare functions to handle different events.
  socket.on('connect', connect);
  socket.on('initialize', initialize);
  socket.on('addPlayer', addPlayer);
  socket.on('updateMode', updateMode);
  socket.on('updateMaps', updateMaps);
}

function draw() {
  // Call client to draw.
  if (client.initialized) {
    client.display();
  }
}

function mousePressed() {
  // The user clicked.
  client.clicked(mouseX, mouseY);
}

function connect(data) {
  // This client has connected to the server.
  // Keep a copy of its socket id.
  client.socketId = socket.id.slice();
  console.log('Client connected');
}

function initialize(data) {
  client.initialize(data);
}

function sizes(data) {
  client.sizes(data);
}

function clientReady() {
  // This client pressed the ready button.
  let data = {
    socketId: client.socketId,
  };
  socket.emit('ready', data);
}

function addPlayer(data) {
  client.addPlayer(data);
}

function updateMode(data) {
  client.updateMode(data);
}

function updateMaps(data) {
  client.updateMaps(data);
}

class Client {
  // This class handles the main logic of the client.
  constructor() {
    this.mode = 'wait';
    this.socketId;
    this.playerId;
    this.players = [];
    this.initialized = false;

    // Initialize the map.
    this.map = new Map();
    /*
    this.grid = [];
    for (let i = 0; i < 10; i++) {
      this.grid.push([]);
      for (let j = 0; j < 10; j++) {
        let newCell = [false, false];
        this.grid.push(newCell);
      }
    }*/
  }

  initialize(data) {
    // Master has sent some basic information at connection.
    console.log('Initializing the sizes of the canvas');

    // Get the sizes of the canvas and create it.
    //this.canvasx = data.canvasx;
    //this.canvasy = data.canvasy;
    //createCanvas(this.canvasx, this.canvasy);

    // Give the sizes of the maps to the Map object.
    this.map.sizes = data;
    createCanvas(this.map.sizes.canvasx, this.map.sizes.canvasy);
    //this.enemyMap.sizes = data.enemyMap;

    this.initialized = true;
  }

  display() {
    background(0);

    if (this.mode == 'prepare') {
      this.map.display();
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
      console.log('Click was outside the canvas. Not sending');
      return;
    }

    // Only now send the click to the server.
    let data = {
      socketId: this.socketId,
      mx: mx,
      my: my,
    };
    socket.emit('click', data);
  }

  updateMaps(data) {
    // Receives the new map information and updates it.
    console.log('Updating maps');

    // Get the indexes right.
    let me = this.playerId - 1;
    let enemy = 0 ? me == 1 : 1;

    // Update the values in the client grid.
    for (let i = 0; i < 10; i++) {
      for (let j = 0; j < 10; j++) {
        this.map.grid[i][j][0] = data[i][j][me];
        this.map.grid[i][j][1] = data[i][j][enemy];
      }
    }
  }
}

class Map {
  // The map class keeps track of boat placements.

  constructor() {
    // Information about sizes.
    this.sizes;

    // Create the empty grid.
    this.grid = [];
    for (let i = 0; i < 10; i++) {
      this.grid.push([]);
      for (let j = 0; j < 10; j++) {
        let newCell = [false, false];
        this.grid[i].push(newCell);
      }
    }
  }

  display() {
    // Draw each of the cells with some border.
    for (let i = 0; i < 10; i++) {
      for (let j = 0; j < 10; j++) {
        if (this.grid[i][j][0]) {
          // Paint it grey.
          fill(150);
        }
        else {
          // Paint it blue.
          fill(30, 144, 255);
        }
        stroke(0);
        strokeWeight(1);
        let sizes = this.sizes.prepare;
        rect(sizes.initialx + j * sizes.size, sizes.initialy + i * sizes.size, sizes.size, sizes.size);
      }
    }
  }
}
