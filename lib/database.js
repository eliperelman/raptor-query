var influent = require('influent');
var R = require('ramda');

/**
 * Create a database client
 * @param {Object} options
 * @returns {Promise}
 */
module.exports = R.memoize((options) => {
  var serverProps = ['protocol', 'host', 'port'];

  return influent
    .createClient(
      R.merge(
        { precision: 'n', server: R.pick(serverProps, options) },
        R.omit(serverProps, options)
      )
    );
});
