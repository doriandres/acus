const { Worker, isMainThread, workerData, parentPort } = require('worker_threads');

module.exports = function WorkerModule(filename) {
  let seq = 0;
  return (func, transient = true) => {
    const id = ++seq;
    if (!isMainThread) {
      const [defFilename, defId, args] = workerData;
      if (defFilename === filename && defId === id) {
        process.nextTick(() => func(...args).then(result => parentPort.postMessage(result)));
      }
      if (!transient) return func;
    }
    return (...args) => new Promise((resolve, reject) => {
      const worker = new Worker(filename, { workerData: [filename, id, args] });
      function onMessage(result) {
        dispose();
        resolve(result);
      }
      function onError(error) {
        dispose();
        reject(error);
      }
      function onExit(code) {
        if (code !== 0) {
          onError(new Error(`Worker stopped with exit code ${code}`));
        }
      }
      function dispose() {
        worker.terminate();
        worker.off('message', onMessage);
        worker.off('error', onError);
        worker.off('exit', onExit);
      }
      worker.on('message', onMessage);
      worker.on('error', onError);
      worker.on('exit', onExit);
    });
  }
}