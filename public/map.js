class Map {
  // The map class keeps track of the client's boat placements.

  constructor() {
    // Information about sizes.
    this.sizes;

    // Create the empty grid.
    this.grid = [];
    for (let i = 0; i < 10; i++) {
      this.grid.push([]);
      for (let j = 0; j < 10; j++) {
        let newCell = {
          isBoat: false
        };
        this.grid[i].push(newCell);
      }
    }

    // Create the boats for this client.
    this.boatSizes = [5, 4, 3, 3, 2];
    this.boats = [];

    for (let i = 0; i < this.boatSizes.length; i++) {
      // Create i + 1 boats of this size.
      for (let k = 0; k < i + 1; k++) {
        let newBoat = new Boat(this.boatSizes[i]);
        this.boats.push(newBoat);
      }
    }
    this.boatSelected = -1;
  }

  display(mode) {
    // Display different things depending on the mode.
    if (mode == 'prepare') {
      let sizes = this.sizes.prepare;

      // Draw each of the cells of the grid.
      for (let i = 0; i < 10; i++) {
        for (let j = 0; j < 10; j++) {
          if (this.grid[i][j].isBoat) {
            // Paint it grey.
            fill(150);
          }
          else {
            // Paint it blue.
            fill(30, 144, 255);
          }
          stroke(1);
          rect(sizes.initialx + j * sizes.size, sizes.initialy + i * sizes.size, sizes.size, sizes.size);
        }
      }

      // Display the array of boats left to locate.
      for (let k = 0; k < this.boats.length; k++) {
        if (this.boatSelected == k) {
          // Paint it yellow.
          fill(255,255,102);
        }
        else if (!this.boats[k].dropped) {
          // Paint it white.
          fill(255);
        }
        noStroke();
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
        return true;
      }
    }

    // No boat has been selected.
    return false;
  }

  availableToMove(row, col) {
    // Decides if the spot is available to live.
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

    // Now check if the cell is occupied by a piece of a boat.
    if (this.grid[row][col].isBoat) {
      return false;
    }
    return true;
  }

  manipulateBoat(keyCode, key) {
    // Manipulate the boat
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
      this.grid[boat.pieces[i].row][boat.pieces[i].col].isBoat = true;
    }

    // Remove the boat from the array.
    this.boats.splice(this.boatSelected, 1);
    this.boatSelected = -1;
    return true;
  }
}
