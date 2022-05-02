# cycle-pool

[![NPM Version][npm-image]][npm-url]
[![Node Version][node-image]][node-url]

make resource pooling

## Installation

```bash
npm i cycle-pool -S
```

## Usage

```typescript
import { createPool } from 'cycle-pool';

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
const result = await pool.add(1, 2);
```

also you can release worker manually

```typescript
const worker = await pool.acquire();
const result = await worker.multiply(2, 2);
pool.release(worker);
```

## API

### createPool

- createPool<T=any>(worker: new (...args: any[]) => T, options:Partial<typeof defaultOptions> = defaultOptions): Pool & T

```javascript
const defaultOptions = {
  min: 1,
  max: 10,
  idleTimeout: 30 * 1000, // 30 second
  acquireTimeout: 1000, // 1 second
};
```

## Examples

examples are listed at [examples](https://github.com/cooperhsiung/cycle-pool/tree/master/examples)

## Performance

`autocannon http://127.0.0.1:3000/bcrypt`

normal bcrypt

```
┌─────────┬────────┬────────┬────────┬────────┬───────────┬──────────┬───────────┐
│ Stat    │ 2.5%   │ 50%    │ 97.5%  │ 99%    │ Avg       │ Stdev    │ Max       │
├─────────┼────────┼────────┼────────┼────────┼───────────┼──────────┼───────────┤
│ Latency │ 131 ms │ 164 ms │ 245 ms │ 262 ms │ 165.16 ms │ 25.29 ms │ 315.39 ms │
└─────────┴────────┴────────┴────────┴────────┴───────────┴──────────┴───────────┘
┌───────────┬─────────┬─────────┬─────────┬─────────┬───────┬─────────┬─────────┐
│ Stat      │ 1%      │ 2.5%    │ 50%     │ 97.5%   │ Avg   │ Stdev   │ Min     │
├───────────┼─────────┼─────────┼─────────┼─────────┼───────┼─────────┼─────────┤
│ Req/Sec   │ 50      │ 50      │ 60      │ 67      │ 60.2  │ 4.31    │ 50      │
├───────────┼─────────┼─────────┼─────────┼─────────┼───────┼─────────┼─────────┤
│ Bytes/Sec │ 13.3 kB │ 13.3 kB │ 15.9 kB │ 17.8 kB │ 16 kB │ 1.14 kB │ 13.3 kB │
└───────────┴─────────┴─────────┴─────────┴─────────┴───────┴─────────┴─────────┘
```

use `worker_threads` managed by `cycle-pool`

```
┌─────────┬───────┬───────┬───────┬───────┬──────────┬─────────┬───────────┐
│ Stat    │ 2.5%  │ 50%   │ 97.5% │ 99%   │ Avg      │ Stdev   │ Max       │
├─────────┼───────┼───────┼───────┼───────┼──────────┼─────────┼───────────┤
│ Latency │ 20 ms │ 23 ms │ 26 ms │ 28 ms │ 23.06 ms │ 3.93 ms │ 103.37 ms │
└─────────┴───────┴───────┴───────┴───────┴──────────┴─────────┴───────────┘
┌───────────┬────────┬────────┬────────┬────────┬────────┬─────────┬────────┐
│ Stat      │ 1%     │ 2.5%   │ 50%    │ 97.5%  │ Avg    │ Stdev   │ Min    │
├───────────┼────────┼────────┼────────┼────────┼────────┼─────────┼────────┤
│ Req/Sec   │ 388    │ 388    │ 427    │ 464    │ 423.91 │ 23.73   │ 388    │
├───────────┼────────┼────────┼────────┼────────┼────────┼─────────┼────────┤
│ Bytes/Sec │ 103 kB │ 103 kB │ 113 kB │ 123 kB │ 112 kB │ 6.28 kB │ 103 kB │
└───────────┴────────┴────────┴────────┴────────┴────────┴─────────┴────────┘
```

near 7x faster than normal bcrypt

## Todo

- [ ] idle release

## Others

## License

MIT

[npm-image]: https://img.shields.io/npm/v/cycle-pool.svg
[npm-url]: https://www.npmjs.com/package/cycle-pool
[node-image]: https://img.shields.io/badge/node.js-%3E=8-brightgreen.svg
[node-url]: https://nodejs.org/download/
