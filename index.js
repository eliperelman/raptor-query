'use strict';

let R = require('ramda');
let query = require('./lib');

/**
 * Return the time filter of an object with a time property
 * @param {Object} options
 * @returns {String}
 */
let getTimeFilter = R.pipe(
  R.prop('time'),
  R.cond([
    [R.contains(' '), R.identity],
    [R.T, R.concat('time > now() - ')]
  ])
);

/**
 * Convert object with time property to object with timeFilter
 * @param {Object} options
 * @returns {Object}
 */
let formatTime = R.converge(R.merge, [
  R.pipe(getTimeFilter, R.objOf('timeFilter')),
  R.omit('time')
]);

module.exports = (cli) => {
  let command = cli.command('query <measurement>');

  command
    .description('Run a query against an InfluxDB data source; measurements: measure, memory, mtbf, power')
    .option('--context [origin]', 'Filter records to a particular application context')
    .option('--metric [name]', 'Filter records to a particular metric')
    .option('--branch [name]', 'Filter records to those run against a particular branch', 'master')
    .option('--device [identifier]', 'Filter records to those run against a particular connected device type')
    .option('--memory [memoryMB]', 'Filter records to those run against a particular amount of memory for the targeted device')
    .option('--test [name]', 'Filter records to those run with a particular test')
    .option('--node [name]', 'Filter records to those run on a particular node')
    .option('--time [expression]', 'Filter records to a particular InfluxDB time query', '1h')
    .action(function(args) {
      /**
       * Command flow:
       * 1. Convert --time to timeFormat
       * 2. Pass options to execute to run query
       * @param {Object} options
       * @returns {Promise}
       */
      return Promise
        .resolve(R.merge({ measurement: args.measurement }, cli.getOptions(this)))
        .then(R.pipe(formatTime, query))
        .then(cli.JSON)
        .catch(cli.exits)
    });

  cli.usesDatabase(command);

  return command;
};
