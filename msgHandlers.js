require('sugar').extend();
const parser = require('./parsers.js');
const moment = require('moment');
const models = require('./models');
const commands = require('./commands'); 

module.exports.handleRequest = function *(rawRequest, user) {
    const request = handleReductions(rawRequest);

    let result = yield tryToHandle(request, user, false)
    if (result) 
        return result;
    
    const alliasedRequest = yield performAliasing(request);
    result = yield tryToHandle(alliasedRequest, user, true)
    if (result) 
        return result;

    return "wrong command " + alliasedRequest.split(' ')[0];
}

function handleReductions(request) {
    if (!parser.numberify(request.split(' ')[0]))
        return request;
    console.log("request is " + request.split(' ')[0][0])
    if (request.split(' ')[0][0] == '+')
        return commands.add.name + ' ' + request;
    return commands.spend.name + ' ' + request;
}

function * tryToHandle (request, user, aliasing) {
    const firstWord = request.split(' ').first();
    for (let key in commands) {
        const command = commands[key];
        if (command.needAliasing != aliasing)
            continue;

        //console.log('>>> look up ' + command.possibleNames + ' about ' + firstWord);
        if (command.possibleNames.includes(firstWord)) {
            const preparedCommand = yield prepareCommand(request, user);
            //console.log('>>> command is ' + firstWord);
            const invalidFlags = preparedCommand.flags.exclude(f => command.validFlags.includes(f));
            if (!invalidFlags.isEmpty())
                return 'invalid flag ' + invalidFlags[0] + ' use `help ' + command.name + '` for help';

            console.log('>>> check');
            //console.log(preparedCommand);
            let result = yield command.check(preparedCommand);
            if (result.fail)
                return result.fail;
            console.log('>>> handle');
            //console.log(result);
            result = yield command.handle(result);
            console.log('>>> format');
            //console.log(result);
            return command.format(result);
        }
    }
}

function * prepareCommand (request, user) {
    const raw = request.split(' ').compact(true);
    const tags = raw.map(word => parser.tagify(word)).filter(o => o);
    const tagsO = yield models.tag.findAll();
    const registeredTagsO = tagsO.length > 0 ? tagsO.filter((o) => tags.includes(o.dataValues.name)) : [];
    const registeredTags = registeredTagsO.map(o => o.dataValues.name);
    const unregisteredTags = tags.remove(t => registeredTags.includes(t));
    let string = raw.clone().remove(w => parser.tagify(w));
    const flags = string.map(w => parser.flagify(w)).filter(o => o);
    string = string.remove(w => parser.flagify(w));
    let command = string[0];
    string.removeAt(0);
    return {
        tags : {
            registeredO: registeredTagsO,
            registered: registeredTags,
            unregistered: unregisteredTags
        },
        flags: flags,
        string: string,
        rawString: raw.slice(1),
        request: request,
        command: command,
        user: user
    };
}    

function * getAliasesMap () {
    let aliasesO = yield models.alias.findAll();
    let aliases = {};
    aliasesO.forEach ((o) => aliases[o.dataValues.from] = o.dataValues.to);
    return aliases;
}

function * performAliasing (data) {
    let aliases = yield getAliasesMap();
    const splited = data.split(' ').compact(true);
    return splited.map(word => aliases[word] ? aliases[word] : word).join(' ');
}