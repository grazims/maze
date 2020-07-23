const { Engine, Render, Runner, World, Bodies, Body, Events } = Matter;

const cellsHorizontal = 14;
const cellsVertical = 13;
const width = window.innerWidth;
const height = window.innerHeight;

const unitLengthX = width / cellsHorizontal;
const unitLengthY = width / cellsVertical;

const engine = Engine.create();
engine.world.gravity.y = 0;
const { world } = engine;
const render = Render.create({
  element: document.body,
  engine: engine,
  options: {
    width,
    height,
    wireframes: true
  }
});
Render.run(render);
Runner.run(Runner.create(), engine);

//walls
const walls = [
  Bodies.rectangle(width / 2, 0, width, 40, { isStatic: true }), //top
  Bodies.rectangle(width / 2, height, width, 40, { isStatic: true }), //bottom
  Bodies.rectangle(0, height / 2, 40, height, { isStatic: true }), //left
  Bodies.rectangle(width, height / 2, 40, height, { isStatic: true }) //right
];
World.add(world, walls);

//maze grid

const shuffle = arr => {
  let counter = arr.length;

  while (counter > 0) {
    const index = Math.floor(Math.random() * counter);

    counter--;

    const temp = arr[counter];
    arr[counter] = arr[index];
    arr[index] = temp;
  }
  return arr;
};

const grid = Array(cellsVertical)
  .fill(null)
  .map(() => Array(cellsHorizontal).fill(false));

const verticals = Array(cellsVertical)
  .fill(null)
  .map(() => Array(cellsHorizontal - 1).fill(false));

const horizontals = Array(cellsVertical - 1)
  .fill(null)
  .map(() => Array(cellsHorizontal).fill(false));

const startRow = Math.floor(Math.random() * cellsVertical);
const startColumn = Math.floor(Math.random() * cellsHorizontal);

const stepThroughCell = (row, column) => {
  //if the cell was visited at [row, cell], then return
  if (grid[row][column]) {
    return;
  }
  //mark this cell as visited
  grid[row][column] = true;
  //assemble random list of neighbors
  const neighbors = shuffle([
    [row - 1, column, "up"],
    [row, column + 1, "right"],
    [row + 1, column, "down"],
    [row, column - 1, "left"]
  ]);
  //for each neighbor
  for (let neighbor of neighbors) {
    const [nextRow, nextColumn, direction] = neighbor;

    //see if that neighbor is out of bounds
    if (
      nextRow < 0 ||
      nextRow >= cellsVertical ||
      nextColumn < 0 ||
      nextColumn >= cellsHorizontal
    ) {
      continue;
    }
    //if it was visited, continue to the next
    if (grid[nextRow][nextColumn]) {
      continue;
    }
    //remove a wall
    if (direction === "left") {
      verticals[row][column - 1] = true;
    } else if (direction === "right") {
      verticals[row][column] = true;
    } else if (direction === "up") {
      horizontals[row - 1][column] = true;
    } else if (direction === "down") {
      horizontals[row][column] = true;
    }
    stepThroughCell(nextRow, nextColumn);
  }
  //visit next cell
};

stepThroughCell(startRow, startColumn);

horizontals.forEach((row, rowIndex) => {
  row.forEach((open, columnIndex) => {
    if (open) {
      return;
    }
    const wall = Bodies.rectangle(
      columnIndex * unitLengthX + unitLengthX / 2,
      rowIndex * unitLengthY + unitLengthY,
      unitLengthX,
      5,
      { isStatic: true, label: "wall" }
    );
    World.add(world, wall);
  });
});

verticals.forEach((row, rowIndex) => {
  row.forEach((open, columnIndex) => {
    if (open) {
      return;
    }

    const wall = Bodies.rectangle(
      columnIndex * unitLengthX + unitLengthX,
      rowIndex * unitLengthY + unitLengthY / 2,
      5,
      unitLengthY,
      { isStatic: true, label: "wall" }
    );
    World.add(world, wall);
  });
});

//goal

const goal = Bodies.rectangle(
  width - unitLengthX / 2,
  height - unitLengthY / 2,
  unitLengthX * 0.7,
  unitLengthY * 0.7,
  {
    label: "goal"
  }
);
World.add(world, goal);

//ball
const ballRadius = Math.min(unitLengthX, unitLengthY) / 4;
const ball = Bodies.circle(unitLengthX / 2, unitLengthY / 2, ballRadius, {
  label: "ball"
});
World.add(world, ball);

document.addEventListener("keydown", event => {
  const { x, y } = ball.velocity;

  if (event.keyCode === 38) {
    Body.setVelocity(ball, { x, y: y - 5 });
  }
  if (event.keyCode === 39) {
    Body.setVelocity(ball, { x: x + 5, y });
  }
  if (event.keyCode === 40) {
    Body.setVelocity(ball, { x, y: y + 5 });
  }
  if (event.keyCode === 37) {
    Body.setVelocity(ball, { x: x - 5, y });
  }
});

//win condition

Events.on(engine, "collisionStart", event => {
  event.pairs.forEach(collision => {
    const labels = ["ball", "goal"];

    if (
      labels.includes(collision.bodyA.label) &&
      labels.includes(collision.bodyB.label)
    ) {
      world.gravity.y = 1;
      world.bodies.forEach(body => {
        if (body.label === "wall") {
          Body.setStatic(body, false);
        }
      });
    }
  });
});
