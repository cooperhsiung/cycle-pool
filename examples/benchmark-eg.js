/**
 * Created by Cooper on 2021/06/16.
 */
const Express = require('express');
const App = Express();
const HTTP = require('http');
const BCrypt = require('bcryptjs');

const bcryptHash = async (password) => {
  return await BCrypt.hash(password, 8);
};

const Utilities = { bcryptHash };

const { createPool } = require('cycle-pool');
const TaskHandler = require('./util');

const pool = createPool(TaskHandler, { min: 10, max: 1000 });

// Router Setup
App.get('/bcrypt', async (req, res) => {
  const password = 'This is a long password';
  let result = null;

  if (process.env.WORKER_POOL_ENABLED === '1') {
    result = await pool.exec(password);
  } else {
    result = await Utilities.bcryptHash(password);
  }

  res.send(result);
});

// Server Setup
const port = process.env.PORT || 3000;
const server = HTTP.createServer(App);

(async () => {
  // Start Server
  server.listen(port, () => {
    console.log('NodeJS Performance Optimizations listening on: ', port);
  });
})();

// autocannon http://127.0.0.1:3000/bcrypt

// normal bcrypt
// /usr/local/bin/node --experimental-worker ./benchmark-eg.js
// ┌─────────┬────────┬────────┬────────┬────────┬───────────┬──────────┬───────────┐
// │ Stat    │ 2.5%   │ 50%    │ 97.5%  │ 99%    │ Avg       │ Stdev    │ Max       │
// ├─────────┼────────┼────────┼────────┼────────┼───────────┼──────────┼───────────┤
// │ Latency │ 131 ms │ 164 ms │ 245 ms │ 262 ms │ 165.16 ms │ 25.29 ms │ 315.39 ms │
// └─────────┴────────┴────────┴────────┴────────┴───────────┴──────────┴───────────┘
// ┌───────────┬─────────┬─────────┬─────────┬─────────┬───────┬─────────┬─────────┐
// │ Stat      │ 1%      │ 2.5%    │ 50%     │ 97.5%   │ Avg   │ Stdev   │ Min     │
// ├───────────┼─────────┼─────────┼─────────┼─────────┼───────┼─────────┼─────────┤
// │ Req/Sec   │ 50      │ 50      │ 60      │ 67      │ 60.2  │ 4.31    │ 50      │
// ├───────────┼─────────┼─────────┼─────────┼─────────┼───────┼─────────┼─────────┤
// │ Bytes/Sec │ 13.3 kB │ 13.3 kB │ 15.9 kB │ 17.8 kB │ 16 kB │ 1.14 kB │ 13.3 kB │
// └───────────┴─────────┴─────────┴─────────┴─────────┴───────┴─────────┴─────────┘

// cycle-pool
// WORKER_POOL_ENABLED=1 /usr/local/bin/node --experimental-worker ./benchmark-eg.js
// ┌─────────┬───────┬───────┬───────┬───────┬──────────┬─────────┬───────────┐
// │ Stat    │ 2.5%  │ 50%   │ 97.5% │ 99%   │ Avg      │ Stdev   │ Max       │
// ├─────────┼───────┼───────┼───────┼───────┼──────────┼─────────┼───────────┤
// │ Latency │ 20 ms │ 23 ms │ 26 ms │ 28 ms │ 23.06 ms │ 3.93 ms │ 103.37 ms │
// └─────────┴───────┴───────┴───────┴───────┴──────────┴─────────┴───────────┘
// ┌───────────┬────────┬────────┬────────┬────────┬────────┬─────────┬────────┐
// │ Stat      │ 1%     │ 2.5%   │ 50%    │ 97.5%  │ Avg    │ Stdev   │ Min    │
// ├───────────┼────────┼────────┼────────┼────────┼────────┼─────────┼────────┤
// │ Req/Sec   │ 388    │ 388    │ 427    │ 464    │ 423.91 │ 23.73   │ 388    │
// ├───────────┼────────┼────────┼────────┼────────┼────────┼─────────┼────────┤
// │ Bytes/Sec │ 103 kB │ 103 kB │ 113 kB │ 123 kB │ 112 kB │ 6.28 kB │ 103 kB │
// └───────────┴────────┴────────┴────────┴────────┴────────┴─────────┴────────┘
