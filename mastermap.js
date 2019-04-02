// This is the MasterMap class.
// This class stores information about the maps of both players.

// Import the server module to communicate with it.
let server = require('./server.js');

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

    // Create an object with information about both players.
    this.info = {
      'player1': {
        receivedMap: false
      },
      'player2': {
        receivedMap: false
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
          };
          newGrid[i].push(newCell);
        }
      }
      this.grid[player] = newGrid;
    }

    /*
    // Create a grid to store information about both players.
    this.grid = [];
    for (let i = 0; i < 10; i++) {
      this.grid.push([]);
      for (let j = 0; j < 10; j++) {
        // Create a cell object.
        let newCell = {
          'player1': {
            isBoat: false,
            isBombed: false,
            isSunk: false,
          },
          'player2': {
            isBoat: false,
            isBombed: false,
            isSunk: false,
          }
        };
        this.grid[i].push(newCell);
      }
    }*/
  }

  /*
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
  }*/

  receive(data) {
    // Receives the map of a player in the appropriate format and updates.
    let player = 'player' + data.playerId;
    console.log(typeof(this.grid));
    //console.log(util.inspect(this.grid));
    console.log('player is ' + player);
    for (let i = 0; i < 10; i++) {
      for (let j = 0; j < 10; j++) {

        this.grid[player][i][j].isBoat = data.grid['own'][i][j].isBoat;
      }
    }

    // Acknowledge that the map has been received.
    this.info[player].receivedMap = true;
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
            output = output + '#';
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

  /*
  enemyCellClicked(mx, my, i, j) {
    // Decides if the ij enemy cell has been clicked.
    let sizes = this.sizes.play['enemy'];
    let xClicked = mx >= this.sizes
  }*/

  bomb(bomberId, mx, my) {
    // Receives a mouse location and a player id and bombs.
    let bombedId = bomberId == 1 ? 2 : 1;
    let bomber = 'player' + bomberId;
    let bombed = 'player' + bombedId;

    // Get the row and column location of the bombing.
    let sizes = this.sizes.play['enemy'];
    let row = Math.floor((my - sizes.initialy) / sizes.size);
    let col = Math.floor((mx - sizes.initialx) / sizes.size);

    // Process the bombing.
    // TODO: check for sunk event.
    this.grid[bombed][row][col].isBombed = true;

    let toSend = {
      bomberId: bomberId,
      row: row,
      col: col,
      isBombed: true,
      isBoat: this.grid[bombed][row][col].isBoat,
    };

    return toSend;
  }
}

// Export this class for master.
module.exports = MasterMap;
