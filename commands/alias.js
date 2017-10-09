require('sugar').extend();
const parser = require('../parsers.js');
const models = require('../models');
const moment = require('moment');

module.exports = function () {
    let alias = {
        name: 'alias',
        needAliasing: false,
        validFlags: [],
        possibleNames: ['alias'],
        check: check,
        handle: handle,
        format: format
    }

    return alias;
}

function * check(data) {
    let result = {};
    if (data.rawString.length == 0)
        result.subCommand = 'list';

    if (data.rawString.length == 1) {
        if (['delete'].includes(data.rawString[0])) 
            return {fail: 'Delete witout arguments'};
        result.subCommand = 'info';
        result.aliasName = data.rawString[0];
    }

    if (data.rawString.length == 2) {
        if (data.rawString[0] == 'delete') {
            result.from = data.rawString[1];
            result.subCommand = 'delete';
            result.aliasO = yield models.alias.findOne({where: {from : result.from}});
            if (!result.aliasO)
                return {fail: 'Have no alias ' + result.from + ' to delete'}
        } else {
            result.from = data.rawString[0];
            result.to = data.rawString[1];
            result.subCommand = 'add';
            const o = yield models.alias.findOne({where: {from : data.from}});
            if (o)
                return {fail: 'Alias with key ' + data.from + ' allready exist'}
        }
    }
    
    return result;
}

function * handle(data) {
    let result = {subCommand: data.subCommand};
    if (data.subCommand == 'list')
        result.listO = yield models.alias.findAll();

    if (data.subCommand == 'info') {
        result.listO = []
        .add(yield models.alias.findOne({where: {from: data.aliasName}}))
        .add(yield models.alias.findAll({where: {to: data.aliasName}}))
        .compact();

        result.aliasName = data.aliasName;
    }

    if (data.subCommand == 'delete') {
        result.aliasString = parser.aliasString(data.aliasO)
        yield models.alias.destroy({where: {from: data.from}});
    }

    if (data.subCommand == 'add') {
        let aliasO = yield models.alias.create({from: data.from, to: data.to});
        result.aliasString = parser.aliasString(aliasO);
    }

    return result;
}

function format(data) {
    if (data.subCommand == 'list') {
        let result = 'List of aliases:';
        data.listO.forEach(o => result += '\n' + parser.aliasString(o));
        return result;
    }

    if (data.subCommand == 'info') {
        let result = 'Info for ' + data.aliasName;
        data.listO.forEach(o => result += '\n' + parser.aliasString(o));
        return result;
    }

    if (data.subCommand == 'delete')
        return 'Alias ' + data.aliasString + ' ...deleted';

    if (data.subCommand == 'add')
        return 'Alias ' + data.aliasString + ' ...added';
}