
// messageHandler(message,options)
let messageHandler

export function injectMessageHandler(fn) {
    messageHandler = fn
}

export function getMessageHandler() {
    return messageHandler
}

// copyHandler(text,options)
let copyHandler

export function injectCopyHandler(fn){
    copyHandler = fn
}
export function getCopyHandler() {
    return copyHandler
}
