const { exec } = require('child_process');

// error handling for the routes
const catchErrors = (fn) => (req, res, next) => fn(req, res, next).catch(next);

function regexFromString(string) {
  return new RegExp(string, 'i');
}

// custom error handlers
class DecryptionError extends Error {
  constructor(message) {
    super(message);
    this.name = 'DecryptionError';
  }
}

function isJSON(str) {
  try {
    JSON.parse(JSON.stringify(str));
    return true;
  } catch (err) {
    return false;
  }
}

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function executeCommand(command) {
  let stdout = '';
  let shellPromise = new Promise((resolve, reject) => {
    exec(command, (err, stdout, stderr) => {
      if (err) {
        reject(err);
      }
      if (stdout) {
        resolve(stdout);
      }
      if (stderr) {
        reject(stderr);
      }
    });
  });

  await shellPromise
    .then((data) => {
      stdout = data;
    })
    .catch((err) => {
      throw new Error(err);
    });
  return stdout;
}

module.exports = {
  isJSON,
  regexFromString,
  catchErrors,
  DecryptionError,
  sleep,
  executeCommand
};
