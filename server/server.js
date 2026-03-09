import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import morgan from 'morgan';
import mongoose from 'mongoose';
import connectMongo from './config/database.js';
import { initializeEmailTransporter } from './config/email.js';
import { startReminderService } from './services/reminderService.js';
import rateLimiter from './middleware/rateLimiter.js';
import errorHandler from './middleware/errorHandler.js';
import notFound from './middleware/notFound.js';
import routes from './routes/index.js';

dotenv.config();

const app = express();
const port = process.env.PORT || '5000';

app.use(helmet());

const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173'];
app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
} else {
    app.use(morgan('combined'));
}

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(rateLimiter);
app.use('/api', routes);
app.use(notFound);
app.use(errorHandler);

const startServer = async () => {
    try {
        await connectMongo();
        initializeEmailTransporter();
        startReminderService();

        const server = app.listen(port, () => {
            console.log(`Server running on http://localhost:${port}`);
            console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
        });

        const gracefulShutdown = async (signal) => {
            console.log(`\n${signal} received. Starting graceful shutdown...`);

            server.close(async () => {
                console.log('HTTP server closed');

                try {
                    await mongoose.disconnect();
                    console.log('MongoDB connection closed');
                    process.exit(0);
                } catch (error) {
                    console.error('Error during shutdown:', error.message);
                    process.exit(1);
                }
            });

            setTimeout(() => {
                console.error('Forced shutdown after timeout');
                process.exit(1);
            }, 10000);
        };

        process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
        process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    } catch (error) {
        console.error(`Failed to start server: ${error.message}`);
        process.exit(1);
    }
};

startServer();
