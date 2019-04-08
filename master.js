// This is the master class for the game.
class Master {
  constructor() {
    this.mode = 'wait';
    this.players = [];

    // Create an object with information about both players.
    this.info = {
      'player1': {
        receivedMap: false,
        turn: false,
      },
      'player2': {
        receivedMap: false,
        turn: false,
      }
    };

    // Initialize a master map.
    this.mastermap = new MasterMap();
  }

  initializeClient(socketId) {
    server.send('initialize', this.mastermap.bundle, socketId);
    server.send('updateMode', 'wait', socketId);
  }

  ready(data) {
    // Receives a ready event from a client and treats it.
    console.log('Client with id: ' + data.socketId + ' wants to play');

    // Check if the client is already a player.
    if (this.getPlayer(data.socketId) != 0) {
      console.log('Client is already a player. Ignoring');
      return;
    }

    // Check if the room is full.
    if (this.players.length == 2) {
      console.log(' The room is currently full. Ignoring');
      return;
    }

    let newPlayer;

    switch (this.players.length) {
      case 0:
        console.log('Client is accepted as player 1');
        newPlayer = {
          playerId: 1,
          socketId: data.socketId,
        };

        // Add player to the master information.
        this.players.push(newPlayer);

        // Broadcast info about the new player.
        server.send('addPlayer', newPlayer, 'all');
        break;
      case 1:
        console.log('Player is accepted as player 2');
        newPlayer = {
          playerId: 2,
          socketId: data.socketId,
        };

        // Add the player to the master information.
        this.players.push(newPlayer);

        // Broadcast info about the new player.
        server.send('addPlayer', newPlayer, 'all');

        // Change mode and inform clients.
        this.mode = 'prepare';
        console.log('Master is in prepare mode');
        server.send('updateMode', 'prepare', 'all');
        break;
      default:
        console.log('Could not create a new player');
        break;
    }
  }

  getPlayer(socketId) {
    // Receives a socket id and decides if it corresponds to a player.
    for (let k = 0; k < this.players.length; k++) {
      if (this.players[k].socketId == socketId) {
        // Client is already a player.
        return this.players[k].playerId;
      }
    }
    return 0;
  }

  receiveMap(data) {
    // Receives a map from a player after preparation time.
    // TODO: check that the one sending is a player.
    console.log('Receiving map from player ' + data.playerId);
    let player = 'player' + data.playerId;
    this.mastermap.receive(data);
    this.info[player].receivedMap = true;

    // If both maps have been received, get into play mode.
    if (this.bothReceived()) {
      this.mode = 'play';
      this.info['player1'].turn = true;

      // Update modes and maps to clients.
      server.send('updateMode', this.mode, 'all');

      // Log the maps to the server's terminal.
      this.mastermap.logMap();
    }
  }

  bothReceived() {
    // Decides if the maps from the two players have been received.
    return this.info['player1'].receivedMap && this.info['player2'].receivedMap;
  }

  click(data) {
    // Receives a click inside the canvas from a client and treats it.
    console.log('Receiving a click from client');
    console.log(data);

    // Check that we are in play mode.
    if (this.mode != 'play') {
      console.log('Not in play mode. Ignoring');
      return;
    }

    // Check that the client is a player.
    let playerId = this.getPlayer(data.socketId);
    if (playerId == 0) {
      console.log('Client is not a player. Ignoring');
      return;
    }

    // Check that it's this player's turn.
    let player = 'player' + playerId;
    if (!this.info[player].turn) {
      console.log('Not this players turn. Ignoring');
      return;
    }

    // Check that the click was inside the enemy grid.
    if (!this.mastermap.clickedEnemyGrid(data.mx, data.my)) {
      console.log('Click outside the enemy grid. Ignoring');
      return;
    }

    let result = this.mastermap.bomb(playerId, data.mx, data.my);
    if (result) {
      server.send('bombing', result, 'all');
      if (result.win) {
        server.send('win', result.bomberId, 'all');
        this.mode = 'win';
      }
      this.changeTurns();
    }
  }

  changeTurns() {
    if (this.info['player1'].turn) {
      this.info['player1'].turn = false;
      this.info['player2'].turn = true;
    }
    else {
      this.info['player1'].turn = true;
      this.info['player2'].turn = false;
    }
  }

  leftRoom(socketId) {
    // A client with the received socket id has left the room.
    this.mode = 'wait';
    this.players = [];

    // Reset info.
    this.info = {
      'player1': {
        receivedMap: false,
        turn: false,
      },
      'player2': {
        receivedMap: false,
        turn: false,
      }
    };

    // Reset the map.
    this.mastermap.reset();

    // Broadcast a reset game event.
    server.send('resetGame', 0, 'all');
  }
}

// INTERFACE.
// Imports.
let server = require('./server.js');
let MasterMap = require('./mastermap.js');
// Exports.
module.exports = Master;
