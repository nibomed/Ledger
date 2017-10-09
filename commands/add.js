require('sugar').extend();
const helper = require('./helpers/_payments.js');

module.exports = function () {
    const alias = {
        name: 'add',
        needAliasing: true,
        validFlags: ['force'],
        possibleNames: ['add'],
        check: helper.check,
        handle: handle,
        format: helper.format
    }

    return alias;
}

function * handle(data) {
    return yield helper.handle(data, true);
}