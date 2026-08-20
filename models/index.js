const fs = require('fs');
const path = require('path');

const models = {};

fs.readdirSync(__dirname)
  .filter((file) => file !== 'index.js' && file.endsWith('.js'))
  .forEach((file) => {
    const model = require(path.join(__dirname, file));
    const name = model && model.name ? model.name : path.basename(file, '.js');
    models[name] = model;
  });

Object.values(models).forEach((model) => {
  if (model.associate) model.associate(models);
});

module.exports = models;
