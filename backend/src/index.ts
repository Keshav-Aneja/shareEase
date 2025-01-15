import dbConnect from './utils/dbConnect';
import { app } from './app';
import logger from './utils/logger';

const startServer = async () => {
    try {
        await dbConnect();
        logger.info("Database Connected");
        app.listen(process.env.PORT || 8080, () => {
            logger.info(`Server started at port: ${process.env.PORT || 8080}`);
        })
        app.on('error', (error) => {
            logger.error("Database connected but, server failed to start: ", error);
        })
    } catch (error) {
        logger.error("Database connection failed: ", error);
    }
}
startServer();