let fs = require('fs');
let path  = require('path');

module.exports = {};

(function(c) {
    fs.readdirSync(__dirname)
        .filter((file) => (file.indexOf('.') !== 0) &&
                (file !== 'index.js') &&
                (file.endsWith('.js')))
        .forEach(function(file) {
            let command = require(path.join(__dirname, file))();
            c[command.name] = command;
        });
})(module.exports);