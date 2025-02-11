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
let urlFront = [process.env.FrontEnd]

const corsOptions = {
    origin: urlFront, // Allow only specific origin
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allow specific methods if needed
  allowedHeaders: ['Content-Type', 'Authorization'],// Whitelist the domains you want to allow
}
app.use(cors(corsOptions))


let PORT = process.env.PORT;

app.use('/api',router)
cron.schedule('0 0 1 1,7 *', async () => {
    console.log('Running balance sheet reset process...');
    await billController.resetBalanceSheet();
});


app.listen(PORT, ()=>console.log(`App listening ${PORT}`))

app.use((err,req,res,next)=>{
    // console.log(err.message)
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal server Error';
    return res.status(statusCode).json({
        success : false,
        statusCode,
        message
    })
})