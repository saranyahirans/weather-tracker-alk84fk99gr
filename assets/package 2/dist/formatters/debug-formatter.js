'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function ({ log, eventBroadcaster, eventDataCollector, colorFns, newScenarios }) {
  let netLog = null;

  eventBroadcaster.on('test-case-started', () => {
    netLog = [];
  });

  eventBroadcaster.on('test-case-finished', ev => {
    ev.result.netLog = netLog;
    netLog = null;

    logTestCase(ev);
  });

  eventBroadcaster.on('test-run-finished', testRun => {
    log('\n');
    log(_cucumber.formatterHelpers.formatSummary({
      colorFns, testRun,
      testCaseMap: eventDataCollector.testCaseMap
    }));

    if (newScenarios) logNewScenarios(newScenarios);
  });

  copyToNetlog('request');
  copyToNetlog('response');

  function copyToNetlog(eventName) {
    eventBroadcaster.on(eventName, data => netLog.push({ type: eventName, data }));
  }

  function logTestCase({ result, sourceLocation }) {
    switch (result.status) {
      case _cucumber.Status.AMBIGUOUS:
      case _cucumber.Status.FAILED:
        logFullDetails(sourceLocation);
        break;

      case _cucumber.Status.SKIPPED:
      case _cucumber.Status.PENDING:
      case _cucumber.Status.PASSED:
        logShort(sourceLocation);
        break;

      default:
        logFullDetails(sourceLocation);
        break;
    }
  }

  function logShort(sourceLocation) {
    const { pickle, testCase: { result: { status } } } = eventDataCollector.getTestCaseData(sourceLocation);
    const bullet = _characters.statusCharacters[status];
    log(colorFns[status](`${bullet} Scenario: ${pickle.name}\n`));
  }

  function logFullDetails(sourceLocation) {
    const visitor = (0, _testCaseVisitor.createTestCaseVisitor)(eventDataCollector.getTestCaseData(sourceLocation));

    const scenarioStatus = getAggregateStatus(visitor.getSteps());
    log(colorFns[scenarioStatus](`${_characters.statusCharacters[scenarioStatus]} Scenario: ${visitor.pickle.name}\n`));

    for (const step of visitor.getSteps()) {
      const { result } = step.testStep;
      log(colorFns[result.status](`  ${_characters.statusCharacters[result.status]} ${step.keyword}${step.pickleStep.text}\n`));

      if (step.dataTable) log((0, _indentString2.default)((0, _format.formatDataTable)(step.dataTable), 8));else if (step.docString) log((0, _indentString2.default)((0, _format.formatDocString)(step.docString), 8));

      if (result.exception) {
        const errView = Object.create(result.exception);
        errView.stack = null;
        log((0, _indentString2.default)(_cucumber.formatterHelpers.formatError(errView, colorFns), 4));
        log('\n');
      }
    }
    log((0, _indentString2.default)((0, _format.fence)('console log', visitor.testCase.result.consoleLog), 6));
    log((0, _indentString2.default)((0, _format.fence)('request log', visitor.testCase.result.netLog), 6));
    log('\n');
  }

  function logNewScenarios() {
    if (newScenarios.length) {
      log((0, _format.fence)('new scenarios', newScenarios.reduce((str, s) => `${str}\n${(0, _format.formatScenario)(s)}`, '')));
    } else {
      log(colorFns.bold.red('\nNo new scenarios found! '));
      log(`Be sure to tag your new scenarios with ${colorFns.bold.cyan('@new')}.\n`);
    }
  }
};

var _cucumber = require('cucumber');

var _testCaseVisitor = require('../lib/test-case-visitor');

var _indentString = require('indent-string');

var _indentString2 = _interopRequireDefault(_indentString);

var _characters = require('./characters');

var _format = require('../lib/format');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getAggregateStatus(steps) {
  let status = _cucumber.Status.PASSED;
  for (const _ref of steps) {
    const { testStep: { result } } = _ref;

    switch (result.status) {
      case _cucumber.Status.FAILED:
        return _cucumber.Status.FAILED;
      case _cucumber.Status.PASSED:
        break;
      default:
        status = result.status;
    }
  }

  return status;
}
module.exports = exports['default'];
//# sourceMappingURL=debug-formatter.js.map