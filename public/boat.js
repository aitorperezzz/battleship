// Class for the boats while in prepare mode.

class Boat {
  constructor(size) {
    // Receives a size and builds a boat at the beginning of the grid.
    this.pieces = [];

    // Select the index for the center piece.
    this.centerIndex = floor(size / 2);

    // Create each cell of the boat.
    for (let i = 0; i < size; i++) {
      let center = i == this.centerIndex ? true : false;
      let boatCell = {
        row: 0,
        col: i,
        center: center
      };
      this.pieces.push(boatCell);
    }
  }

  display(sizes) {
    // Display this boat at the sizes provided.
    for (let k = 0; k < this.pieces.length; k++) {
      // Paint it yellow.
      fill(255,255,102);
      stroke(1);
      let xpos = sizes.initialx + this.pieces[k].col * sizes.size;
      let ypos = sizes.initialy + this.pieces[k].row * sizes.size;
      rect(xpos, ypos, sizes.size, sizes.size);
      if (this.pieces[k].center) {
        // Paint a dot on the center cell.
        fill(0);
        noStroke();
        ellipse(xpos + sizes.size / 2, ypos + sizes.size / 2, sizes.size / 3, sizes.size / 3);
      }
    }
  }

  manipulate(keyCode, key) {
    // Manipulate this boat with the key code provided.
    let changed;
    switch (keyCode) {
      case LEFT_ARROW:
        changed = this.move('left', 'try');
        break;
      case RIGHT_ARROW:
        changed = this.move('right', 'try');
        break;
      case UP_ARROW:
        changed = this.move('up', 'try');
        break;
      case DOWN_ARROW:
        changed = this.move('down', 'try');
        break;
    }

    if (key == 'r') {
      changed = this.rotate('try');
    }

    return changed;
  }

  move(where, flag) {
    // Move the boat in the requested direction.
    // Flag can be 'try' or 'move'.

    for (let i = 0; i < this.pieces.length; i++) {
      let row = this.pieces[i].row;
      let col = this.pieces[i].col;
      switch (where) {
        case 'right':
          col++;
          break;
        case 'left':
          col--;
          break;
        case 'up':
          row--;
          break;
        case 'down':
          row++;
          break;
      }

      if (flag == 'move') {
        // Actually update the values for the cell.
        this.pieces[i].row = row;
        this.pieces[i].col = col;
        continue;
      }

      if (!client.map.availableToMove(row, col)) {
        // This boat cell cannot be moved, so the whole boat cannot move.
        return false;
      }
    }

    // If I reached here with the try flag, move the boat.
    if (flag == 'try') {
      this.move(where, 'move');
      return true;
    }
  }

  rotate(flag) {
    // Flag can be 'try' or 'move'.
    // Rotate the boat to the right, around the center piece.

    // Get the x and y location of the center piece.
    let centerX = this.pieces[this.centerIndex].col;
    let centerY = -this.pieces[this.centerIndex].row;

    for (let i = 0; i < this.pieces.length; i++) {
      let newRow = -(-(this.pieces[i].col - centerX) + centerY);
      let newCol = -this.pieces[i].row - centerY + centerX;

      if (flag == 'move') {
        // Actually update the value for the cell.
        this.pieces[i].row = newRow;
        this.pieces[i].col = newCol;
        continue;
      }

      if (!client.map.availableToMove(newRow, newCol)) {
        // This cell cannot move, so the boat cannot move.
        return false;
      }
    }

    // If I reached here with the 'try' flag, the boat can move.
    if (flag == 'try') {
      this.rotate('move');
      return true;
    }
  }
}
