"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getCurrentUrlQuery = getCurrentUrlQuery;
exports.getMarginTopToPlaceThisElementOnParentBottom = getMarginTopToPlaceThisElementOnParentBottom;
exports.getPrevSiblingBottom = getPrevSiblingBottom;
exports.getUrlQuery = getUrlQuery;
exports.moveSelection = moveSelection;
exports.placeToParentBottom = placeToParentBottom;
exports.updateTextareaHeight = updateTextareaHeight;
exports.updateTextareaWidth = updateTextareaWidth;

function moveSelection(pos) {
  if (window.getSelection()) {
    let anchor = window.getSelection().anchorNode;
    window.getSelection().setPosition(anchor, pos == null ? anchor.length : pos);
  }
}

function updateTextareaHeight(e) {
  e.style.height = 'auto';
  e.style.height = e.scrollHeight + 'px';
}

function updateTextareaWidth(e) {
  e.style.width = 'auto';
  e.style.width = e.scrollWidth + 'px';
}

function getCurrentUrlQuery() {
  return getUrlQuery(location.search);
}

function getUrlQuery(query) {
  let pageObj = {};

  if (!query) {
    return pageObj;
  }

  if (query.startsWith("?")) {
    query = query.substr(1);
  }

  let arr = query.split("&");

  for (let a of arr) {
    let eqIdx = a.indexOf("=");
    let key;
    let value;

    if (eqIdx === -1 || eqIdx === a.length) {
      key = a;
    } else {
      key = a.substring(0, eqIdx);
      value = a.substring(eqIdx + 1);
    }

    if (value == null) {
      value = "";
    }

    key = decodeURIComponent(key);
    value = decodeURIComponent(value);
    let existing = pageObj[key];

    if (existing == null) {
      pageObj[key] = value;
    } else if (existing.constructor === Array) {
      existing.push(value);
    } else {
      existing = [existing, value];
      pageObj[key] = existing;
    }
  }

  return pageObj;
}

function getPrevSiblingBottom(e) {
  while (e && e.previousSibling) {
    if (e.previousSibling.offsetParent) {
      return e.previousSibling.offsetTop + e.previousSibling.offsetHeight;
    }

    e = e.previousSibling;
  }

  return 0;
}

function getMarginTopToPlaceThisElementOnParentBottom(e) {
  if (e.parentElement) {
    return e.parentElement.offsetHeight - getPrevSiblingBottom(e) - e.offsetHeight;
  }

  return 0;
}

function placeToParentBottom(e) {
  let pos = getMarginTopToPlaceThisElementOnParentBottom(e);
  e.style.marginTop = pos + "px";
}