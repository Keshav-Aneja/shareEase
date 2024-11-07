declare namespace NodeJS {
    interface ProcessEnv {
        PORT:number;
        CORS_ORIGIN:any;
        MONGO_URI:string;
        DB_NAME:string
        ACCESS_TOKEN_SECRET:string
        ACCESS_TOKEN_EXPIRY:string
        REFRESH_TOKEN_SECRET:string
        REFRESH_TOKEN_EXPIRY:string
    }
}