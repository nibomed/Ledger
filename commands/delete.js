require('sugar').extend();
const parser = require('../parsers.js');
const models = require('../models');
const helper = require('./helpers/_delete.js');

module.exports = function () {
    const revert = {
        name: 'delete',
        needAliasing: true,
        validFlags: ['force'],
        possibleNames: ['delete'],
        check: check,
        handle: helper.handle,
        format: helper.format
    }

    return revert;
}

function * check(data) {
    if (data.string.length != 1)
        return {fail: 'One argument is required'};
    
    let id = parser.numberify(data.string[0]);
    if (id === false)
        return {fail: 'Id as argument is required'};
    
    const paymentsO = yield models.payment.findAll({limit: 1, include: [{model: models.tag, attributes: ['name'], through: 'paymentTags'}], where: {id: id}});    
    if (!paymentsO || !paymentsO[0]) {
        return {fail: 'No payments with such id'};
    }

    if (paymentsO[0].dataValues.user != data.user && !data.flags.includes('force'))
        return {fail: 'You tried to delete payments that wa made not by you. You may add *--force* to ignore this waning'};

    return paymentsO[0];
}