var plugin = require('./typedoc-plugin-deno');
module.exports = function (PluginHost) {
  var app = PluginHost.owner;
  app.converter.addComponent('deno', plugin.DenoPlugin);
};
