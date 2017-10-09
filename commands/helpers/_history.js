require('sugar').extend();
const models = require('../../models');
const parser = require('../../parsers.js');
const AsciiTable = require('ascii-table')
const moment = require('moment');

module.exports.check = function * check(data) {
    var result = {};
    if (data.string.length == 0) {
        result.type = 'byCount';
        result.counts = 10;
    } else if (data.string.length == 1 && parseInt(data.string[0])) {
        result.type = 'byCount';
        result.counts = parseInt(data.string[0]);
        if (result.counts <= 0) {
            return {fail: "Count must be greater than 0"};
        }
    } else if (data.string.length == 1 && parser.datify(data.string[0])) {
        result.type = 'byDate';
        result.date = parser.datify(data.string[0]);
    } else {
        return {fail: 'wrong arguments'};
    }

    return result;
}

function dayToString(date) {
    if (moment(date).startOf('day').toString() !== moment().startOf('day').toString())
        return moment(date).format('DD MMM');
    else
        return 'Today'
}

function arrayToString(array) {
    let result = ' ';
    array.forEach(e => result += e + ' ');
    return result.slice(1);
}

const keyAligns = {
    'id': AsciiTable.RIGHT,
    'amount': AsciiTable.RIGHT,
    'created at': AsciiTable.RIGHT,
    'date': AsciiTable.RIGHT,
    'reason': AsciiTable.LEFT
};   

const keyParsers = {
    'id': (data) => data['id'],
    'amount': (data) => parser.amountString(data['amount']),
    'created at': (data) => dayToString(data['createdAt']) + ' ' + moment(data['createdAt']).format('hh:mm'),
    'date': (data) => dayToString(data['date']),
    'reason': (data) => 
        data['message'] + ' '
        + arrayToString(data.tags.map(tag => parser.tagSymbol + tag.dataValues.name)) + ' '
        + 'by ' + data['user']
};

module.exports.handle = function * (data, params) {
    let query = {include: [{model: models.tag, attributes: ['name'], through: 'paymentTags'}]};
    query.order = [[params.order.key, params.order.direction]]
    if (data.type == 'byCount')
        query.limit = data.counts;
    else {
        query['where'] = {};
        query.where[params.order.key] = {$gte: data.date};
    }
    
    let result = {};
    result.o = yield models.payment.findAll(query);
    let positiveSum = 0, negativeSum = 0;
    result.o.forEach(o => {
        const amount = o.dataValues.amount;
        if (amount > 0)
            positiveSum += amount;
        else
            negativeSum += amount;
    });
    if (positiveSum > 0)
        result['positiveSum'] = positiveSum;
    if (negativeSum < 0)
        result['negativeSum'] = negativeSum;
    if (result.positiveSum && result.negativeSum)
        result['balance'] = positiveSum + negativeSum;
    return result;
}

module.exports.format = (data, keys) => {
    let table = new AsciiTable();
    table.setHeading(keys);
    table.addRowMatrix(data.o.map(o=>o.dataValues).map(d => keys.map(k => keyParsers[k](d))));
    keys.forEach((k, c) => table.setAlign(c, keyAligns[k]));
    let result = '```\n';
    result += table.toString() + '\n';
    result += data.positiveSum? '   income: ' + parser.amountString(data.positiveSum) + '\n' : '';
    result += data.negativeSum? '  outcome: ' + parser.amountString(data.negativeSum) + '\n' : '';
    result += data.balance? '  balance: ' + parser.amountString(data.balance) + '\n' : '';    
    result += '```'
    return result;
}