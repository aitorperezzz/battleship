// This is the Map class.

class Map {
  constructor(playerId) {
    // Receives a player id and creates a map for the player.
    this.playerId = playerId;

    // Create the grid.
    this.grid = [];
    for (let i = 0; i < 10; i++) {
      this.grid.push([]);
      for (let j = 0; j < 10; j++) {
        let cell = {
          boat: false
        };
        this.grid[i].push(cell);
      }
    }
  }
}

// Export this class for master.
module.exports = Map;
