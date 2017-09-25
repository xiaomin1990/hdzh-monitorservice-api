var factories = require('require-directory')(module);

module.exports = function(app) {
  Object.keys(factories).forEach(function(key) {
    /* istanbul ignore else */
    if (key !== 'index') {
      app.factory(key, factories[key](app));
    }
  });
};
