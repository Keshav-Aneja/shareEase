import mongoose from "mongoose";

export default async function dbConnect() {
    try {
        if (mongoose.connection.readyState >= 1) {
            return;
        }
        const connectionInstance = await mongoose.connect(`${process.env.MONGO_URI}/${process.env.DB_NAME}`);
        
        console.log("╔═════════════════════════════════════════════════════════════════════════╗");
        console.log("║                     Database connected successfully                     ║");
        console.log(`║    Database connected at: ${connectionInstance.connection.host}    ║`);
        console.log("╚═════════════════════════════════════════════════════════════════════════╝");
    } catch (error) {
        console.log("MongoDB connection failed:", error);
        process.exit(1);
    }
}
