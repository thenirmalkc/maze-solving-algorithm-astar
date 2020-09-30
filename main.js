let cellSize = 10;
let size = 60;
let width = cellSize * size;
let height = cellSize * size;
let maze = undefined;
let stack = undefined;
let openSet = undefined;
let closedSet = undefined;
let start = undefined;
let end = undefined;
let search = undefined;
let previousCells = undefined;

const generateCells = () => {
  for (let row = 0; row < size; row++) {
    maze.push([]);
    for (let col = 0; col < size; col++) {
      maze[row].push({
        row,
        col,
        visited: false,
        topWall: true,
        downWall: true,
        leftWall: true,
        rightWall: true,
        f: null,
        g: 1,
        tempG: null,
        h: null,
        previousCell: null
      });
    }
  }
  maze[0][0].g = null;
};

const manhattanDistance = ({ row: x1, col: y1 }, { row: x2, col: y2 }) => {
  return abs(x2 - x1) + abs(y2 - y1);
};

const getNeighbours = ({ row, col }) => {
  const neighbours = [];
  if (row > 0) neighbours.push(maze[row - 1][col]);
  if (row < size - 1) neighbours.push(maze[row + 1][col]);
  if (col > 0) neighbours.push(maze[row][col - 1]);
  if (col < size - 1) neighbours.push(maze[row][col + 1]);
  return neighbours;
};

const getUnBlockedNeighbours = ({ row, col, topWall, downWall, leftWall, rightWall }) => {
  const unBlockedNeighbours = [];
  if (row > 0 && !topWall) unBlockedNeighbours.push(maze[row - 1][col]);
  if (row < size - 1 && !downWall) unBlockedNeighbours.push(maze[row + 1][col]);
  if (col > 0 && !leftWall) unBlockedNeighbours.push(maze[row][col - 1]);
  if (col < size - 1 && !rightWall) unBlockedNeighbours.push(maze[row][col + 1]);
  return unBlockedNeighbours;
};

const getDeadEndCell = () => {
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      let count = 0;
      const { topWall, downWall, leftWall, rightWall } = maze[row][col];
      if (topWall) count++;
      if (downWall) count++;
      if (leftWall) count++;
      if (rightWall) count++;
      if (count > 2) return maze[row][col];
    }
  }
  return null;
};

const getWallRemovableNeighbours = ({ row, col, topWall, downWall, leftWall, rightWall }) => {
  const wallRemovableNeighbours = [];
  if (row > 0 && topWall) wallRemovableNeighbours.push(maze[row - 1][col]);
  if (row < size - 1 && downWall) wallRemovableNeighbours.push(maze[row + 1][col]);
  if (col > 0 && leftWall) wallRemovableNeighbours.push(maze[row][col - 1]);
  if (col < size - 1 && rightWall) wallRemovableNeighbours.push(maze[row][col + 1]);
  return wallRemovableNeighbours;
};

const getRandomWallRemovableNeighbour = ({ row, col, topWall, downWall, leftWall, rightWall }) => {
  const randomWallRemovableNeighbours = getWallRemovableNeighbours({ row, col, topWall, downWall, leftWall, rightWall });
  return randomWallRemovableNeighbours[floor(random() * randomWallRemovableNeighbours.length)];
};

const getUnvsitedNeighbours = ({ row, col }) => {
  const unvisitedNeighbours = [];
  const neighbours = getNeighbours({ row, col });
  for (const neighbour of neighbours) {
    if (!neighbour.visited) unvisitedNeighbours.push(neighbour);
  }
  return unvisitedNeighbours;
};

const getRandomUnvisitedNeighbour = ({ row, col }) => {
  const unvisitedNeighbours = getUnvsitedNeighbours({ row, col });
  return unvisitedNeighbours[floor(random() * unvisitedNeighbours.length)];
};

const drawWall = ({ row, col, topWall, downWall, leftWall, rightWall }) => {
  if (topWall) line(col * cellSize, row * cellSize, col * cellSize + cellSize, row * cellSize);
  if (downWall) line(col * cellSize, row * cellSize + cellSize, col * cellSize + cellSize, row * cellSize + cellSize);
  if (leftWall) line(col * cellSize, row * cellSize, col * cellSize, row * cellSize + cellSize);
  if (rightWall) line(col * cellSize + cellSize, row * cellSize, col * cellSize + cellSize, row * cellSize + cellSize);
};

const fillCell = ({ row, col }, color) => {
  noStroke();
  fill(color);
  rect(col * cellSize, row * cellSize, cellSize, cellSize);
  stroke('teal');
  strokeWeight(2);
  drawWall(maze[row][col]);
};

const removeWall = (previousCell, currentCell) => {
  const row = currentCell.row - previousCell.row;
  const col = currentCell.col - previousCell.col;
  if (row == -1) {
    previousCell.topWall = false;
    currentCell.downWall = false;
  } else if (row == 1) {
    previousCell.downWall = false;
    currentCell.topWall = false;
  } else if (col == -1) {
    previousCell.leftWall = false;
    currentCell.rightWall = false;
  } else if (col == 1) {
    previousCell.rightWall = false;
    currentCell.leftWall = false;
  }
};

const dfs = () => {
  const top = stack[stack.length - 1];
  top.visited = true;
  const unvisitedNeighbour = getRandomUnvisitedNeighbour(top);
  if (unvisitedNeighbour) {
    stack.push(unvisitedNeighbour);
    removeWall(top, unvisitedNeighbour);
  } else stack.pop();
};

const removeDeadEnd = deadEndCell => {
  const randomWallRemovableNeighbour = getRandomWallRemovableNeighbour(deadEndCell);
  removeWall(deadEndCell, randomWallRemovableNeighbour);
};

function setup() {
  const canvas = createCanvas(width, height);
  canvas.position((windowWidth - width) / 2, (windowHeight - height) / 2);
  maze = [];
  stack = [];
  generateCells();
  start = maze[0][0];
  end = maze[size - 1][size - 1];
  stack.push(maze[0][0]);
  while (stack.length) dfs();
  let temp = true;
  while (temp) {
    const deadEndCell = getDeadEndCell();
    if (deadEndCell) removeDeadEnd(deadEndCell);
    else temp = false;
  }
  stroke('teal');
  strokeWeight(2);
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      drawWall(maze[row][col]);
    }
  }
  fillCell(start, 'limegreen');
  fillCell(end, 'orangered');
  openSet = [start];
  closedSet = [];
  previousCells = [];
  search = true;
}

function draw() {
  if (!search) return;
  if (!openSet.length) return;
  openSet.sort((x, y) => y.f - x.f);
  let cell = openSet.pop();
  closedSet.push(cell);
  if (cell == end) {
    fillCell(end, 'orangered');
    search = false;
    setTimeout(() => setup(), 4000);
    return;
  }
  for (const previousCell of previousCells) {
    fillCell(previousCell, 'skyblue');
  }
  const neighbours = getUnBlockedNeighbours(cell);
  for (const neighbour of neighbours) {
    if (closedSet.includes(neighbour)) continue;
    const tempG = neighbour.g + cell.tempG;
    if (openSet.includes(neighbour)) {
      if (tempG > neighbour.tempG) continue;
      else {
        neighbour.tempG = tempG;
        neighbour.f = neighbour.tempG + neighbour.h;
        neighbour.previousCell = cell;
      }
    } else {
      neighbour.tempG = tempG;
      neighbour.h = manhattanDistance(neighbour, end);
      neighbour.f = neighbour.tempG + neighbour.h;
      neighbour.previousCell = cell;
      openSet.push(neighbour);
    }
    fillCell(neighbour, 'pink');
  }
  previousCells = [];
  while (cell != start) {
    fillCell(cell, 'lime');
    previousCells.push(cell);
    cell = cell.previousCell;
  }
}
