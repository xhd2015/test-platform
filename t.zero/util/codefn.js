export function loadCodeWithContext(context, ______) { // ______ is code
    'use strict';
    // code can visit context,but no other names is available
    if (______) {
        return eval('(' + ______ + ')')
    }
    return null
}
export function callFunc(______) { // ______ is {func,args} ,args is an array
    return (______.func)(...(______.args))
}