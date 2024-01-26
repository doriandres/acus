const DEFAULT_MAX_ALLOC_IN_BYTES = 1024;

module.exports = class SharedObject {
  #encoder;
  #decoder;
  #sharedArrayBuffer;
  #arrayBuffer;

  constructor({ maxAllocInBytes = DEFAULT_MAX_ALLOC_IN_BYTES, object, buffer } = {}) {
    if (object && buffer) throw new Error('You can\'t pass both \'object\' and SharedArrayBuffer');
    if (!object && !buffer) throw new Error('You must pass an \'object\' or a SharedArrayBuffer');
    if (object && typeof object !== 'object') throw new Error('Object must be of type \'object\'');
    if (buffer && !(buffer instanceof SharedArrayBuffer)) throw new Error('buffer must be a SharedArrayBuffer');
    if (maxAllocInBytes && typeof maxAllocInBytes !== 'number') throw new Error('maxAllocInBytes must be a number');
    if (maxAllocInBytes && maxAllocInBytes < 0) throw new Error('maxAllocInBytes must be a positive number');
    this.#encoder = new TextEncoder();
    this.#decoder = new TextDecoder();
    this.#sharedArrayBuffer = buffer;
    let encodedObject;
    if (!this.#sharedArrayBuffer) {
      encodedObject = this.#getObjectEncoded(object);
      this.#sharedArrayBuffer = new SharedArrayBuffer(encodedObject.byteLength, { maxByteLength: maxAllocInBytes });
    }
    this.#arrayBuffer = new Uint8Array(this.#sharedArrayBuffer);
    if (encodedObject) {
      this.#arrayBuffer.set(encodedObject);
    }
  }

  #getObjectEncoded(object) {
    return this.#encoder.encode(JSON.stringify(object, Array.isArray(object) ? undefined : Object.keys(object).sort()));
  }

  #getBufferDecoded() {
    const data = this.#decoder.decode(this.#arrayBuffer);
    return JSON.parse(data.substring(0, data.lastIndexOf("}") + 1));
  }

  getBuffer() {
    return this.#sharedArrayBuffer;
  }

  setObject(object) {
    if (typeof object !== 'object') throw new Error('Object must be of type \'object\'');
    const encodedObject = this.#getObjectEncoded(object);
    if (encodedObject.byteLength > this.#sharedArrayBuffer.byteLength && this.#sharedArrayBuffer.growable) {
      if (encodedObject.byteLength > this.#sharedArrayBuffer.maxByteLength) {
        throw new Error(`Object size is ${encodedObject.byteLength} bytes and cannot be allocated. Max alloc size is ${this.#sharedArrayBuffer.maxByteLength} bytes. Increase maxAllocInBytes or reduce object size.`);
      }
      this.#sharedArrayBuffer.grow(encodedObject.byteLength);
    }
    if (encodedObject.length < this.#arrayBuffer.length) {
      this.#arrayBuffer.fill(0, encodedObject.length);
    }
    this.#arrayBuffer.set(encodedObject);
  }

  getObject() {
    return Object.freeze(this.#getBufferDecoded());
  }

  equals(object) {
    if (!(object instanceof SharedObject)) return false;
    if (this.getBuffer() === object.getBuffer()) return true;
    if (this.getBuffer().byteLength !== object.getBuffer().byteLength) return false;
    return this.#arrayBuffer.every((value, index) => value === object.#arrayBuffer[index]);
  }
}