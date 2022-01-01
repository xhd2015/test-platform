import { getMessageHandler } from "./inject"

// message options: {timeout, loading,close, type:"info"|"warn"|"error"}
export function showLoading(message, options) {
    if (getMessageHandler()) {
        getMessageHandler()(message, { loading: true, ...options })
    } else {
        console.log("[Loading] ", message)
    }
}
export function showError(message, options) {
    if (getMessageHandler()) {
        getMessageHandler()(message, { type: "error", close: true, timeout: -1, ...options })
    } else {
        console.error(message)
    }
}

const message = {
    showLoading,
    showError
}
export default message