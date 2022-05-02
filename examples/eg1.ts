/**
 * Created by Cooper on 2021/06/16.
 */
import { createPool } from '../index';

// simple usage
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

// const result = await pool.add(1, 2);

pool
  .add(1, 2)
  .then((ret) => {
    console.log(ret);
  })
  .catch((err) => {
    console.error(err);
  });
