/**
 * Created by Cooper on 2021/06/16.
 */

const defaultOptions = {
  min: 1,
  max: 10,
  idleTimeout: 30 * 1000, // 30 second
  acquireTimeout: 1000, // 1 second
};

// destroy, release,
// auto recycle?

export function createPool<T = any>(
  Worker: new (...args: any[]) => T,
  options: Partial<typeof defaultOptions> = defaultOptions
): Pool & T {
  const pool = new Pool<any>({
    worker: Worker,
    ...options,
  });

  const methods = Object.getOwnPropertyNames(Worker.prototype);
  const protectMethods = Object.getOwnPropertyNames(Pool.prototype);

  for (const method of methods) {
    if (method === 'constructor') {
      continue;
    }
    if (protectMethods.includes(method)) {
      console.warn(`${method} failed to delegate because it is a method of pool`);
      continue;
    }

    // delegate methods
    Object.defineProperty(pool, method, {
      value: async function () {
        const worker = await pool.acquire();
        if (worker[method]) {
          const result = await worker[method](...arguments);
          this.release(worker);
          return result;
        }
        throw new Error(`worker does not implement a ${method} function`);
      },
    });
  }

  return pool as Pool & T;
}

export class Pool<T = any> {
  private min: number;
  private max: number;
  private idleTimeout: number;
  private acquireTimeout: number;
  //
  private factory: new (...args: any) => T;
  private idleQueue: T[];
  private deferQueue: ((worker: T) => void)[];
  public running: number;

  constructor(options: Partial<typeof defaultOptions> & { worker: new (...args: any) => T }) {
    this.min = options.min || defaultOptions.min;
    this.max = options.max || defaultOptions.max;
    this.idleTimeout = options.idleTimeout || defaultOptions.idleTimeout;
    this.acquireTimeout = options.acquireTimeout || defaultOptions.acquireTimeout;
    // initialize workers
    this.factory = options.worker;
    this.idleQueue = Array(this.min)
      .fill(1)
      .map(() => new this.factory());
    // [1,2,3] fifo
    this.deferQueue = [];
    this.running = 0;
  }

  // fetch a worker from pool
  acquire(): Promise<T> {
    return new Promise((resolve, reject) => {
      setTimeout(reject, this.acquireTimeout, 'timeout');
      const worker = this.idleQueue.pop();
      if (worker) {
        this.running++;
        return resolve(worker);
      } else if (this.size < this.max) {
        this.running++;
        return resolve(new this.factory());
      } else {
        this.deferQueue.unshift(resolve); // fifo
      }
    });
  }

  // put a worker back to the pool
  release(worker: T) {
    this.running--;
    this.idleQueue.unshift(worker);
    if (this.deferQueue.length) {
      const worker = this.idleQueue.pop();
      if (worker) {
        this.running++;
        const defer = this.deferQueue.pop();
        if (defer) {
          defer(worker);
        }
      }
    }
  }

  // put into a worker, no use
  async put(worker: T) {
    this.idleQueue.unshift(worker);
  }

  // total object in the pool
  get size(): number {
    return this.running + this.idleQueue.length;
  }

  // available workers number
  get idleSize(): number {
    return this.idleQueue.length;
  }
}
