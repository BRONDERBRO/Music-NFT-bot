module.exports = (command) => {
  return new Promise((resolve, reject) => {
    const { exec } = require('child_process');

    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(`Error executing command: ${error.message}`);
        return;
      }
      if (stderr) {
        reject(`Command stderr: ${stderr}`);
        return;
      }
      resolve(stdout);
    });
  });
};