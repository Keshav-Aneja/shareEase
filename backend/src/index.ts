import dbConnect from './utils/dbConnect';
import { app } from './app';

const startServer = async () => {
    try {
        await dbConnect();

        app.listen(process.env.PORT || 8080, () => {
            console.log("Server started at port: ", process.env.PORT || 8080);
        })

        app.on('error', (error) => {
            console.log("Database connected but, server failed to start: ", error);
        })
    } catch (error) {
        console.log("Database connection failed: ", error);
    }
}
startServer();