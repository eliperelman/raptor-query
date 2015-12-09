'use strict';

let R = require('ramda');
let query = require('./lib');

/**
 * Determine if an object is a `measure` measurement
 * @param {Object} options
 * @returns {Boolean}
 */
let isMeasure = R.pipe(R.prop('measurement'), R.equals('measure'));

/**
 * Determine if an object is a `memory` measurement
 * @param {Object} options
 * @returns {Boolean}
 */
let isMemory = R.pipe(R.prop('measurement'), R.equals('memory'));

/**
 * Determine if an object is a `measure` or `memory` measurement
 * @param {Object} options
 * @returns {Boolean}
 */
let isMeasureOrMemory = R.converge(R.or, [isMeasure, isMemory]);

/**
 * Determine if an object's `context` property is empty
 * @param {Object} options
 * @returns {Boolean}
 */
let noContext = R.pipe(R.prop('context'), R.converge(R.or, [R.isNil, R.isEmpty]));

/**
 * Determine if an object's `metric` property is empty
 * @param {Object} options
 * @returns {Boolean}
 */
let noMetric = R.pipe(R.prop('metric'), R.converge(R.or, [R.isNil, R.isEmpty]));

/**
 * Determine if an object is missing a required context
 * @param {Object} options
 * @returns {Boolean}
 */
let missingContext = R.converge(R.and, [isMeasureOrMemory, noContext]);

/**
 * Determine if an object is missing a required metric
 * @param {Object} options
 * @returns {Boolean}
 */
let missingMetric = R.converge(R.and, [isMeasureOrMemory, noMetric]);

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
    .description('Run a query against an InfluxDB data source')
    .option('--context [origin]', 'Filter records to a particular application context; required for measure and memory measurements')
    .option('--metric [name]', 'Filter records to a particular metric; required for measure and memory measurements')
    .option('--branch [name]', 'Filter records to those run against a particular branch', 'master')
    .option('--device [identifier]', 'Filter records to those run against a particular device type')
    .option('--memory [memoryMB]', 'Filter records to those run against a particular amount of memory for the targeted device', 512)
    .option('--test [name]', 'Filter records to those run with a particular test')
    .option('--node [name]', 'Filter records to those run on a particular node')
    .option('--time [expression]', 'Filter records to a particular InfluxDB time query')
    .action(function(args) {
      /**
       * Command flow:
       * 1. Ensure --context for measure and memory queries
       * 2. Ensure --metric for measure and memory queries
       * 3. Convert --time to timeFormat
       * 4. Pass options to execute to run query
       * @param {Object} options
       * @returns {Promise}
       */
      return Promise
        .resolve(R.merge({ measurement: args.measurement }, cli.getOptions(this)))
        .then(R.cond([
          [missingContext, cli.errors('--context is required for measure or memory queries')],
          [missingMetric, cli.errors('--metric is required for measure or memory queries')],
          [R.T, R.pipe(formatTime, query)]
        ]))
        .then(cli.JSON)
        .catch(cli.exits)
    });

  cli.usesDatabase(command);

  return command;
};
