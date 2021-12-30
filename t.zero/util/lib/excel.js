"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.loadExcel = loadExcel;
exports.toExcel = toExcel;

var _xlsx = _interopRequireDefault(require("xlsx"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// requires  xlsx.full.min.js,
// see https://github.com/SheetJS/sheetjs
// npm install xlsx

/**
 * return an array of object read from excel
 */
function loadExcel(binContent) {
  var workbook = _xlsx.default.read(binContent, {
    type: 'binary' // 'array' is also possible

  });

  let sheet = workbook.Sheets[workbook.SheetNames[0]];
  return _xlsx.default.utils.sheet_to_json(sheet, {
    raw: true
  });
}
/**
 * save an array of object to excel
 * @param arrOfObject
 */


function toExcel(arrOfObject, file) {
  if (!arrOfObject) {
    return;
  }

  if (!Array.isArray(arrOfObject)) {
    throw new Error("not array");
  } // requires prototype


  arrOfObject.forEach(e => {
    if (!Object.getPrototypeOf(e)) {
      Object.setPrototypeOf(e, {});
    }
  });
  /* create a new blank workbook */

  var wb = _xlsx.default.utils.book_new();

  let data = _xlsx.default.utils.json_to_sheet(arrOfObject);
  /* Add the worksheet to the workbook */


  _xlsx.default.utils.book_append_sheet(wb, data, "sheet");
  /* output format determined by filename */


  _xlsx.default.writeFile(wb, file);
}