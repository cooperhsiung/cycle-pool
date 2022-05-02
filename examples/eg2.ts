/**
 * Created by Cooper on 2021/06/16.
 */
import  Pool  from '../index';

class TaskHandler {
  // your heavy progress
  async exec(a: number, b: number): Promise<number> {
    await sleep(300);
    return a * b;
  }
}

const pool = new Pool<TaskHandler>({
  min: 10,
  worker: TaskHandler,
});

async function test() {
  for (let i = 0; i < 22; i++) {
    (async function () {
      const worker = await pool.acquire();
      const result = await worker.exec(i, i);
      pool.release(worker);

      console.log('job:', i, 'result:', result, 'running:', pool.running, 'idle:', pool.idleSize);
    })().catch((err) => {
      console.error(err);
    });
  }
}

test();

function random(min: number, max: number) {
  return min + Math.random() * max;
}

function sleep(delay = 1000) {
  return new Promise((resolve) => setTimeout(resolve, delay));
}
