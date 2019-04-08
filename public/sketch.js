// Client code for battleship.
//let canvas;
let socket;
let client;

// P5JS FUNCTIONS.
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
  socket.on('bombing', bombing);
  socket.on('resetGame', resetGame);
  socket.on('win', win);
}

function draw() {
  // Call client to draw.
  client.display();
}

function mousePressed() {
  // The user clicked.
  client.clicked(mouseX, mouseY);
}

function keyPressed() {
  // The user pressed some key.
  client.pressed(keyCode, key);
}

// FUNCTIONS TO HANDLE EVENTS COMING FROM THE SERVER.
function connect(data) {
  client.connect(socket.id);
}

function initialize(data) {
  client.initialize(data);
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

function finalMaps(data) {
  client.finalMaps(data);
}

function bombing(data) {
  client.bombing(data);
}

function resetGame(data) {
  client.resetGame(data);
}

function win(data) {
  client.win(data);
}
