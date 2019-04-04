// This is the MasterMap class.
// This class stores information about the maps of both players.

class MasterMap {
  constructor() {
    let canvasx = 500;
    let canvasy = 600;

    // Calculate sizes for the grid placement in prepare mode.
    let xsize = Math.min(canvasx, canvasy) * 3 / 4;
    let ysize = xsize;
    let size = xsize / 10;
    let initialx = (canvasx - xsize) / 2;
    let initialy = (canvasy - ysize) / 2;

    // Calculate sizes to place the array of boats in
    // prepare mode.
    let xsizeBoat = canvasx * 5 / 6;
    let sizeBoat = xsizeBoat / 15;
    let ysizeBoat = sizeBoat;
    let initialxBoat = (canvasx - xsizeBoat) / 2;
    let initialyBoat = (initialy - sizeBoat) / 2;

    // Calculate sizes for the own map in play mode.
    let xsizeOwn = Math.min(canvasx, canvasy / 3) * 4 / 5;
    let ysizeOwn = xsizeOwn;
    let sizeOwn = xsizeOwn / 10;
    let initialxOwn = (canvasx - xsizeOwn) / 2;
    let initialyOwn = (canvasy / 3 - ysizeOwn) / 2;

    // Calculate sizes for the enemy map in play mode.
    let xsizeEnemy = Math.min(canvasx, canvasy * 2 / 3) * 4 / 5;
    let ysizeEnemy = xsizeEnemy;
    let sizeEnemy = xsizeEnemy / 10;
    let initialxEnemy = (canvasx - xsizeEnemy) / 2;
    let initialyEnemy = canvasy / 3 + (canvasy * 2 / 3 - ysizeEnemy) / 2;

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

    // Create two grids, one for each player.
    this.grid = {};
    for (let k = 1; k <= 2; k++) {
      let player = 'player' + k;
      let newGrid = [];
      for (let i = 0; i < 10; i++) {
        newGrid.push([]);
        for (let j = 0; j < 10; j++) {
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
    console.log('Updating map from player ' + data.playerId);
    let player = 'player' + data.playerId;
    for (let i = 0; i < 10; i++) {
      for (let j = 0; j < 10; j++) {
        this.grid[player][i][j].isBoat = data.grid['own'][i][j].isBoat;
        this.grid[player][i][j].boatIndex = data.grid['own'][i][j].boatIndex;
      }
    }
  }

  logMap() {
    // Logs the map information to the server's console.
    for (let k = 1; k <= 2; k++) {
      let player = 'player' + k;
      console.log('Map for player ' + k);
      for (let i = 0; i < 10; i++) {
        let output = '';
        for (let j = 0; j < 10; j++) {
          if (this.grid[player][i][j].isBoat) {
            output = output + this.grid[player][i][j].boatIndex;
          }
          else {
            output = output + ' ';
          }
        }
        console.log(output);
      }
      console.log('');
    }
  }


  clickedEnemyGrid(mx, my) {
    // Decides if the enemy grid has been clicked while in play mode.
    let sizes = this.sizes.play['enemy'];
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
    let sizes = this.sizes.play['enemy'];
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
        bombedId: bombedId,
        row: row,
        col: col,
        isBoat: this.grid[bombed][row][col].isBoat,
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
    console.log('Checking boat with index ' + boatIndex);

    for (let i = 0; i < 10; i++) {
      for (let j = 0; j < 10; j++) {
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
}

// INTERFACE.
// Exports.
module.exports = MasterMap;
