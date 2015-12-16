'use strict';

let R = require('ramda');
let database = require('./database');

let queries = {
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
      GROUP BY * fill(none)`;
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
      GROUP BY * fill(none)`;
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

let requirements = {
  measure: ['metric', 'context', 'branch', 'device', 'memory', 'test'],
  memory: ['metric', 'context', 'branch', 'device', 'memory', 'test'],
  mtbf: ['node', 'branch', 'device', 'memory'],
  power: ['test', 'context', 'branch', 'device', 'memory']
};

/**
 * Remove extra whitespace and newlines from a query
 * @param {String} queryString
 * @returns {String}
 */
let clean = R.pipe(R.replace(/\n[ ]+/g, ' '), R.trim);

/**
 * Fetch the query string for a given measurement using options to fill in query values
 * @param {String} measurement InfluxDB measurement
 * @param {Object} options query values
 */
let getRawQuery = (measurement, options) => R.call(R.prop(measurement, queries), options);

/**
 * Fetch the query string for a given set of options
 * @param {Object} options
 * @returns {String}
 */
let getQuery = R.converge(R.pipe(getRawQuery, clean), [R.prop('measurement'), R.identity]);

/**
 * Execute a query against an InfluxDB database
 * 1. Create a database client
 * 2. Fetch the query string
 * 3. Execute the query against the database
 * @param options
 * @returns {Promise}
 */
module.exports = (options) => {
  let reqs = requirements[options.measurement];

  if (!reqs) {
    throw new Error(`Unrecognized query measurement "${options.measurement}"`);
  }

  R.forEach(requirement => {
    if (!(requirement in options) || !options[requirement]) {
      throw new Error(`Missing required parameter "${requirement}" for ${options.measurement}`);
    }
  }, reqs);

  return Promise
    .all([
      database(options),
      getQuery(options)
    ])
    .then(R.apply((client, query) => client.query(query)));
};
