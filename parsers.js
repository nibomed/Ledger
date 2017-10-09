require('sugar');
const moment = require('moment');

module.exports.numberify = function(data) {
    if (!isNaN(data))
        return Number(data);
    var num = data.replace(',','.');
    if (!isNaN(num))
        return Number(num);
    return false;    
}

const tagSymbol = '#';
module.exports.tagSymbol = tagSymbol;

module.exports.tagify = function (data) {
    if (data && data[0] == tagSymbol) 
        return data.slice(1);
    return false; 
}

module.exports.flagify = function (data) {
    const noPrefix = data.slice(2);
    const flags = ['force', 'daily'];
    var tmp = flags.filter((x) => x == noPrefix);
    if (tmp.length > 0)
        return noPrefix;
    return false; 
}

module.exports.datify = function(data) {
    const date = data.toLowerCase();
    if (['yesterday', 'yes', 'вчера', 'вчора', 'вч'].includes(date))
        return moment().subtract(1, 'days');
    if (['позавчера', 'позавчора', 'пвч'].includes(date))
        return moment().subtract(2, 'days');
    var weekdayNames = [
        ['sunday', 'sun', 'воскресение', 'вс', 'неділя', 'нд'],
        ['monday', 'mon', 'понедельник', 'понеділок', 'пн'],
        ['tuesday', 'tue', 'tues', 'вторник', 'вівторок', 'вт'],
        ['wednesday', 'wed', 'среда', 'середа', 'ср'],
        ['thursday', 'thu', 'четверг', 'чт'],
        ['friday', 'fri', 'пятниця', 'пт'],
        ['saturday', 'sat', 'суббота', 'субота', 'сб']];

    for (var day = 0; day < weekdayNames.length; day++) {
        if (weekdayNames[day].includes(date))
            return moment().subtract(moment().day() + 7  - day % 7, 'days');
    }

    const formats = ['DD', 'DD-MM', 'DD/MM','DD-MM-YY', 'DD/MM/YY', 'DD-MM-YYYY', 'DD/MM/YYYY'];
    for (var i = 0; i < formats.length; i++) {
        const possibleResult = moment(date, formats[i], true);
        if (possibleResult.isValid())
            return possibleResult;
    }
    return false;
}

function amountString(amount) {
    const tmp = amount.toFixed(2) + '₴';
    return (amount > 0 ? '+' : '') + tmp;
}

module.exports.amountString = amountString;

module.exports.paymentString = function (paymentO, tags) {
    const data = paymentO.dataValues;
    const tagsO = data.tags || tags;
    let result = '';
    if (moment(data.date).toString() !== moment().startOf('day').toString())
        result += '*' + moment(data.date).format('DD MMM') + '*: ';
    else
        result += 'Today: ';
    result += amountString(data.amount) + ' ';
    result += data.message + ' ';
    if (tagsO)
        tagsO.forEach(tag => result += tagSymbol + tag.dataValues.name + ' ');
    result += ' by ' + data.user;
    return result;
}

module.exports.aliasString = function (aliasO) {
    const data = aliasO.dataValues;
    return data.from + ' => ' + data.to;  
}