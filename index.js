var R = require('ramda');
var database = require('./database');

var queries = {
  measure: (query) => {
    return `SELECT MEAN(value) as value
      FROM "measure"
      WHERE "metric" = '${query.metric}'
      AND "context" = '${query.context}'
      AND "branch" = '${query.branch}'
      AND "device" = '${query.device}'
      AND "memory" = '${query.memory}'
      AND "test" = '${query.test}'
      AND ${query.timeFilter}
      GROUP BY "revisionId" fill(none)`;
  },
  memory: (query) => {
    return `SELECT MEAN(value) as value
      FROM "memory"
      WHERE "metric" = '${query.metric}'
      AND "context" = '${query.context}'
      AND "branch" = '${query.branch}'
      AND "device" = '${query.device}'
      AND "memory" = '${query.memory}'
      AND "test" = '${query.test}'
      AND ${query.timeFilter}
      GROUP BY "revisionId" fill(none)`;
  },
  mtbf: (query) => {
    return `SELECT SUM(value) / SUM(failures) as value
      FROM "mtbf"
      WHERE "node" = '${query.node}'
      AND "branch" = '${query.branch}'
      AND "device" = '${query.device}'
      AND "memory" = '${query.memory}'
      AND ${query.timeFilter}
      GROUP BY time(1s) fill(none)`;
  },
  power: (query) => {
    return `SELECT value
      FROM "power"
      WHERE "test" = '${query.test}'
      AND "context" = '${query.context}'
      AND "branch" = '${query.branch}'
      AND "device" = '${query.device}'
      AND "memory" = '${query.memory}'
      AND ${query.timeFilter}`;
  }
};

/**
 * Remove extra whitespace and newlines from a query
 * @param {String} queryString
 * @returns {String}
 */
var clean = R.pipe(R.replace(/\n[ ]+/g, ' '), R.trim);

/**
 * Fetch the query string for a given measurement using options to fill in query values
 * @param {String} measurement InfluxDB measurement
 * @param {Object} options query values
 */
var getRawQuery = (measurement, options) => R.call(R.prop(measurement, queries), options);

/**
 * Fetch the query string for a given set of options
 * @param {Object} options
 * @returns {String}
 */
var getQuery = R.converge(R.pipe(getRawQuery, clean), [R.prop('measurement'), R.identity]);

/**
 * Execute a query against an InfluxDB database
 * 1. Create a database client
 * 2. Fetch the query string
 * 3. Execute the query against the database
 * @param options
 * @returns {Promise}
 */
module.exports = (options) => {
  return Promise
    .all([
      database(options),
      getQuery(options)
    ])
    .then(R.apply((client, query) => client.query(query)));
};
