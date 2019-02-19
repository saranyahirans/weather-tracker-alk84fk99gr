'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SignalBinder = exports.signalEscalations = undefined;

var _taskkill = require('taskkill');

var _taskkill2 = _interopRequireDefault(_taskkill);

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var _binder = require('./binder');

var _readline = require('readline');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const log = (0, _debug2.default)('take-home-tester:child-process:signal:win32');

function bindTaskkill(force) {
  return (() => {
    var _ref = _asyncToGenerator(function* (pid) {
      log(`Executing taskkill on ${pid}, force =`, force);
      try {
        yield (0, _taskkill2.default)(pid, { tree: true, force });
      } catch (err) {
        log('Error executing taskkill:', err.message);
      }
    });

    return function (_x) {
      return _ref.apply(this, arguments);
    };
  })();
}

const signalEscalations = exports.signalEscalations = [bindTaskkill(true)];

class SignalBinder extends _binder.BaseSignalBinder {
  constructor() {
    super();

    // https://stackoverflow.com/a/14861513/93308
    this.rl = (0, _readline.createInterface)({
      input: process.stdin,
      output: process.stdout
    });

    this.rl.on('SIGINT', this.emitGracefulExitRequest);
    process.on('SIGBREAK', this.emitForceExitRequest);
  }

  unbind() {
    this.rl.close();
    process.removeListener('SIGBREAK', this.emitForceExitRequest);
  }
}
exports.SignalBinder = SignalBinder;
//# sourceMappingURL=win32.js.map