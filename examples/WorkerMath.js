const WorkerModule = require('../WorkerModule');

const define = WorkerModule(__filename);

const add = module.exports.add = define(async (a, b) => {
  return a + b;
});

const multiply = module.exports.multiply = define(async (a, b) => {
  b = Math.abs(b);
  let r = 0;
  for (let i = 0; i < b; i++) {
    r = await add(r, a);
  }
  return r;
});

module.exports.pow = define(async (a, b) => {
  b = Math.abs(b);
  let r = 0;
  for (let i = 0; i < b; i++) {
    r = await multiply(a, a);
  }
  return r;
});