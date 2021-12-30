

export function isWindowContentChanged() {
    // eslint-disable-next-line no-undef
    return typeof ____WindowContentChanged !== 'undefined' && ____WindowContentChanged == true
}
export function setWindowContentChanged(changed) {
    if (typeof changed === 'undefined' || changed) {
        window.____WindowContentChanged = true
    } else {
        window.____WindowContentChanged = false
    }
}
export function installContentMonitor() {
    window.onbeforeunload = function (e) {
        if (isWindowContentChanged()) {
            e.preventDefault()
            // return some other than undefined to indicate modified
            return ""
        }
    }
}