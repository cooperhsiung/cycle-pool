/**
 * Created by Cooper on 2021/06/17.
 */
const { Worker, isMainThread, parentPort } = require('worker_threads');
const BCrypt = require('bcryptjs');

const bcryptHash = async (password) => {
  return await BCrypt.hash(password, 8);
};

const Utilities = { bcryptHash };

if (!isMainThread) {
  parentPort.on('message', (msg) => {
    Utilities.bcryptHash(msg)
      .then((ret) => {
        parentPort.postMessage(ret);
      })
      .catch((err) => {
        console.error(err);
      });
  });
}

class TaskHandler {
  constructor() {
    if (isMainThread) {
      this.worker = new Worker(__filename);
      this.tasks = [];
      this.worker.on('message', (data) => {
        let task = this.tasks.pop();
        if (task) {
          task(data);
        }
      });
    }
  }

  encrypt(str) {
    if (isMainThread) {
      this.worker.postMessage(str);
      return new Promise((resolve, reject) => {
        this.tasks.push(resolve);
      });
    }
  }
}

// /usr/local/bin/node --experimental-worker ./util.js

if (isMainThread) {
  let handler = new TaskHandler();
  handler
    .encrypt('asds')
    .then((ret) => {
      console.log(ret);
    })
    .catch((err) => {
      console.error(err);
    });
}

module.exports = TaskHandler;
