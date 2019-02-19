'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.StripAnsiTransform = undefined;
exports.fence = fence;
exports.formatDataTable = formatDataTable;
exports.formatDocString = formatDocString;
exports.formatScenario = formatScenario;

var _stream = require('stream');

var _stripAnsi = require('strip-ansi');

var _stripAnsi2 = _interopRequireDefault(_stripAnsi);

var _util = require('util');

var _ramda = require('ramda');

var _cliTable = require('cli-table');

var _cliTable2 = _interopRequireDefault(_cliTable);

var _indentString = require('indent-string');

var _indentString2 = _interopRequireDefault(_indentString);

var _gherkin_document_parser = require('cucumber/lib/formatter/helpers/gherkin_document_parser');

var _pickle_parser = require('cucumber/lib/formatter/helpers/pickle_parser');

var _get_color_fns = require('cucumber/lib/formatter/get_color_fns');

var _get_color_fns2 = _interopRequireDefault(_get_color_fns);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class StripAnsiTransform extends _stream.Transform {
  _transform(chunk, encoding, cb) {
    cb(null, (0, _stripAnsi2.default)(chunk.toString()));
  }
}

exports.StripAnsiTransform = StripAnsiTransform;
const colorFns = (0, _get_color_fns2.default)(true);
const marker = {
  normal: colorFns.inverse.bold,
  warn: colorFns.yellow.inverse.bold,
  italic: colorFns.italic
};

function fence(header, obj) {
  if (!obj || (0, _ramda.isEmpty)(obj)) {
    return `
${marker.warn(`!  ${marker.italic(`No ${header} captured`)}  !`)}
`;
  } else {
    const body = typeof obj === 'string' ? obj : (0, _util.inspect)(obj, { colors: true, depth: null });

    return `
${marker.normal(`═════ begin ${header} ═════`)}
${body}
${marker.normal(`══════ end ${header} ══════`)}
`;
  }
}

function formatDataTable(arg) {
  const rows = arg.rows.map(row => row.cells.map(cell => cell.value.replace(/\\/g, '\\\\').replace(/\n/g, '\\n')));

  const table = new _cliTable2.default({
    chars: {
      bottom: '',
      'bottom-left': '',
      'bottom-mid': '',
      'bottom-right': '',
      left: '|',
      'left-mid': '',
      mid: '',
      'mid-mid': '',
      middle: '|',
      right: '|',
      'right-mid': '',
      top: '',
      'top-left': '',
      'top-mid': '',
      'top-right': ''
    },
    style: {
      border: [],
      'padding-left': 1,
      'padding-right': 1
    }
  });

  table.push(...rows);
  return `${table.toString()}\n`;
}

function formatDocString(arg) {
  return `"""
${arg.content}
"""
`;
}

function formatScenario({ gherkinDocument, pickle }) {
  const { bold, cyan, blue, magenta } = colorFns;

  const stepLineToKeywordMap = (0, _gherkin_document_parser.getStepLineToKeywordMap)(gherkinDocument);

  let str = `${cyan(bold('Scenario:'))} ${pickle.name}\n`;

  for (const pickleStep of pickle.steps) {
    const keyword = (0, _pickle_parser.getStepKeyword)({ pickleStep, stepLineToKeywordMap });

    str += `  ${magenta(bold(keyword))}${pickleStep.text}\n`;

    const arg = stringifyArgument(pickleStep.arguments);
    if (arg) str += (0, _indentString2.default)(blue(arg), 6);
  }

  return str;

  function stringifyArgument([arg]) {
    if (arg) {
      if ('rows' in arg) return formatDataTable(arg);
      if ('content' in arg) return formatDocString(arg);
    }

    return null;
  }
}
//# sourceMappingURL=format.js.map