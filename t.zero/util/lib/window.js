"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.installContentMonitor = installContentMonitor;
exports.isWindowContentChanged = isWindowContentChanged;
exports.setWindowContentChanged = setWindowContentChanged;

function isWindowContentChanged() {
  // eslint-disable-next-line no-undef
  return typeof ____WindowContentChanged !== 'undefined' && ____WindowContentChanged == true;
}

function setWindowContentChanged(changed) {
  if (typeof changed === 'undefined' || changed) {
    window.____WindowContentChanged = true;
  } else {
    window.____WindowContentChanged = false;
  }
}

function installContentMonitor() {
  window.onbeforeunload = function (e) {
    if (isWindowContentChanged()) {
      e.preventDefault(); // return some other than undefined to indicate modified

      return "";
    }
  };
}