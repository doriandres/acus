const SharedObject = require('../SharedObject');

const WorkerMath = require('./WorkerMath');
const WorkerSharedData = require('./WorkerSharedData');

async function runSharedDataExample() {
  const sharedObject = new SharedObject({ object: { foo: 'text' } });
  console.log(`Main: Shared object created as:`);
  console.log(sharedObject.getObject());
  await WorkerSharedData.doSharedObjectMutation(sharedObject.getBuffer());
  console.log(`Main: Shared object now is:`);
  console.log(sharedObject.getObject());
}

async function runMathExample() {
  const start = Date.now();
  const r = await WorkerMath.pow(10, 10);
  const end = Date.now();
  const elapsed = end - start;
  console.log(`Result: ${r}`);
  console.log(`Elapsed: ${elapsed} ms`);
}

async function main() {
  runSharedDataExample();
  runMathExample();
}

main();