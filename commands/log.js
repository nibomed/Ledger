require('sugar').extend();
const parser = require('../parsers.js');
const helper = require('./helpers/_history.js');
const models = require('../models');

module.exports = function () {
    const log = {
        name: 'log',
        needAliasing: true,
        validFlags: ['daily'],
        possibleNames: ['log'],
        check: helper.check,
        handle: handle,
        format: format
    }

    return log;
}

function * handle(data) {
    return yield helper.handle(data, {order: {key: 'createdAt', direction: 'DESC'}});
}

function format(data) {
    return helper.format(data, ['id', 'date', 'amount', 'reason', 'created at'])
}