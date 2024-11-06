// Purpose: Define the structure of the error object that will be thrown when an error occurs in the application. This will be used to handle errors in the application. The error object will have a status code, message, success flag, and errors array. The error object will be thrown when an error occurs in the application. The error object will be caught by the error handling middleware and the appropriate response will be sent to the client.

class apiError extends Error {
    statusCode: number;
    message:string;
    data: any;
    success: boolean;
    errors: any[];
    constructor(
        statusCode:number,
        message = "Something went wrong",
        errors = [] as any[],
        stack = ""
    ) {
        super(message);
        this.statusCode = statusCode;
        this.data = null; //check what is in this data field
        this.message = message;
        this.success = false; //ensures that success flag is not shown, as we are handling the errors here
        this.errors = errors;

        // if (stack) {
        //     this.stack = stack;
        // } else {
        //     Error.captureStackTrace(this, this.constructor);
        // }
    }
}

export { apiError };