// Server code for battleship.
console.log('Creating the server...');

// Setup express.
let express = require('express');
let app = express();
let port = 8080;
let server = app.listen(port);

// Serve the 'public' folder.
app.use(express.static('public'));

// Setup sockets.
let socket = require('socket.io');
let io = socket(server);
console.log('Server is running!');

// Require the master class.
let Master = require('./master.js');
let master = new Master();
console.log('Master has been created');


// Server code.

// Handle new connections.
io.sockets.on('connection', newClient);

function newClient(socket) {
  console.log('New client with socket id: ' + socket.id);
  console.log('Sending initial information...');
  io.emit('initialize', master.data);

  socket.on('ready', ready);
  function ready(data) {
    master.ready(data);
  }
}


// Log messages in server.

function send(command, data) {
  // This function allows master to send messages to this server module.

  // Log master messages.
  let message;
  switch (command) {
    case 'addPlayer':
      message = 'Adding a new player';
      break;
    case 'updateMode':
      message = 'Updating mode';
      break;
    default:
      message = 'Command not understood';
      break;
  }
  console.log('Master: ' + message);
  io.emit(command, data);
}
// Export this function.
module.exports.send = send;
