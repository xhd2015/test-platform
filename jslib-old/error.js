

class InvalidArgumentsError extends Error {
	constructor(msg){
		super(msg)
	}
}

module.exports = {
	InvalidArgumentsError,
}
