const {InvalidArgumentsError} = require("./error")


function validate(obj){
    for(let key in obj){
        // NaN is invalid also
        if(!obj[key]){
            throw new InvalidArgumentsError("requires " + key)
        }
    }
}


module.exports = {
    validate
}
