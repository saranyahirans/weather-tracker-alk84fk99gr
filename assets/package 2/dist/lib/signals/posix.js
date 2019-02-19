'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SignalBinder = exports.signalEscalations = undefined;

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var _binder = require('./binder');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const log = (0, _debug2.default)('take-home-tester:child-process:signal:posix');

function bindSignal(sig) {
  // Negating the PID sends the signal to the entire process tree.
  return (() => {
    var _ref = _asyncToGenerator(function* (pid) {
      return signal(-pid, sig);
    });

    return function (_x) {
      return _ref.apply(this, arguments);
    };
  })();
}

function signal(pid, signal) {
  log(`Sending ${signal} to pid ${pid}`);
  process.kill(pid, signal);
}

const signalEscalations = exports.signalEscalations = [bindSignal('SIGINT'), bindSignal('SIGTERM'), bindSignal('SIGKILL')];

class SignalBinder extends _binder.BaseSignalBinder {
  constructor() {
    super();
    process.on('SIGHUP', this.emitGracefulExitRequest).on('SIGINT', this.emitGracefulExitRequest).on('SIGQUIT', this.emitGracefulExitRequest).on('SIGTERM', this.emitForceExitRequest).on('exit', this.emitForceExitRequest);
  }

  unbind() {
    process.removeListener('SIGHUP', this.emitGracefulExitRequest).removeListener('SIGINT', this.emitGracefulExitRequest).removeListener('SIGQUIT', this.emitGracefulExitRequest).removeListener('SIGTERM', this.emitForceExitRequest).removeListener('exit', this.emitForceExitRequest);
  }
}
exports.SignalBinder = SignalBinder;
//# sourceMappingURL=posix.js.map