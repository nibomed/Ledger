require('sugar');
require('./herokuKeepAlive.js');
require('./parsers.js');
const co = require('co');
const msgHandlers = require('./msgHandlers.js');
const models = require('./models');

const SlackBot = require('slackbots');

let bot = new SlackBot({
    token: process.env.BOT_TOKEN,
    name: 'Lehmars Ledger'
});

const params = {
    icon_emoji: ':notebook_with_decorative_cover:'
};


let userList = [];
function __findUserById(userId) {
    return userList && userList._value && userList._value.members &&
           (userList._value.members.find((user) => user.id == userId));
}

bot.getUserById = function(userId){
    let rightUser = __findUserById(userId);
    if (!rightUser || !rightUser.length) {
        userList = this.getUsers();
        rightUser = __findUserById(userId);
    }

    return rightUser;
}

bot.on('start', function() {
    bot.postMessageToChannel('general', 'I am up', params);
});

bot.on('message', function(data) {
    if (!data || data.type != "message" || data.subtype == "bot_message")
        return;
    const sender = bot.getUserById(data.user);
    if (!sender)
        return;
    co(function * () {
        const response = yield msgHandlers.handleRequest(data.text, sender.name);
        bot.postMessageToUser(sender.name, response, params)
    })
});

models.sequelize.authenticate()
.then(function () {
    models.sequelize.sync({force: false});
});