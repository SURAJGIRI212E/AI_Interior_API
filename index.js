import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import authRoutes from './routes/auth.routes.js';
import designRoutes from './routes/design.routes.js';
import globalErrorHandler from './middlewares/error.middleware.js';
import CustomError from './utils/CustomError.js';
import dotenv from 'dotenv';
import prisma from './config/db.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true
}));
// IMPORTANT: Increase limit for base64 or large payloads if not using Cloudinary URL directly
app.use(express.json({ limit: '10mb' })); 
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/design', designRoutes);

app.all(/(.*)/, (req, res, next) => {
  next(new CustomError(`${req.originalUrl} not found`, 404));
});

// Global error handler
app.use(globalErrorHandler);


// Test database connection
const connectDB = async () => {
    try {
        const dblog=await prisma.$connect();
        console.log(dblog)
        console.log(' Database connected successfully');
    } catch (error) {
        console.error(' Database connection failed:', error);
        process.exit(1);
    }
};

// Start server
const startServer = async () => {
    await connectDB();
    
    app.listen(PORT, () => {
        console.log(` Server is running on port ${PORT}`);
    });
};

startServer();

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.log('UNHANDLED REJECTION! 💥 Shutting down...');
    console.log(err.name, err.message);
    process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
    console.log(err.name, err.message);
    process.exit(1);
});

