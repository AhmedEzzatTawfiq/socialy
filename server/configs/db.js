import mongoose from "mongoose";

const connectDB = async () => {
    try {
        mongoose.connection.on("connected", () => console.log("Database connected"))
        mongoose.connection.on("disconnected", () => console.log("MongoDB disconnected"))

        await mongoose.connect(`${process.env.MONGO_URL}/Cluster0`, {
            connectTimeoutMS: 10000,
            serverSelectionTimeoutMS: 5000,
        })

        console.log("MongoDB connection established successfully")
    } catch (error) {
        console.error("Failed to connect to MongoDB:", error.message)
    
    }
}

export default connectDB