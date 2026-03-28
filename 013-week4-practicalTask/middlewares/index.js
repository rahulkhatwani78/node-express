const fs = require("fs");

function logRequest(fileName) {
  return (req, res, next) => {
    fs.appendFile(
      fileName,
      `${Date.now()}: ${req.ip} - ${req.method} - ${req.path}\n`,
      (err, data) => {
        if (err) {
          console.log(err);
        }
        next();
      },
    );
  };
}

module.exports = {
  logRequest,
};
