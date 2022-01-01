import { getCopyHandler } from "./inject"

// options: {timeout}
export function showCopy(text, options) {
    if (getCopyHandler()) {
        getCopyHandler()(text, options)
    } else {
        console.log("showCopy not handler:", text, options)
    }
}

export default {
    showCopy,
}