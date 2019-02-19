'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Cli = undefined;

var _cucumber = require('cucumber');

var _configuration_builder = require('cucumber/lib/cli/configuration_builder');

var _configuration_builder2 = _interopRequireDefault(_configuration_builder);

var _runner = require('./runner');

var _events = require('events');

var _events2 = _interopRequireDefault(_events);

var _format = require('../lib/format');

var _bluebird = require('bluebird');

var Bluebird = _interopRequireWildcard(_bluebird);

var _getPort = require('get-port');

var _getPort2 = _interopRequireDefault(_getPort);

var _scenarioLocation = require('./scenario-location');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

class Cli extends _cucumber.Cli {
  constructor({ options, cwd, cucumberArgs, stdout }) {
    super({
      cwd, stdout,
      argv: [null, '', ...cucumberArgs]
    });

    this.options = options;
    this.eventBroadcaster = new _events2.default();
  }

  getSupportCodeLibrary(supportCodePaths) {
    Object.defineProperties(_cucumber.supportCodeLibraryBuilder.methods, {
      runner: {
        enumerable: true,
        value: this.runner
      },
      eventBroadcaster: {
        enumerable: true,
        value: this.eventBroadcaster
      }
    });

    return super.getSupportCodeLibrary(supportCodePaths);
  }

  setupRunner() {
    var _this = this;

    return _asyncToGenerator(function* () {
      if (_this.runner) return;

      const { host, command } = _this.options;
      let { port } = _this.options;

      if (!port) port = yield (0, _getPort2.default)({ host });

      _this.runner = new _runner.Runner({ host, port, command });
    })();
  }

  getConfiguration() {
    var _this2 = this;

    return _asyncToGenerator(function* () {
      const builder = new _configuration_builder2.default({ argv: _this2.argv, cwd: _this2.cwd });

      const { featurePaths, stepPaths } = _this2.options;
      builder.getUnexpandedFeaturePaths = function () {
        if (this.args.length > 0) return _configuration_builder2.default.prototype.getUnexpandedFeaturePaths.call(this);else return Bluebird.resolve(featurePaths);
      };

      builder.options.require.push(...stepPaths);

      const config = yield builder.build();

      if (_this2.options.checkNew) {
        const featurePaths = typeof _this2.options.checkNew === 'string' ? _this2.options.checkNew : yield builder.getUnexpandedFeaturePaths();

        config.formatOptions.newScenarios = yield _this2.findNewScenarios(featurePaths);
      }

      if (_this2.options.debug) config.formats = [{ type: require.resolve('../formatters/debug-formatter') }];

      if (_this2.options.score) config.formats.push({ type: require.resolve('../formatters/score-formatter') });else config.formats.push({ type: require.resolve('../formatters/strip-points-formatter') });

      config.formats = config.formats.filter(function (f) {
        return f.type !== 'none';
      });

      return config;
    })();
  }

  run() {
    var _this3 = this;

    return _asyncToGenerator(function* () {
      yield _this3.setupRunner();

      const configuration = yield _this3.getConfiguration();
      const supportCodeLibrary = _this3.getSupportCodeLibrary(configuration.supportCodePaths);

      const cleanup = yield _this3.initializeFormatters({
        supportCodeLibrary,
        eventBroadcaster: _this3.eventBroadcaster,
        formatOptions: configuration.formatOptions,
        formats: configuration.formats
      });

      const testCases = (0, _cucumber.getTestCasesFromFilesystem)({
        cwd: _this3.cwd,
        eventBroadcaster: _this3.eventBroadcaster,
        featurePaths: configuration.featurePaths,
        pickleFilter: new _cucumber.PickleFilter(configuration.pickleFilterOptions)
      });

      const runtime = new _cucumber.Runtime({
        eventBroadcaster: _this3.eventBroadcaster,
        options: configuration.runtimeOptions,
        supportCodeLibrary,
        testCases
      });

      _this3.eventBroadcaster.once('abort', function () {
        configuration.runtimeOptions.dryRun = true;
        runtime.result.success = false;
      });

      try {
        yield runtime.start();
      } finally {
        yield cleanup();
      }
    })();
  }

  precheck() {
    var _this4 = this;

    return _asyncToGenerator(function* () {
      yield _this4.setupRunner();

      const { host, port } = _this4.runner.runConfig;

      try {
        yield _this4.runner.waitForServerUnavailable();
      } catch (err) {
        return {
          ok: false,
          message: `${host}:${port} appears to be in use. Cannot start tests.`
        };
      }

      if (_this4.runner.isStopping) return { abort: true };

      const output = _this4.runner.start();
      try {
        yield _this4.runner.waitForServerAvailable();
      } catch (err) {
        yield _this4.runner.forceStop();
        const log = yield output;
        return {
          ok: false,
          message: `Could not connect to ${host}:${port}
${(0, _format.fence)('console log', log)}`
        };
      }

      yield _this4.runner.stop();

      return { ok: true };
    })();
  }

  findNewScenarios(directories) {
    var _this5 = this;

    return _asyncToGenerator(function* () {
      return (0, _scenarioLocation.findScenarios)({
        cwd: _this5.cwd,
        directories: Array.isArray(directories) ? directories : [directories],
        colors: _this5.colorFns,
        tag: '@new'
      });
    })();
  }

  exit({ force }) {
    this.eventBroadcaster.emit('abort');

    if (force) return this.runner.forceStop();else return this.runner.stop();
  }
}
exports.Cli = Cli;
//# sourceMappingURL=cli.js.map