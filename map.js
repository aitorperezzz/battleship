// This is the Map class.

class Map {
  constructor() {
    // Calculate sizes for the grid placement in prepare mode.
    let canvasx = 500;
    let canvasy = 600;
    let xsize = Math.min(canvasx, canvasy) * 3 / 4;
    let ysize = xsize;
    let size = xsize / 10;
    let initialx = (canvasx - xsize) / 2;
    let initialy = (canvasy - ysize) / 2;

    // Calculate sizes for the boat placements in prepare mode.
    let xsizeBoat = canvasx * 5 / 6;
    let sizeBoat = xsizeBoat / 15;
    let ysizeBoat = sizeBoat;
    let initialxBoat = (canvasx - xsizeBoat) / 2;
    let initialyBoat = (initialy - sizeBoat) / 2;

    this.sizes = {
      canvasx: canvasx,
      canvasy: canvasy,
      prepare: {
        initialx: initialx,
        initialy: initialy,
        xsize: xsize,
        ysize: ysize,
        size: size,
        xsizeBoat: xsizeBoat,
        ysizeBoat: ysizeBoat,
        sizeBoat: sizeBoat,
        initialxBoat: initialxBoat,
        initialyBoat: initialyBoat,
      },
      play: {
        // TODO: calculate sizes for playing mode.
      }
    };

    // Create a grid to store information about both players.
    this.grid = [];
    for (let i = 0; i < 10; i++) {
      this.grid.push([]);
      for (let j = 0; j < 10; j++) {
        let newCell = [false, false];
        this.grid[i].push(newCell);
      }
    }

    this.boatSizes = [5, 4, 3, 3, 2];
    this.boats = [];
    // Create all the boats.
    for (let i = 0; i < this.boatSizes.length; i++) {
      // Create i + 1 boats of this size.
      for (let k = 0; k < i + 1; k++) {
        let newBoat = this.createBoat(this.boatSizes[i]);
        this.boats.push(newBoat);
      }
    }

  }

  clicked(mx, my, mode) {
    // Receives mouse locations and mode and decides if the grid has been clicked.
    // If so, it returns the cell clicked.
    let sizes;
    if (mode == 'prepare') {
      sizes = this.sizes.prepare;
    }

    let outsideX = mx < sizes.initialx || mx > sizes.initialx + sizes.xsize;
    let outsideY = my < sizes.initialy || my > sizes.initialy + sizes.ysize;
    if (outsideX || outsideY) {
      // The click was outside the grid.
      return undefined;
    }

    // Only now check the cell's row and column.
    for (let i = 0; i < 10; i++) {
      for (let j = 0; j < 10; j++) {
        let clickedX = mx >= sizes.initialx + j * sizes.size && mx < sizes.initialx + (j + 1) * sizes.size;
        let clickedY = my >= sizes.initialy + i * sizes.size && my < sizes.initialy + (i + 1) * sizes.size;
        if (clickedX && clickedY) {
          return [i, j];
        }
      }
    }
  }

  /*
  cellClicked(mx, my, row, col, mode) {
    // Receives a row, column and mode and decides if the cell has been clicked.
    let sizes;
    if (mode == 'prepare') {
      sizes = this.sizes.prepare;
    }

    let clickedX = mx >= sizes.initialx + col * sizes.size && mx < sizes.initialx + (col + 1) * sizes.size;
    let clickedY = my >= sizes.initialy + row * sizes.size && my < sizes.initialy + (row + 1) * sizes.size;
    return clickedX && clickedY;
  }*/

  createBoat(size) {
    // Receives a size and creates a boat of that size located at the first cell.
    let boat = [];
    for (let i = 0; i < size; i++) {
      let newCell = [0, i, true];
      boat.push(newCell);
    }
    return boat;
  }

  addBoat(row, col, playerId) {
    // Receives a row and column and a player id and adds a boat at that location.
    this.grid[row][col][playerId - 1] = true;
  }
}

// Export this class for master.
module.exports = Map;
