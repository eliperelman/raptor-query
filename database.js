var influent = require('influent');
var R = require('ramda');

module.exports = R.memoize((options) => {
  var serverProps = ['protocol', 'host', 'port'];

  return influent.createClient(R.merge({
    precision: 'n',
    server: R.pick(serverProps, options)
  }, R.omit(serverProps, options)));
});
