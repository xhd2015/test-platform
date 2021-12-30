


export function bindWatch(vm, watch, dst, immediate = true) {
    vm.$watch(watch, e => vm[dst] = e, { immediate})
}
export function bindEmit(vm, watch, event, immediate = false) {
    vm.$watch(watch, e => vm.$emit(event,e), { immediate})
}