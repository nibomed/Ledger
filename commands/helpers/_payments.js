require('sugar').extend();
const parser = require('../../parsers.js');
const models = require('../../models');
const moment = require('moment');

module.exports.check = function * chec(data) {
    if (!parser.numberify(data.string[0]))
        return {fail: 'wrong amount'};
    
    if (!data.tags.unregistered.isEmpty() && !data.flags.includes('force'))
        return {fail: 'Unknown tag ' + data.tags.unregistered[0] + ' you may use *--force* to add it'};
    
    return data;
}
module.exports.handle = function * handle(data, isPositive) {
    let unhandledIdx = 1;
    let amount = Math.abs(parser.numberify(data.string[0]));
    if (!isPositive)
        amount*=-1;
    let prefix = '';

    //parse date
    let date = data.string.length < 2? false : parser.datify(data.string[1]);
    if (!date)
        date = moment();
    else
        unhandledIdx++;

    // create new tags
    for (let i = 0; i < data.tags.unregistered.length; i++) {
        const tag = data.tags.unregistered[i];
        const tagO = yield models.tag.create({name: tag});
        prefix += 'created *' + parser.tagSymbol  + tag + '*\n';
        data.tags.registered.push(tag);
        data.tags.registeredO.push(tagO);
    }

    // form message
    let message = '';
    for (let i = unhandledIdx; i < data.string.length; i++) {
        const word = data.string[i];
        message += (message.length > 0?' ':'');
        message += word;
    }

    // commit to db
    let paymentO = yield models.payment.create({amount: amount, date: date.startOf('day'), message:message, user: data.user});
    for (let i = 0; i < data.tags.registered.length; i++)
        yield paymentO.addTag(data.tags.registeredO[i]);

    return {prefix: prefix, paymentO: paymentO, tagsO: data.tags.registeredO};
}

module.exports.format = function format(data) {
    return data.prefix + parser.paymentString(data.paymentO, data.tagsO) + ' ..commited';
}