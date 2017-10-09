require('sugar').extend();
const models = require('../models');

module.exports = function () {
    const sql = {
        name: 'sql',
        needAliasing: false,
        validFlags: [],
        possibleNames: ['sql'],
        check: check,
        handle: handle,
        format: format
    }

    return sql;
}

function * check (data) {
    return data.request.slice(4);
}

function * handle (data) {
    return yield models.sequelize.query(data)
    .catch(err => err);
}

function format (data) {
    if (data && data[1] && data[1].rows)
        return JSON.stringify(data[1].rows, null, '\t');
    return data;
}