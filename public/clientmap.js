// The ClientMap class keeps track of the client's information'.
// It keeps only some information about the enemy's map.

class ClientMap {
  constructor() {
    // Information about sizes.
    this.sizes;

    // Information about the maps.
    this.grid = {};

    // Boats to be placed by the player.
    this.boatInfo = {};
    this.boats;
    this.boatSelected = -1;
    this.boatCount = 0;
  }

  initialize() {
    // This function sets the grid and the boats to the default.

    // Initialize the grid.
    for (let k = 0; k < 2; k++) {
      let grid = [];
      for (let i = 0; i < this.sizes.ynum; i++) {
        grid.push([]);
        for (let j = 0; j < this.sizes.xnum; j++) {
          let newCell = {
            isBoat: false,
            isBombed: false,
            isSunk: false,
            boatIndex: -1
          };
          grid[i].push(newCell);
        }
      }

      if (k == 0) {
        // Own grid.
        this.grid['own'] = grid;
      }
      else if (k == 1) {
        // Enemy grid.
        this.grid['enemy'] = grid;
      }
    }

    // Create the boats.
    this.createBoats();
  }

  createBoats() {
    // Creates the array of boats.
    this.boats = [];
    for (let i = 0; i < this.boatInfo.boatSizeNumber.length; i++) {
      for (let k = 0; k < this.boatInfo.boatSizeNumber[i][1]; k++) {
        let newBoat = new Boat(this.boatInfo.boatSizeNumber[i][0]);
        this.boats.push(newBoat);
      }
    }

  }

  display(mode) {
    // Display different things depending on the mode.

    // Get the right sizes.
    let sizes;
    if (mode == 'prepare') {
      sizes = this.sizes[mode];
    }
    else if (mode == 'play' || mode == 'win') {
      sizes = this.sizes['play'];
    }

    if (mode == 'prepare') {
      // Draw my own grid.
      this.displayGrid(sizes, 'own');

      // Display the array of boats left to locate.
      for (let k = 0; k < this.boats.length; k++) {
        if (this.boatSelected == k) {
          // Paint it yellow.
          fill(255,255,102);
        }
        else {
          // Paint it white.
          fill(255);
        }
        noStroke();
        //console.log(sizes);
        //noLoop();
        rect(sizes.initialxBoat + k * sizes.sizeBoat, sizes.initialyBoat, sizes.sizeBoat, sizes.sizeBoat);
        fill(0);
        textAlign(CENTER, CENTER);
        textSize(20);
        text(this.boats[k].pieces.length, sizes.initialxBoat + (k + 1/2) * sizes.sizeBoat, sizes.initialyBoat + sizes.sizeBoat / 2);
      }

      // Display the selected boat.
      if (this.boats[this.boatSelected]) {
        this.boats[this.boatSelected].display(sizes);
      }
    }
    else if (mode == 'play' || mode == 'win') {
      // Display both grids.
      this.displayGrid(sizes['own'], 'own');
      this.displayGrid(sizes['enemy'], 'enemy');
    }
  }

  displayGrid(sizes, which) {
    // Receives a sizes object and displays the selected grid.
    for (let i = 0; i < this.sizes.ynum; i++) {
      for (let j = 0; j < this.sizes.xnum; j++) {
        // Only draw the boats in my own grid.
        if (which == 'own' && this.grid[which][i][j].isBoat) {
          // Paint it grey.
          fill(150);
        }
        else {
          // Paint it blue.
          fill(30, 144, 255);
        }
        stroke(1);
        rect(sizes.initialx + j * sizes.size, sizes.initialy + i * sizes.size, sizes.size, sizes.size);

        // Draw the bombing information for both grids.
        if (this.grid[which][i][j].isBombed) {
          if (this.grid[which][i][j].isBoat) {
            // Red dot when over a boat.
            fill(255, 0, 0);
          }
          else {
            // White dot when over water.
            fill(255);
          }
          noStroke();
          ellipse(sizes.initialx + (j + 1/2) * sizes.size, sizes.initialy + (i + 1/2) * sizes.size, sizes.size / 3, sizes.size / 3);
        }
      }
    }
  }

  selectBoat(mx, my) {
    // Only in prepare mode.
    // Receives a mouse location and decides if a boat has been selected.
    let sizes = this.sizes['prepare'];
    for (let k = 0; k < this.boats.length; k++) {
      let xClicked = mx >= sizes.initialxBoat + k * sizes.sizeBoat && mx < sizes.initialxBoat + (k + 1) * sizes.sizeBoat;
      let yClicked = my >= sizes.initialyBoat && my < sizes.initialyBoat + sizes.sizeBoat;
      if (xClicked && yClicked) {
        // The k-th element in the boat array has been clicked.
        this.boatSelected = k;
        return true;
      }
    }

    // No boat has been selected.
    return false;
  }

  availableToMove(row, col) {
    // Decides if the spot is available to live.
    // Only check if the index is out of bounds.
    if (row < 0 || row > this.sizes.ynum - 1 || col < 0 || col > this.sizes.xnum - 1) {
      return false;
    }
    return true;
  }

  availableToDrop(row, col) {
    // Decides if the spot is available to drop a cell.
    if (!this.availableToMove(row, col)) {
      return false;
    }

    // Now check if the cell is occupied by a piece of a boat.
    if (this.grid['own'][row][col].isBoat) {
      return false;
    }
    return true;
  }

  manipulateBoat(keyCode, key) {
    // Manipulate the boat.
    if (this.boatSelected == -1) {
      // No boat is selected, so return.
      return;
    }

    if (keyCode == ENTER) {
      this.dropBoat();
    }
    else {
      this.boats[this.boatSelected].manipulate(keyCode, key);
    }
  }

  dropBoat() {
    // Check if the boat can be dropped.
    let boat = this.boats[this.boatSelected];
    for (let i = 0; i < boat.pieces.length; i++) {
      if (!this.availableToDrop(boat.pieces[i].row, boat.pieces[i].col)) {
        // This boat cell cannot be dropped, so return.
        return;
      }
    }

    // Actually drop the boat where it is.
    for (let i = 0; i < boat.pieces.length; i++) {
      this.grid['own'][boat.pieces[i].row][boat.pieces[i].col].isBoat = true;
      this.grid['own'][boat.pieces[i].row][boat.pieces[i].col].boatIndex = this.boatCount;
    }

    // Remove the boat from the array and reset.
    this.boats.splice(this.boatSelected, 1);
    this.boatCount++;
    this.boatSelected = -1;
    return true;
  }

  bombing(data) {
    // Receives bombing data and updates.
    // It receives a bomber id.
    let bombed = data.bombedId == client.playerId ? 'own' : 'enemy';
    this.grid[bombed][data.row][data.col].isBombed = true;
    this.grid[bombed][data.row][data.col].isBoat = data.isBoat;

    if (data.event == 'hit') {
      console.log('Boat was hit');
    }
    else if (data.event == 'water') {
      console.log('Water');
    }
    else if (data.event == 'sunk') {
      console.log('Boat was sunk');
    }
  }

  reset() {
    // After leaving the room, the game information has to be resetted.
    let players = ['own', 'enemy'];
    for (let k = 0; k < players.length; k++) {
      for (let i = 0; i < this.sizes.ynum; i++) {
        for (let j = 0; j < this.sizes.xnum; j++) {
          this.grid[players[k]][i][j] = {
            isBoat: false,
            isBombed: false,
            isSunk: false,
            boatIndex: -1
          };
        }
      }
    }
    this.createBoats();
    this.boatCount = 0;
    this.boatSelected = -1;
  }
}
