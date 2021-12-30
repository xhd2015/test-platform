"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.bindEmit = bindEmit;
exports.bindWatch = bindWatch;

function bindWatch(vm, watch, dst, immediate = true) {
  vm.$watch(watch, e => vm[dst] = e, {
    immediate
  });
}

function bindEmit(vm, watch, event, immediate = false) {
  vm.$watch(watch, e => vm.$emit(event, e), {
    immediate
  });
}