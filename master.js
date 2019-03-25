// This is the master class for the game.

// Import the server module to communicate with it.
let server = require('./server.js');

// Import the child classes.
let Map = require('./map.js');

// Define the master class.
class Master {
  constructor() {
    this.mode = 'wait';
    this.players = [];

    // Calculate some sizes for the game.
    let canvasx = 500;
    let canvasy = 600;
    let xsize = Math.min(canvasx, canvasy) * 3 / 4;
    let ysize = xsize;
    let size = xsize / 10;
    let initialx = (canvasx - xsize) / 2;
    let initialy = (canvasy - ysize) / 2;
    let myMap = {
      initialx: initialx,
      initialy: initialy,
      xsize: xsize,
      ysize: ysize,
      size: size,
    };
    /*
    let myMap = {
      'prepare': {
        // Sizes in prepare mode.
        initialx: 100,
        initialy: 100,
        xsize: 400,
        size: 40,
        ysize: 400,
      },
      'play': {
      }
    };*/

    // Decide some sizes for the enemy's map.
    /*
    let enemyMap = {

    };*/

    // Bundle all this information.
    this.data = {
      canvasx: canvasx,
      canvasy: canvasy,
      myMap: myMap
      //enemyMap: enemyMap
    };

    // Master has a map for each player.
    this.map1 = new Map(1);
    this.map2 = new Map(2);
  }

  ready(data) {
    console.log('Client with id: ' + data.socketId + ' wants to play');

    // Check that the user is not already a player.
    if (this.isPlayer(data.socketId)) {
      console.log('Client is already a player. Ignoring');
      return;
    }

    // Check that the room is not full.
    if (this.players.length >= 2) {
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
        server.send('addPlayer', newPlayer);
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
        server.send('addPlayer', newPlayer);

        // Change mode and inform clients.
        this.mode = 'prepare';
        console.log('Master is in prepare mode');
        server.send('updateMode', 'prepare');
        break;
    }
  }

  isPlayer(socketId) {
    // Receives a socket id and decides if it corresponds to a player.
    for (let k = 0; k < this.players.length; k++) {
      if (this.players[k].socketId == socketId) {
        // Client is already a player.
        return true;
      }
    }
    return false;
  }
}

// Export the master class.
module.exports = Master;
