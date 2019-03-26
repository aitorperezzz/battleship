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

function keyPressed() {
  // The user is pressing some key.
  client.key(keyCode);
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

    // Give the sizes of the maps to the Map object.
    this.map.sizes = data;
    createCanvas(this.map.sizes.canvasx, this.map.sizes.canvasy);

    this.initialized = true;
  }

  display() {
    background(0);
    this.map.display(this.mode);
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

    // If in prepare mode, the user can only select a boat to place.
    if (this.mode == 'prepare') {
      this.map.selectBoat(mx, my);
    }

    /*
    // Only now send the click to the server.
    let data = {
      socketId: this.socketId,
      mx: mx,
      my: my,
    };
    socket.emit('click', data);*/
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

  key(keyCode) {
    // Receives a key code and treats it.
    if (this.mode == 'prepare') {
      // Send this information to the map.
      this.map.key(keyCode);
      return;
    }
    console.log('Something went wrong');
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

    // Create the boats for this client.
    this.boatSizes = [5, 4, 3, 3, 2];
    this.boats = [];

    for (let i = 0; i < this.boatSizes.length; i++) {
      // Create i + 1 boats of this size.
      for (let k = 0; k < i + 1; k++) {
        let newBoat = this.createBoat(this.boatSizes[i]);
        this.boats.push(newBoat);
      }
    }

    this.boatSelected = -1;
  }

  display(mode) {
    // TODO: DIFFERENCIATE THE SIZES ACCORDING TO THE MODE.
    if (mode == 'prepare') {
      let sizes = this.sizes.prepare;

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
          rect(sizes.initialx + j * sizes.size, sizes.initialy + i * sizes.size, sizes.size, sizes.size);
        }
      }

      // Display the array of boats still to place.
      for (let k = 0; k < this.boats.length; k++) {
        if (this.boatSelected == k) {
          fill(255,255,102);
        }
        else {
          fill(255);
        }
        rect(sizes.initialxBoat + k * sizes.sizeBoat, sizes.initialyBoat, sizes.sizeBoat, sizes.sizeBoat);
        fill(0);
        textAlign(CENTER, CENTER);
        textSize(15);
        noStroke();
        text(this.boats[k].length, sizes.initialxBoat + (k + 1/2) * sizes.sizeBoat, sizes.initialyBoat + sizes.sizeBoat / 2);
      }

      // Display the selected boat.
      if (this.boats[this.boatSelected]) {
        for (let k = 0; k < this.boats[this.boatSelected].length; k++) {
          fill(255,255,102);
          noStroke();
          let row = this.boats[this.boatSelected][k][0];
          let col = this.boats[this.boatSelected][k][1];
          rect(sizes.initialx + col * sizes.size, sizes.initialy + row * sizes.size, sizes.size, sizes.size);
        }
      }

      /*
      for (let i = 0; i < this.boats.length; i++) {
        for (let k = 0; k < this.boats[i].length; k++) {
          fill(150);
          noStroke();
          let row = this.boats[i][k][0];
          let col = this.boats[i][k][1];
          rect(sizes.initialx + col * sizes.size, sizes.initialy + row * sizes.size, sizes.size, sizes.size);
        }
      }*/
    }
  }

  createBoat(size) {
    // Receives a size and creates a boat of that size located at the first cell.
    let boat = [];
    for (let i = 0; i < size; i++) {
      let newCell = [0, i, true];
      boat.push(newCell);
    }
    return boat;
  }

  selectBoat(mx, my) {
    // Only in prepare mode.
    // Receives a mouse location and decides if a boat has been selected.
    let sizes = this.sizes.prepare;
    for (let k = 0; k < this.boats.length; k++) {
      let xClicked = mx >= sizes.initialxBoat + k * sizes.sizeBoat && mx < sizes.initialxBoat + (k + 1) * sizes.sizeBoat;
      let yClicked = my >= sizes.initialyBoat && my < sizes.initialyBoat + sizes.sizeBoat;
      if (xClicked && yClicked) {
        // The k-th element in the boat array has been clicked.
        this.boatSelected = k;
        console.log(k + ' th boat selected');

        // Find a good spot for that boat to enter the grid.
        this.findSpot();
        return;
      }
    }
  }

  findSpot() {
    // Tries to find a spot for the currently selected boat.
    let boat = this.boats[this.boatSelected];
    for (let i = 0; i < 10; i++) {
      for (let j = 0; j < 10; j++) {
        // Set this as a starting index and check availability for all the boat.
        let available;
        for (let k = 0; k < boat.length; k++) {
          available = this.availableToDrop(i + boat[k][0], j + boat[k][1]);
          if (!available) {
            break;
          }
        }
        if (available) {
          // The boat can be at this spot.
          for (let k = 0; k < boat.length; k++) {
            boat[k][0] = i;
            boat[k][1] = j + k;
          }
          return true;
        }
      }
    }
  }

  availableToMove(row, col) {
    // Decides if the spot is available to move a cell.
    // Only check if the index is out of bounds.
    if (row < 0 || row > 9 || col < 0 || col > 9) {
      return false;
    }
    return true;
  }

  availableToDrop(row, col) {
    // Decides if the spot is available to drop a cell.
    if (!this.availableToMove(row, col)) {
      return false;
    }

    // Now check if the cell is occupied by a boat.
    if (this.grid[row][col][0] == true) {
      return false;
    }
    return true;
  }

  key(keyCode) {
    // While in prepare mode, decide what to do with this key pressed.
    if (this.boatSelected >= 0 && this.boatSelected < this.boats.length) {
      // A boat is selected.

      // Try to move it.
      let moved;
      switch (keyCode) {
        case LEFT_ARROW:
          moved = this.moveBoat('left');
          break;
        case RIGHT_ARROW:
          moved = this.moveBoat('right');
          break;
        case UP_ARROW:
          moved = this.moveBoat('up');
          break;
        case DOWN_ARROW:
          moved = this.moveBoat('down');
          break;
        case 'R':
          this.rotate();
        case ENTER:
          this.leaveBoat();
      }

      if (moved) {
        console.log('Boat moved');
      }
      else {
        console.log('Boat not moved');
      }
    }
  }

  moveBoat(where) {
    // Try to move the boat in the requested direction.
    let boat = this.boats[this.boatSelected];

    // Try to move every cell and check for errors.
    for (let k = 0; k < boat.length; k++) {
      if (!this.moveCell(boat[k][0], boat[k][1], where, true)) {
        return false;
      }
    }

    // Actually move the boat now.
    for (let k = 0; k < boat.length; k++) {
      let result = this.moveCell(boat[k][0], boat[k][1], where, false);
      boat[k][0] = result[0];
      boat[k][1] = result[1];
    }
    return true;
  }

  moveCell(prevRow, prevCol, where, flag) {
    // Tries to move the cell in the requested direction and
    // returns the result.
    // The flag indicates if it is a try or not.
    let row = prevRow;
    let col = prevCol;
    switch (where) {
      case 'left':
        col--;
        break;
      case 'right':
        col++;
        break;
      case 'up':
        row--;
        break;
      case 'down':
        row++;
        break;
    }

    if (flag) {
      // This is a try, so check that row and column are available.
      // First check if out of bounds.
      return this.availableToMove(row, col);
    }
    else {
      // Simply move the cell.
      return [row, col];
    }
  }

  rotate() {
    // Rotate to the right a boat if possible.
    let boat = this.boats[this.boatSelected];

    let possible;
    for (let k = 0; k < boat.length; k++) {
      if (!this.availableToMove())
    }
  }

  leaveBoat() {
    // Check if I can drop the boat and only in that case, do it.
    let boat = this.boats[this.boatSelected];

    // Check if it can be dropped.
    let available;
    for (let k = 0; k < boat.length; k++) {
      available = this.availableToDrop(boat[k][0], boat[k][1]);
      if (!available) {
        return false;
      }
    }

    // Actually drop the boat where it is.
    for (let k = 0; k < boat.length; k++) {
      this.grid[boat[k][0]][boat[k][1]][0] = true;
    }

    // Take the boat out of the boats array.
    this.boats.splice(this.boatSelected, 1);
    this.boatSelected = -1;

    return true;
  }
}
