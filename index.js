const { Engine, Render, Runner, World, Bodies } = Matter;

const width = 600;
const height = 600;

const engine = Engine.create();
const { world } = engine;
const render = Render.create({
  element: document.body,
  engine: engine,
  options: {
    width,
    height
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

const grid = Array(3)
  .fill(null)
  .map(() => Array(3).fill(false));

const verticals = Array(3)
  .fill(null)
  .map(() => Array(2).fill(false));
const horizontals = Array(2)
  .fill(null)
  .map(() => Array(3).fill(false));
