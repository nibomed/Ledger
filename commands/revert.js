require('sugar').extend();
const parser = require('../parsers.js');
const models = require('../models');
const helper = require('./helpers/_delete.js');

module.exports = function () {
    const revert = {
        name: 'revert',
        needAliasing: true,
        validFlags: [],
        possibleNames: ['revert', 'undo', 'back'],
        check: check,
        handle: helper.handle,
        format: helper.format
    }

    return revert;
}

function * check(data) {
    const paymentsO = yield models.payment.findAll({limit: 1, include: [{model: models.tag, attributes: ['name'], through: 'paymentTags'}], where: {user: data.user}, order: [['createdAt', 'DESC']]});
    if (!paymentsO || !paymentsO[0]) {
        return {fail: 'No payments to revert'};
    }
    return paymentsO[0]
}