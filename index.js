var fs = require('fs');
var path = require('path');

module.exports = function(options) {
  var query = fs.readFileSync(path.join(__dirname, options.measurement + '.iql'), { encoding: 'utf8' });

  return query
    .replace(/\n/g, ' ')
    .replace('@metric', options.metric)
    .replace('@context', options.context)
    .replace('@branch', options.branch)
    .replace('@device', options.device)
    .replace('@memory', options.memory)
    .replace('@test', options.test)
    .replace('@node', options.node)
    .replace('@timeFilter', options.timeFilter)
    .trim();
};
