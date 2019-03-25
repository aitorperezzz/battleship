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
}

function draw() {
  // Call client to draw.
  if (client.initialized) {
    client.display();
  }
}

function connect(data) {
  // This client has connected to the server.
  // Keep a copy of its socket id.
  client.socketId = socket.id.slice();
  console.log('Client connected');
}

function initialize(data) {
  // The server has sent the basic sizes for the game.
  client.initialize(data);
}

function sizes(data) {
  client.sizes(data);
}

function clientReady() {
  // This client pressed the ready button.
  // Inform the server.
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

class Client {
  // This class handles the main logic of the client.
  constructor() {
    this.mode = 'wait';
    this.socketId;
    this.players = [];
    this.initialized = false;

    // Initialize some maps.
    this.myMap = new MyMap();
    this.enemyMap = new EnemyMap();
  }

  initialize(data) {
    // This function gets the sizes at the beginning of the game.
    console.log('Initializing the sizes of the canvas');

    // Get the sizes of the canvas and create it.
    this.canvasx = data.canvasx;
    this.canvasy = data.canvasy;
    createCanvas(this.canvasx, this.canvasy);

    // Get the sizes of the two maps.
    this.myMap.sizes = data.myMap;
    //this.enemyMap.sizes = data.enemyMap;

    this.initialized = true;
  }

  display() {
    background(0);
    this.myMap.display();
  }

  addPlayer(data) {
    console.log('Adding a new player');
    this.players.push(data);
  }

  updateMode(data) {
    // Receives a new mode and updates it.
    this.mode = data.mode;
  }
}

class MyMap {
  // This class is the map where the client's boats are.

  constructor() {
    this.sizes;

    // Create the empty grid.
    this.grid = [];
    for (let i = 0; i < 10; i++) {
      this.grid.push([]);
      for (let j = 0; j < 10; j++) {
        let cell = {
          boat: false
        };
        this.grid[i].push(cell);
      }
    }

  }

  display() {
    // Draw each of the cells with some border.
    for (let i = 0; i < 10; i++) {
      for (let j = 0; j < 10; j++) {
        if (this.grid[i][j].boat) {
          // Paint it grey.
          fill(150);
        }
        else {
          // Paint it blue.
          fill(30, 144, 255);
        }
        stroke(0);
        strokeWeight(1);
        rect(this.sizes.initialx + j * this.sizes.size, this.sizes.initialy + i * this.sizes.size, this.sizes.size, this.sizes.size);
      }
    }
  }
}

class EnemyMap {
  // This class is the information the client has about the enemy's boats.

  constructor() {
    this.sizes;
  }
}
