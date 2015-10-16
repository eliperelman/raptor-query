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

var clean = R.pipe(R.replace(/\n[ ]+/g, ' '), R.trim);
var getRawQuery = (measurement, options) => R.call(R.prop(measurement, queries), options);
var getQuery = R.converge(R.pipe(getRawQuery, clean), [R.prop('measurement'), R.identity]);

module.exports = (options) => {
  return Promise
    .all([
      database(options),
      getQuery(options)
    ])
    .then(values => {
      var client = values[0];
      var query = values[1];

      return client.query(query);
    });
};
