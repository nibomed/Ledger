let Sequelize = require('sequelize');
let fs = require('fs');
let path  = require('path');

const sequelize = new Sequelize(process.env.DATABASE_URL);

module.exports.sequelize = sequelize;

(function(m) {
    fs.readdirSync(__dirname)
        .filter((file) => (file.indexOf('.') !== 0) &&
                (file !== 'index.js') &&
                (file.endsWith('.js')))
        .forEach(function(file) {
            let model = m.sequelize['import'](path.join(__dirname, file));
            m[model.name] = model;
        });

    Object.keys(m).forEach(function(modelName) {
		if ('associate' in m[modelName]) {
            m[modelName].associate(m);
        }
    });
})(module.exports);