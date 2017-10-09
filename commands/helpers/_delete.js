const models = require('../../models');
const parser = require('../../parsers.js');

module.exports.handle = function *(data) {
    const string = parser.paymentString(data);
   yield data.destroy();
    return string;
}

module.exports.format = data => data + ' ..removed';