import CustomError from "./CustomError";

class ValidationError extends CustomError { 
    constructor(message = 'validation failed'){
        super(message, 400);
    }
}

export default ValidationError;