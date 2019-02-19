'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.BaseSignalBinder = undefined;

var _events = require('events');

class BaseSignalBinder extends _events.EventEmitter {
  constructor() {
    super();
    this.emitGracefulExitRequest = () => this.emit('userRequestedExit', { force: false });
    this.emitForceExitRequest = () => this.emit('userRequestedExit', { force: true });
  }

  unbind() {/* noop */}
}
exports.BaseSignalBinder = BaseSignalBinder;
//# sourceMappingURL=binder.js.map