const WorkerModule = require('../WorkerModule');
const SharedObject = require('../SharedObject');
const define = WorkerModule(__filename);

module.exports.doSharedObjectMutation = define(async (sharedBuffer) => {
  const sharedObject = new SharedObject({ buffer: sharedBuffer });
  sharedObject.setObject({ foo: 'bar' });
});