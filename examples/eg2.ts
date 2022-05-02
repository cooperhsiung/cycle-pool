/**
 * Created by Cooper on 2021/06/16.
 */
import { createPool } from '../index';

// manual
class Calculator {
  // your heavy precess
  async add(a: number, b: number): Promise<number> {
    return a + b;
  }

  async multiply(a: number, b: number): Promise<number> {
    return a * b;
  }
}

const pool = createPool<Calculator>(Calculator);
console.log(pool);

async function test() {
  const worker = await pool.acquire();
  const result = await worker.multiply(2, 2);
  console.log(result);
  pool.release(worker);
}

test();
