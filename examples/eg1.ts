/**
 * Created by Cooper on 2021/06/16.
 */
import { createPool } from '../index';

class Calculator {
  // your heavy precess
  async add(a: number, b: number): Promise<number> {
    await sleep(300);
    return a + b;
  }

  async multiply(a: number, b: number): Promise<number> {
    await sleep(100);
    return a * b;
  }
}

const pool = createPool<Calculator>(Calculator, { min: 2 });
console.log(pool);

async function test() {
  let start = Date.now();
  for (let i = 0; i < 25; i++) {
    handle();

    async function handle() {
      const result = await pool.add(i, i);
      console.log('job:', i, 'result:', result, 'running:', pool.running, 'idle:', pool.idleSize);
      if (pool.running === 0) {
        console.log('total cost:', Date.now() - start, 'ms');
      }
    }
  }
}

test();

function random(min: number, max: number) {
  return min + Math.random() * max;
}

function sleep(delay = 1000) {
  return new Promise((resolve) => setTimeout(resolve, delay));
}
