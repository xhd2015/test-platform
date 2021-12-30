"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ReadClipboardDenied = void 0;
exports.execCopy = execCopy;
exports.execCut = execCut;
exports.execPaste = execPaste;
exports.readClipboard = readClipboard;
exports.setClipboard = setClipboard;
let fakeElement;

function getFakeElement() {
  if (fakeElement) {
    return fakeElement;
  }

  fakeElement = document.createElement('textarea');
  document.body.appendChild(fakeElement);
  return fakeElement;
} // must ensure text is not empty


function setFakeElementSelectedText(text, command) {
  const el = getFakeElement();
  el.value = text; // must be visible to be selected

  el.style.display = "";
  el.select();
  el.setSelectionRange(0, el.value.length);
  document.execCommand(command);
  el.style.display = "none";
}

function copyToClipboard(text) {
  if (text == null || text === '') {
    return;
  }

  setFakeElementSelectedText(text, "copy");
}

function execCopy() {
  document.execCommand("copy");
}

function execPaste() {
  document.execCommand("paste");
}

function execCut() {
  document.execCommand("cut");
}

class ReadClipboardDenied extends Error {
  constructor(msg) {
    super(msg);
  }

}

exports.ReadClipboardDenied = ReadClipboardDenied;

async function readClipboard() {
  if (typeof navigator !== 'undefined') {
    return new Promise((resolve, reject) => {
      navigator.permissions.query({
        name: "clipboard-write"
      }).then(result => {
        if (result.state == "granted" || result.state == "prompt") {
          /* read the clipboard now */
          resolve(navigator.clipboard.readText());
        } else if (result.state == "denied") {
          // no matter which way, permission is always required
          // setFakeElementSelectedText("","paste")
          // resolve(getFakeElement().value)
          reject(new ReadClipboardDenied());
        }
      });
    });
  } else {
    // unsupported
    console.log("read clipboard not supported");
  }
}

async function setClipboard(text) {
  if (text == null || text === '') {
    return;
  }

  if (typeof navigator !== 'undefined' && navigator.clipboard) {
    // navigator.clipboard is only available
    // when accessed by localhost
    await navigator.clipboard.writeText(text);
  } else {
    copyToClipboard(text);
  }
}