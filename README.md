# Acus.js

## Utilities for building multi-threaded applications in NodeJS

## Installation

```bash
npm i -s acus
```

---

## Available Utilities

## WorkerModule

Worker modules allow you to create and declare exported module functions which should run in a separate thread. This is useful for CPU intensive tasks that you want to run in the background.

### Usage example

```js
// --- yourModuleB.js ---
const { WorkerModule } = require('acus');
const define = WorkerModule(__filename);

const yourFunction = define(async (paramA, paramB) => {
  // do something with your function...
  return yourResult;
});

module.exports = yourFunction;
// --- yourModuleB.js ---

// -=-=-=-=-=-=-=-=-=-=-=-

// --- yourModuleA.js ---
const yourFunction = require('./yourModuleB');

async function someAsyncFunction() {
  // call yourFunction as any other function
  // it will run in a separate thread
  const result = await yourFunction(paramA, paramB);
  // do something with your result...
}
// --- yourModuleA.js ---
```

---

## SharedObject

Shared objects allow you to share data pointers between threads. This is useful for sharing large data structures between threads without having to copy them. Changes to the shared object will be reflected in all threads.

### Usage example

```js
// --- yourModuleA.js ---
const { SharedObject } = require('acus');
const yourOtherFunction = require('./yourModuleB');

async function someAsyncFunction() {
  const myData = { foo: 'text' };
  const sharedObject = new SharedObject({ object: myData });

  // use getObject() to get the shared object value
  console.log(sharedObject.getObject()); // { foo: 'text' }

  // mutate the shared object in a separate thread
  // pass the object buffer to the function, this acts as a pointer to the object
  await yourOtherFunction(sharedObject.getBuffer());

  console.log(sharedObject.getObject()); // { foo: 'bar' }
}
// --- yourModuleA.js ---

// -=-=-=-=-=-=-=-=-=-=-=-

// --- yourModuleB.js ---
const { WorkerModule, SharedObject } = require('acus');
const define = WorkerModule(__filename);

const yourOtherFunction = define(async (buffer) => {
  // read the shared object from the buffer pointer
  const sharedObject = new SharedObject({ buffer });

  // mutate the shared object
  sharedObject.setObject({ foo: 'bar' });
});

module.exports = yourOtherFunction;
// --- yourModuleB.js ---
```

---

### License

MIT
