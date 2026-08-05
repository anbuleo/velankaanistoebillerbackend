import express from 'express';
import cors from 'cors';
import bodyparser from 'body-parser';
import env from 'dotenv';
import router from './src/routes/index.js';
import cron from 'node-cron';
import billController from './src/controllers/saleandprint.controller.js';

env.config();

const app = express();

app.use(express.json());
app.use(bodyparser.json());

// Enable CORS for Vercel Frontend & Local Development
app.use(cors({
    origin: '*', // Allow Vercel frontend deployments & local dev
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.get('/', (req, res) => {
    res.status(200).json({ status: 'API Active', message: 'Velankanni Biller Backend Active' });
});

app.use('/api', router);

// Cron job for balance sheet reset
cron.schedule('0 0 1 1,7 *', async () => {
    console.log('Running balance sheet reset process...');
    await billController.resetBalanceSheet();
});

// Centralized Error Handling Middleware
app.use((err, req, res, next) => {
    console.error('SERVER ERROR:', err.message);
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal server Error';
    return res.status(statusCode).json({
        success: false,
        statusCode,
        message
    });
});

const PORT = process.env.PORT || 5001;

// Only start standalone HTTP server if not running in Vercel Serverless environment
if (process.env.VERCEL !== '1') {
    app.listen(PORT, () => console.log(`App listening on port ${PORT}`));
}

// Export Express app for Vercel Serverless execution
export default app;