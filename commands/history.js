require('sugar').extend();
const parser = require('../parsers.js');
const helper = require('./helpers/_history.js');
const models = require('../models');

module.exports = function () {
    const history = {
        name: 'history',
        needAliasing: true,
        validFlags: ['daily'],
        possibleNames: ['history'],
        check: helper.check,
        handle: handle,
        format: format
    }

    return history;
}

function * handle(data) {
    return yield helper.handle(data, {order: {key: 'date', direction: 'DESC'}}, ['id', 'date', 'amount', 'reason']);
}

function format(data) {
    return helper.format(data, ['id', 'date', 'amount', 'reason'])
}