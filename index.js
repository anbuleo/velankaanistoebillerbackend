import express from 'express';
import cors from 'cors'
import bodyparser from 'body-parser';
import env from 'dotenv';
import router from './src/routes/index.js'
import cron from 'node-cron'
import billController from './src/controllers/saleandprint.controller.js'

env.config();



const app = express()
app.use(express.json())
app.use(bodyparser.json())
let urlFront = [
    process.env.FrontEnd,
    'https://dileo.co.in',
    'https://www.dileo.co.in',
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    'http://localhost:5177',
    'http://localhost:4173'
].filter(Boolean);


const corsOptions = {
    origin: urlFront,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}
app.use(cors(corsOptions))


let PORT = process.env.PORT;

app.use('/api', router)
cron.schedule('0 0 1 1,7 *', async () => {
    console.log('Running balance sheet reset process...');
    await billController.resetBalanceSheet();
});


app.listen(PORT, () => console.log(`App listening ${PORT}`))

app.use((err, req, res, next) => {
    console.error('SERVER ERROR:', err.message)
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal server Error';
    return res.status(statusCode).json({
        success: false,
        statusCode,
        message
    })
})