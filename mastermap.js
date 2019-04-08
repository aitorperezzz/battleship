// This is the MasterMap class.
// This class stores information about the maps of both players.

class MasterMap {
  constructor() {
    // General values.
    let canvasx = 500;
    let canvasy = 600;
    let xnum = 12;
    let ynum = 12;

    // Calculate sizes for the map placement in prepare mode.
    let sep = canvasy / 6;
    let xsize;
    let ysize;
    let size;
    if (canvasx / xnum < (canvasy - sep) / ynum) {
      // The x size dominates.
      xsize = canvasx * 3 / 4;
      size = xsize / xnum;
      ysize = size * ynum;
    }
    else {
      // The y size dominates.
      ysize = (canvasy - sep) * 3 / 4;
      size = ysize / ynum;
      xsize = size * xnum;
    }
    let initialx = (canvasx - xsize) / 2;
    let initialy = sep + (canvasy - sep - ysize) / 2;

    // Calculate sizes for the own map in play mode.
    let xsizeOwn = Math.min(canvasx, canvasy / 3) * 4 / 5;
    let sizeOwn = xsizeOwn / xnum;
    let ysizeOwn = sizeOwn * ynum;
    let initialxOwn = (canvasx - xsizeOwn) / 2;
    let initialyOwn = (canvasy / 3 - ysizeOwn) / 2;

    // Calculate sizes for the enemy map in play mode.
    let xsizeEnemy = Math.min(canvasx, canvasy * 2 / 3) * 4 / 5;
    let sizeEnemy = xsizeEnemy / xnum;
    let ysizeEnemy = sizeEnemy * ynum;
    let initialxEnemy = (canvasx - xsizeEnemy) / 2;
    let initialyEnemy = canvasy / 3 + (canvasy * 2 / 3 - ysizeEnemy) / 2;

    // Calculate the number of boats of each size.
    let boats = [
      [5, 1],
      [4, 1],
      [3, 3],
      [2, 3]
    ];
    let numBoats = 0;
    for (let i = 0; i < boats.length; i++) {
      numBoats = numBoats + boats[i][1];
    }

    // Calculate sizes to place the array of boats in
    // prepare mode.
    let xsizeBoat;
    let ysizeBoat;
    let sizeBoat;
    if (canvasx / numBoats < sep) {
      // The x size limits.
      xsizeBoat = canvasx * 3 / 4;
      sizeBoat = xsizeBoat / numBoats;
      ysizeBoat = sizeBoat;
    }
    else {
      // The y size limits.
      ysizeBoat = sep * 3 / 4 ;
      sizeBoat = ysizeBoat;
      xsizeBoat = sizeBoat * numBoats;
    }
    let initialxBoat = (canvasx - xsizeBoat) / 2;
    let initialyBoat = (sep - ysizeBoat) / 2;

    this.sizes = {
      canvasx: canvasx,
      canvasy: canvasy,
      xnum: xnum,
      ynum: ynum,
      'prepare': {
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
      'play': {
        'own': {
          xsize: xsizeOwn,
          ysize: ysizeOwn,
          size: sizeOwn,
          initialx: initialxOwn,
          initialy: initialyOwn,
        },
        'enemy': {
          xsize: xsizeEnemy,
          ysize: ysizeEnemy,
          size: sizeEnemy,
          initialx: initialxEnemy,
          initialy: initialyEnemy,
        }
      }
    };

    this.boatInfo = {
      boatSizeNumber: boats,
      numBoats: numBoats,
    };

    // Bundle all this information to send later.
    this.bundle = {
      sizes: this.sizes,
      boatInfo: this.boatInfo,
    };

    // Create two grids, one for each player.
    this.grid = {};
    for (let k = 1; k <= 2; k++) {
      let player = 'player' + k;
      let newGrid = [];
      for (let i = 0; i < this.sizes.ynum; i++) {
        newGrid.push([]);
        for (let j = 0; j < this.sizes.xnum; j++) {
          let newCell = {
            isBoat: false,
            isBombed: false,
            isSunk: false,
            boatIndex: -1
          };
          newGrid[i].push(newCell);
        }
      }
      this.grid[player] = newGrid;
    }
  }

  receive(data) {
    // Receives the map of a player in the appropriate format and updates.
    let player = 'player' + data.playerId;
    for (let i = 0; i < this.sizes.ynum; i++) {
      for (let j = 0; j < this.sizes.xnum; j++) {
        this.grid[player][i][j].isBoat = data.grid['own'][i][j].isBoat;
        this.grid[player][i][j].boatIndex = data.grid['own'][i][j].boatIndex;
      }
    }
  }

  logMap() {
    // Logs the map information to the server's console.
    let horLine = '';
    for (let k = 0; k < this.sizes.xnum + 2; k++) {
      horLine = horLine + '*';
    }
    for (let k = 1; k <= 2; k++) {
      let player = 'player' + k;
      console.log('Map for player ' + k);
      console.log(horLine);
      for (let i = 0; i < this.sizes.ynum; i++) {
        let output = '*';
        for (let j = 0; j < this.sizes.xnum; j++) {
          if (this.grid[player][i][j].isBoat) {
            output = output + this.grid[player][i][j].boatIndex;
          }
          else {
            output = output + ' ';
          }
        }
        console.log(output + '*');
      }
      console.log(horLine);
      console.log('');
    }
  }

  clickedEnemyGrid(mx, my) {
    // Decides if the enemy grid has been clicked while in play mode.
    let sizes = this.sizes['play']['enemy'];
    let xClicked = mx > sizes.initialx && mx < sizes.initialx + sizes.xsize;
    let yClicked = my > sizes.initialy && my < sizes.initialy + sizes.ysize;
    return xClicked && yClicked;
  }

  bomb(bomberId, mx, my) {
    // Receives a mouse location and a bomber id and bombs.
    // Then returns all the information to master.
    let bombedId = bomberId == 1 ? 2 : 1;
    let bomber = 'player' + bomberId;
    let bombed = 'player' + bombedId;

    // Get the row and column location of the bombing.
    let sizes = this.sizes['play']['enemy'];
    let row = Math.floor((my - sizes.initialy) / sizes.size);
    let col = Math.floor((mx - sizes.initialx) / sizes.size);

    // Process the bombing.
    if (this.grid[bombed][row][col].isBombed) {
      console.log('Cell is already bombed. Ignoring');
      return false;
    }
    else {
      // Bomb it.
      this.grid[bombed][row][col].isBombed = true;

      let toSend = {
        bomberId: bomberId,
        bombedId: bombedId,
        row: row,
        col: col,
        isBoat: this.grid[bombed][row][col].isBoat,
        win: false,
      };

      if (!this.grid[bombed][row][col].isBoat) {
        // Send a water event.
        console.log('Water event');
        toSend.event = 'water';
      }
      else if (this.checkSink(bombed, row, col)) {
        // Send a sunk event.
        console.log('Sunk event');
        toSend.event = 'sunk';
        toSend.win = this.checkWin(bombed);
      }
      else {
        // Send a hit event.
        console.log('Hit event');
        toSend.event = 'hit';
      }
      return toSend;
    }
  }

  checkSink(bombed, row, col) {
    // Receives bomber id and bombing location and checks if a boat is sunk.

    // Get the index of the relevant boat.
    let boatIndex = this.grid[bombed][row][col].boatIndex;
    console.log('Checking sunk boat with index ' + boatIndex);

    for (let i = 0; i < this.sizes.ynum; i++) {
      for (let j = 0; j < this.sizes.xnum; j++) {
        let cell = this.grid[bombed][i][j];
        if (cell.boatIndex === boatIndex) {
          // Check if it is bombed.
          if (!cell.isBombed) {
            // Not all the boat is bombed.
            return false;
          }
        }
      }
    }

    // The boat is sunk.
    return true;
  }

  checkWin(bombed) {
    // Only in the case of a sunk event, check is the player has won.
    for (let i = 0; i < this.sizes.ynum; i++) {
      for (let j = 0; j < this.sizes.xnum; j++) {
        if (this.grid[bombed][i][j].isBoat) {
          if (!this.grid[bombed][i][j].isBombed) {
            // There is at least one spot not bombed.
            return false;
          }
        }
      }
    }
    return true;
  }

  reset() {
    // Change values in all cells to the default.
    for (let k = 1; k <= 2; k++) {
      let player = 'player' + k;
      for (let i = 0; i < this.sizes.ynum; i++) {
        for (let j = 0; j < this.sizes.xnum; j++) {
          this.grid[player][i][j] = {
            isBoat: false,
            isBombed: false,
            isSunk: false,
            boatIndex: -1
          };
        }
      }
    }
  }
}

// INTERFACE.
// Exports.
module.exports = MasterMap;
