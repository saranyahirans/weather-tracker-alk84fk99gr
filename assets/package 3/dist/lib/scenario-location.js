'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.findScenarios = undefined;

let findScenarios = exports.findScenarios = (() => {
  var _ref = _asyncToGenerator(function* ({ cwd, directories, tag }) {
    const pathExpander = new _path_expander2.default(cwd);
    const featurePaths = yield pathExpander.expandPathsWithExtensions(directories, ['feature']);

    const eventBroadcaster = new _events.EventEmitter();
    const eventDataCollector = new _cucumber.formatterHelpers.EventDataCollector(eventBroadcaster);

    const testCases = yield (0, _cucumber.getTestCasesFromFilesystem)({
      cwd, eventBroadcaster, featurePaths,
      pickleFilter: {
        matches({ pickle }) {
          return pickle.tags.some(t => t.name === tag);
        }
      }
    });

    return testCases.map(function ({ pickle, uri }) {
      return eventDataCollector.getTestCaseData({
        uri,
        line: pickle.locations[0].line
      });
    });
  });

  return function findScenarios(_x) {
    return _ref.apply(this, arguments);
  };
})();

var _cucumber = require('cucumber');

var _path_expander = require('cucumber/lib/cli/path_expander');

var _path_expander2 = _interopRequireDefault(_path_expander);

var _events = require('events');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }
//# sourceMappingURL=scenario-location.js.map